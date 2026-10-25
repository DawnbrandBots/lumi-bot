import { ESearchResultKind } from "../../../../application/search/types.ts";
import { isDiscipleWithListableSoul, isListableWeaponLevel } from "../../../../domain/bazaar/rules/listableItem.ts";
import { EWeaponVariant } from "../../../../domain/game/models/weaponVariant.types.ts";
import { formatListableItemValue } from "../../commands/bazaar/itemValue.ts";
import type { TServiceBase } from "../types.ts";

const SEARCH_RESULT_LIMIT = 10;
const DISCORD_CHOICE_LIMIT = 25;

export const autocompleteListableItem: TServiceBase<
    "autocompleteListableItem",
    "useCases.search.resolveSearchInput" | "useCases.search.suggestSearchResults"
> = async function ({ useCases }, interaction) {
    const searchItems = await useCases.search.suggestSearchResults({
        input: interaction.options.getFocused(),
        limit: SEARCH_RESULT_LIMIT,
    });
    const resolved = await Promise.all(
        searchItems.map(async (searchItem) => ({
            searchItem,
            result: await useCases.search.resolveSearchInput(searchItem.name),
        })),
    );
    return resolved
        .flatMap(({ searchItem, result }) => {
            if (result.kind !== ESearchResultKind.SUCCESS || result.value.searchItem.id !== searchItem.id) {
                return [];
            }
            const entity = result.value.entity;
            switch (entity.kind) {
                case "weapon":
                    return isListableWeaponLevel(entity.level)
                        ? Object.values(EWeaponVariant).map((variant) => ({
                              name: `${searchItem.name} (${variant})`,
                              value: formatListableItemValue({ kind: "weapon", weaponId: searchItem.id, variant }),
                          }))
                        : [];
                case "disciple":
                    return isDiscipleWithListableSoul(entity)
                        ? [
                              {
                                  name: `${searchItem.name} Soul`,
                                  value: formatListableItemValue({ kind: "soul", discipleId: searchItem.id }),
                              },
                          ]
                        : [];
                default:
                    return [];
            }
        })
        .slice(0, DISCORD_CHOICE_LIMIT);
};
