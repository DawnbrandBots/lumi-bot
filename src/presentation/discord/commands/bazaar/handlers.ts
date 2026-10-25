import { MessageFlags } from "discord.js";
import type { PickDeep } from "type-fest";
import { EListingSide } from "../../../../domain/bazaar/models/listing.types.ts";
import { createNegativeMessage } from "../../message.ts";
import { bazaarResponder } from "../../responders/bazaar.ts";
import { runWithGuild } from "../../utils/runWithGuild.ts";
import { runWithAdminPermission } from "../admin/runWithAdminPermission.ts";
import type { TCommandDependencies, TCommandRunHandler, TGuildCommandInteraction } from "../types.ts";
import {
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_PAGE_OPTION_NAME,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
    BAZAAR_USER_OPTION_NAME,
} from "./constants.ts";
import { parseListableItemValue } from "./itemValue.ts";

type TListingSide = (typeof EListingSide)[keyof typeof EListingSide];
type TBazaarCommandHandler = (
    dependencies: PickDeep<TCommandDependencies, "useCases.bazaar">,
    interaction: Parameters<TCommandRunHandler>[1],
) => ReturnType<TCommandRunHandler>;

async function replyWithInvalidItem(interaction: TGuildCommandInteraction): Promise<void> {
    await interaction.reply({
        ...createNegativeMessage({ embed: { description: "Select an item from the autocomplete suggestions." } }),
        flags: [MessageFlags.Ephemeral],
    });
}

function runBazaarWithGuild(
    interaction: Parameters<TCommandRunHandler>[1],
    run: (interaction: TGuildCommandInteraction) => Promise<void>,
): ReturnType<TCommandRunHandler> {
    return runWithGuild({
        interaction,
        notInGuildMessageEmbeddescription: "The Bazaar is only available in servers.",
        run,
    });
}

export function createUpsertListingHandler(side: TListingSide, managed = false): TBazaarCommandHandler {
    return (dependencies, interaction) =>
        runBazaarWithGuild(interaction, async (guildInteraction) => {
            const item = parseListableItemValue(guildInteraction.options.getString(BAZAAR_ITEM_OPTION_NAME, true));
            if (!item) {
                await replyWithInvalidItem(guildInteraction);
                return;
            }
            const quantity = guildInteraction.options.getInteger(BAZAAR_QUANTITY_OPTION_NAME, false);
            const price = guildInteraction.options.getInteger(BAZAAR_PRICE_OPTION_NAME, false);
            const result = await dependencies.useCases.bazaar.upsertListing({
                guildId: guildInteraction.guildId,
                ownerId: managed
                    ? guildInteraction.options.getUser(BAZAAR_USER_OPTION_NAME, true).id
                    : guildInteraction.user.id,
                side,
                item,
                ...(quantity === null ? {} : { quantity: quantity === 0 ? null : quantity }),
                ...(price === null ? {} : { unitPrice: price === 0 ? null : price }),
            });
            await bazaarResponder({ interaction: guildInteraction, result });
        });
}

export function createDeleteListingHandler(side: TListingSide, managed = false): TBazaarCommandHandler {
    return (dependencies, interaction) =>
        runBazaarWithGuild(interaction, async (guildInteraction) => {
            const item = parseListableItemValue(guildInteraction.options.getString(BAZAAR_ITEM_OPTION_NAME, true));
            if (!item) {
                await replyWithInvalidItem(guildInteraction);
                return;
            }
            const result = await dependencies.useCases.bazaar.deleteListing({
                guildId: guildInteraction.guildId,
                ownerId: managed
                    ? guildInteraction.options.getUser(BAZAAR_USER_OPTION_NAME, true).id
                    : guildInteraction.user.id,
                side,
                item,
            });
            await bazaarResponder({ interaction: guildInteraction, result });
        });
}

export function createListListingsHandler(side: TListingSide): TBazaarCommandHandler {
    return (dependencies, interaction) =>
        runBazaarWithGuild(interaction, async (guildInteraction) => {
            const itemValue = guildInteraction.options.getString(BAZAAR_ITEM_OPTION_NAME, false);
            const item = itemValue ? parseListableItemValue(itemValue) : undefined;
            if (itemValue && !item) {
                await replyWithInvalidItem(guildInteraction);
                return;
            }
            const ownerId = guildInteraction.options.getUser(BAZAAR_USER_OPTION_NAME, false)?.id;
            const filter = {
                guildId: guildInteraction.guildId,
                side,
                ...(ownerId ? { ownerId } : {}),
                ...(item ? { item } : {}),
            };
            const result = await dependencies.useCases.bazaar.listListings(filter);
            await bazaarResponder({
                filter,
                interaction: guildInteraction,
                page: guildInteraction.options.getInteger(BAZAAR_PAGE_OPTION_NAME, false) ?? 1,
                result,
            });
        });
}

export function withBazaarManagePermission(command: TBazaarCommandHandler): TBazaarCommandHandler {
    return (dependencies, interaction) =>
        runWithAdminPermission(interaction, async (guildInteraction) => {
            await command(dependencies, guildInteraction);
        });
}

export const upsertPurchaseListing = createUpsertListingHandler(EListingSide.PURCHASE);
export const upsertSaleListing = createUpsertListingHandler(EListingSide.SALE);
export const deletePurchaseListing = createDeleteListingHandler(EListingSide.PURCHASE);
export const deleteSaleListing = createDeleteListingHandler(EListingSide.SALE);
export const listPurchaseListings = createListListingsHandler(EListingSide.PURCHASE);
export const listSaleListings = createListListingsHandler(EListingSide.SALE);
export const upsertManagedPurchaseListing = createUpsertListingHandler(EListingSide.PURCHASE, true);
export const upsertManagedSaleListing = createUpsertListingHandler(EListingSide.SALE, true);
export const deleteManagedPurchaseListing = createDeleteListingHandler(EListingSide.PURCHASE, true);
export const deleteManagedSaleListing = createDeleteListingHandler(EListingSide.SALE, true);
