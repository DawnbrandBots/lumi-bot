import { ActionRowBuilder, ButtonBuilder, ButtonStyle, time, userMention } from "discord.js";
import { EBazaarResultKind, type TBazaarResult } from "../../../application/bazaar/types.ts";
import type { TBazaarUseCaseArgs } from "../../../application/bazaar/useCases.types.ts";
import type { TListableItem } from "../../../domain/bazaar/models/listableItem.types.ts";
import type { IListing } from "../../../domain/bazaar/models/listing.types.ts";
import { createNegativeMessage, createNeutralMessage, createPositiveMessage } from "../message.ts";
import { BAZAAR_LIST_PAGE_SIZE } from "../commands/bazaar/constants.ts";
import { formatBazaarListPageValue } from "../commands/bazaar/listPageValue.ts";

function formatItem(item: TListableItem): string {
    switch (item.kind) {
        case "weapon":
            return `${item.weapon.name} (${item.variant})`;
        case "soul":
            return `${item.disciple.name} Soul`;
    }
}

function formatListing(listing: IListing): string {
    const quantity = listing.quantity === null ? "flexible quantity" : `×${listing.quantity.toLocaleString()}`;
    const price = listing.unitPrice === null ? "negotiable" : `${listing.unitPrice.toLocaleString()} gold each`;
    return `**${formatItem(listing.item)}** — ${quantity} · ${price}\n${userMention(listing.ownerId)} · updated ${time(listing.updatedAt, "R")}`;
}

export function mapBazaarListResultToMessage(
    listings: readonly IListing[],
    filter: TBazaarUseCaseArgs["listListings"],
    requestedPage: number,
) {
    const pageCount = Math.max(1, Math.ceil(listings.length / BAZAAR_LIST_PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount - 1);
    const pageListings = listings.slice(page * BAZAAR_LIST_PAGE_SIZE, (page + 1) * BAZAAR_LIST_PAGE_SIZE);
    const components =
        pageCount > 1
            ? [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                      new ButtonBuilder()
                          .setCustomId(formatBazaarListPageValue({ filter, page: page - 1 }))
                          .setLabel("Previous")
                          .setStyle(ButtonStyle.Secondary)
                          .setDisabled(page === 0),
                      new ButtonBuilder()
                          .setCustomId(formatBazaarListPageValue({ filter, page: page + 1 }))
                          .setLabel("Next")
                          .setStyle(ButtonStyle.Secondary)
                          .setDisabled(page === pageCount - 1),
                  ),
              ]
            : [];
    return createNeutralMessage({
        embed: {
            title: "Bazaar listings",
            description: pageListings.length ? pageListings.map(formatListing).join("\n\n") : "No matching listings.",
            footer: {
                text: `Page ${page + 1}/${pageCount} · ${listings.length} listing${listings.length === 1 ? "" : "s"}`,
            },
        },
        components,
    });
}

export function mapBazaarMutationResultToMessage(
    result: Exclude<TBazaarResult, { kind: EBazaarResultKind.LISTINGS_LISTED }>,
) {
    switch (result.kind) {
        case EBazaarResultKind.LISTING_CREATED:
            return createPositiveMessage({
                embed: { description: `Created the **${formatItem(result.value.listing.item)}** listing.` },
            });
        case EBazaarResultKind.LISTING_UPDATED:
            return createPositiveMessage({
                embed: { description: `Updated the **${formatItem(result.value.listing.item)}** listing.` },
            });
        case EBazaarResultKind.LISTING_UNCHANGED:
            return createNeutralMessage({
                embed: { description: `The **${formatItem(result.value.listing.item)}** listing is unchanged.` },
            });
        case EBazaarResultKind.LISTING_DELETED:
            return createPositiveMessage({
                embed: { description: `Deleted the **${formatItem(result.value.listing.item)}** listing.` },
            });
        case EBazaarResultKind.LISTING_NOT_FOUND:
            return createNegativeMessage({ embed: { description: "No matching listing was found." } });
        case EBazaarResultKind.INVALID_ITEM:
            return createNegativeMessage({ embed: { description: "That item cannot be listed in the Bazaar." } });
        case EBazaarResultKind.INVALID_QUANTITY:
            return createNegativeMessage({ embed: { description: "That quantity is invalid." } });
        case EBazaarResultKind.INVALID_PRICE:
            return createNegativeMessage({ embed: { description: "That price is invalid." } });
    }
}
