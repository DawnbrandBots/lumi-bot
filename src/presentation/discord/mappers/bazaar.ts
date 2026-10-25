import { ActionRowBuilder, ButtonBuilder, ButtonStyle, time, userMention } from "discord.js";
import { EBazaarResultKind, type TBazaarResult } from "../../../application/bazaar/types.ts";
import type { TBazaarUseCaseArgs } from "../../../application/bazaar/useCases.types.ts";
import type { TListableItem } from "../../../domain/bazaar/models/listableItem.types.ts";
import type { IListing } from "../../../domain/bazaar/models/listing.types.ts";
import { BAZAAR_LIST_PAGE_SIZE } from "../commands/bazaar/constants.ts";
import { formatBazaarListPageValue, formatBazaarPageModalValue } from "../commands/bazaar/listPageValue.ts";
import { createNegativeMessage, createNeutralMessage, createPositiveMessage } from "../message.ts";

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
    const pageCount = getBazaarPageCount(listings.length);
    const pageListings = listings.slice(
        (requestedPage - 1) * BAZAAR_LIST_PAGE_SIZE,
        requestedPage * BAZAAR_LIST_PAGE_SIZE,
    );
    if (!isBazaarListPageInRange(listings.length, requestedPage)) {
        return createNegativeMessage({
            embed: {
                description: `Page ${requestedPage} does not exist. There are ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
            },
        });
    }
    const components = [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(formatBazaarListPageValue({ filter, page: Math.max(1, requestedPage - 1) }))
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(requestedPage === 1),
            new ButtonBuilder()
                .setCustomId(formatBazaarPageModalValue({ filter, page: requestedPage }))
                .setLabel("Go to page")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(formatBazaarListPageValue({ filter, page: requestedPage + 1 }))
                .setLabel("➡️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(requestedPage === pageCount),
        ),
    ];
    return createNeutralMessage({
        embed: {
            title: "Bazaar listings",
            description: pageListings.length ? pageListings.map(formatListing).join("\n\n") : "No matching listings.",
            footer: {
                text: `Page ${requestedPage}/${pageCount} · ${listings.length} listing${listings.length === 1 ? "" : "s"}`,
            },
        },
        components,
    });
}

export function getBazaarPageCount(listingCount: number): number {
    return Math.max(1, Math.ceil(listingCount / BAZAAR_LIST_PAGE_SIZE));
}

export function isBazaarListPageInRange(listingCount: number, page: number): boolean {
    return Number.isSafeInteger(page) && page >= 1 && page <= getBazaarPageCount(listingCount);
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
