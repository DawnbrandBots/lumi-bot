import type { AutocompleteInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { ESearchResultKind } from "../../../../../../src/application/search/types.ts";
import type { TSearchResult } from "../../../../../../src/application/search/types.ts";
import type { TSearchIndexEntry } from "../../../../../../src/domain/search/types.ts";
import { autocompleteListableItem } from "../../../../../../src/presentation/discord/services/bazaar/autocompleteListableItem.ts";
import { DISCIPLE } from "../../mappers/search/disciple.fixtures.ts";
import { WEAPON } from "../../mappers/search/weapon.fixtures.ts";

const interaction = {
    options: { getFocused: vi.fn().mockReturnValue("royal") },
} as unknown as AutocompleteInteraction;

describe(autocompleteListableItem.name, () => {
    test("returns variants of eligible weapons and eligible souls", async () => {
        const weaponSearchItem = {
            kind: "weapon",
            id: "weapon-1",
            name: "Royal Sword",
            aliases: [],
        } satisfies TSearchIndexEntry<"weapon">;
        const discipleSearchItem = {
            kind: "disciple",
            id: "disciple-1",
            name: "Lyn",
            aliases: [],
        } satisfies TSearchIndexEntry<"disciple">;
        const searchItems = [weaponSearchItem, discipleSearchItem];
        const suggestSearchResults = vi.fn().mockResolvedValue(searchItems);
        const weaponResult = {
            kind: ESearchResultKind.SUCCESS,
            value: { kind: "weapon", entity: { ...WEAPON, id: "weapon-1", level: 8 }, searchItem: weaponSearchItem },
        } satisfies TSearchResult<"weapon">;
        const discipleResult = {
            kind: ESearchResultKind.SUCCESS,
            value: {
                kind: "disciple",
                entity: { ...DISCIPLE, id: "disciple-1", isBattlePassDisciple: true },
                searchItem: discipleSearchItem,
            },
        } satisfies TSearchResult<"disciple">;
        const resolveSearchInput = vi.fn((name: string) =>
            Promise.resolve(name === "Royal Sword" ? weaponResult : discipleResult),
        );

        const choices = await autocompleteListableItem(
            { useCases: { search: { resolveSearchInput, suggestSearchResults } } },
            interaction,
        );

        expect(choices).toEqual([
            { name: "Royal Sword (HP)", value: "w:weapon-1:HP" },
            { name: "Royal Sword (NEUTRAL)", value: "w:weapon-1:NEUTRAL" },
            { name: "Royal Sword (ATK)", value: "w:weapon-1:ATK" },
            { name: "Lyn Soul", value: "s:disciple-1" },
        ]);
    });

    test("omits ineligible and unrelated search results", async () => {
        const weaponSearchItem = {
            kind: "weapon",
            id: "weapon-1",
            name: "Iron Sword",
            aliases: [],
        } satisfies TSearchIndexEntry<"weapon">;
        const searchItems = [weaponSearchItem];
        const result = {
            kind: ESearchResultKind.SUCCESS,
            value: { kind: "weapon", entity: { ...WEAPON, id: "weapon-1", level: 5 }, searchItem: weaponSearchItem },
        } satisfies TSearchResult<"weapon">;
        const choices = await autocompleteListableItem(
            {
                useCases: {
                    search: {
                        suggestSearchResults: vi.fn().mockResolvedValue(searchItems),
                        resolveSearchInput: vi.fn().mockResolvedValue(result),
                    },
                },
            },
            interaction,
        );

        expect(choices).toEqual([]);
    });
});
