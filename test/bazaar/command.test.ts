import type { EntityManager } from "@mikro-orm/sqlite";
import {
    MessageFlags,
    type AutocompleteInteraction,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionResponse,
} from "discord.js";
import { describe, expect, test, vi } from "vitest";
import {
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_LIST_SUBCOMMAND_NAME,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
    BAZAAR_SELL_SUBCOMMAND_NAME,
    BAZAAR_VARIANT_OPTION_NAME,
} from "../../src/bazaar/constants.ts";
import { getBazaarCommand } from "../../src/bazaar/command.ts";
import type { BazaarFeature } from "../../src/bazaar/feature.ts";
import { EBazaarFeatureReturnKind } from "../../src/bazaar/types.ts";
import type { Weapon } from "../../src/game/models/weapon.ts";
import type { ISearchEngine, ISearchItem } from "../../src/search/types.ts";

const USER = { id: "seller" };
const REPLY = {} as InteractionResponse<boolean>;
const WEAPON = { id: "ROYAL_SWORD_PLUS", name: "Royal Sword +", level: 8 } as Weapon;
const SEARCH_ITEM: ISearchItem & { kind: "weapon" } = {
    id: WEAPON.id,
    name: WEAPON.name,
    kind: "weapon",
    aliases: [WEAPON.name],
};

function getMockAutocompleteInteraction(input: string, optionName: string) {
    return {
        options: {
            getFocused: (full: boolean) => (full ? { name: optionName, value: input } : input),
        },
    } as unknown as AutocompleteInteraction<CacheType>;
}

function getSellInteraction({ quantity = 2 }: { readonly quantity?: number | null } = {}) {
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        user: USER,
        options: {
            getSubcommand: vi.fn().mockReturnValue(BAZAAR_SELL_SUBCOMMAND_NAME),
            getString: vi.fn((name: string) => {
                switch (name) {
                    case BAZAAR_ITEM_OPTION_NAME:
                        return WEAPON.name;
                    case BAZAAR_VARIANT_OPTION_NAME:
                        return "ATK";
                    default:
                        return null;
                }
            }),
            getInteger: vi.fn((name: string) => {
                switch (name) {
                    case BAZAAR_QUANTITY_OPTION_NAME:
                        return quantity;
                    case BAZAAR_PRICE_OPTION_NAME:
                        return 5000;
                    default:
                        return null;
                }
            }),
        },
        reply,
    } as unknown as ChatInputCommandInteraction<CacheType>;
    return { interaction, reply };
}

function getListInteraction() {
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        user: USER,
        options: {
            getSubcommand: vi.fn().mockReturnValue(BAZAAR_LIST_SUBCOMMAND_NAME),
        },
        reply,
    } as unknown as ChatInputCommandInteraction<CacheType>;
    return { interaction, reply };
}

function getCommand() {
    const sell = vi.fn().mockResolvedValue({
        kind: EBazaarFeatureReturnKind.SALE_CREATED,
        value: {
            sale: {
                id: "12345678-1234-1234-1234-123456789abc",
                sellerId: USER.id,
                weaponId: WEAPON.id,
                weaponName: WEAPON.name,
                variant: "ATK",
                quantity: 2,
                price: 5000,
                createdAt: new Date("2026-06-12T00:00:00.000Z"),
            },
        },
    });
    const list = vi.fn().mockResolvedValue({ kind: EBazaarFeatureReturnKind.SALES_LISTED, value: { sales: [] } });
    const bazaarFeature = {
        sell,
        list,
    } as unknown as BazaarFeature;
    const gameEm = {
        findOne: vi.fn().mockResolvedValue(WEAPON),
    } as unknown as EntityManager;
    const weaponSearchEngine: ISearchEngine<ISearchItem & { kind: "weapon" }> = {
        searchOne: vi.fn().mockReturnValue(SEARCH_ITEM),
        search: vi.fn().mockReturnValue([SEARCH_ITEM]),
    };

    return {
        bazaarFeature,
        command: getBazaarCommand({ bazaarFeature, gameEm, weaponSearchEngine }),
        gameEm,
        list,
        sell,
        weaponSearchEngine,
    };
}

describe(getBazaarCommand.name, () => {
    test("routes sell to the feature and replies ephemerally", async () => {
        const { command, sell } = getCommand();
        const { interaction, reply } = getSellInteraction();

        await command.run(interaction);

        expect(sell).toHaveBeenCalledWith(USER, WEAPON, "ATK", 2, 5000);
        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: MessageFlags.Ephemeral }));
    });

    test("defaults missing sell quantity to one", async () => {
        const { command, sell } = getCommand();
        const { interaction } = getSellInteraction({ quantity: null });

        await command.run(interaction);

        expect(sell).toHaveBeenCalledWith(USER, WEAPON, "ATK", 1, 5000);
    });

    test("routes list to the feature and replies ephemerally", async () => {
        const { command, list } = getCommand();
        const { interaction, reply } = getListInteraction();

        await command.run(interaction);

        expect(list).toHaveBeenCalled();
        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: MessageFlags.Ephemeral }));
    });

    test("autocompletes item option from allowed weapon search results", async () => {
        const { command } = getCommand();

        const choices = await command.autocomplete?.(getMockAutocompleteInteraction("Royal", BAZAAR_ITEM_OPTION_NAME));

        expect(choices).toEqual([{ name: WEAPON.name, value: WEAPON.name }]);
    });

    test("returns null when autocompleting another option", async () => {
        const { command } = getCommand();

        const choices = await command.autocomplete?.(getMockAutocompleteInteraction("Atk", BAZAAR_VARIANT_OPTION_NAME));

        expect(choices).toBeNull();
    });
});
