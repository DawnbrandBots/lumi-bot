import { describe, expect, test } from "vitest";
import { EUnitKind, EUnitRole } from "../../../../../../src/domain/game/models/unit.types.ts";
import { EUnitSelectorProperty } from "../../../../../../src/domain/game/models/unitSelector.types.ts";
import {
    describeUnitSelector,
    type TUnitSelectorDescriptionInput,
} from "../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions/unitSelectorDescriptions.ts";

describe(describeUnitSelector.name, () => {
    test.each<{
        selector: TUnitSelectorDescriptionInput;
        expected: string;
    }>([
        {
            selector: { property: EUnitSelectorProperty.KIND, value: EUnitKind.DISCIPLE },
            expected: "disciples",
        },
        {
            selector: { property: EUnitSelectorProperty.KIND, value: EUnitKind.MINION },
            expected: "minions",
        },
        {
            selector: { property: EUnitSelectorProperty.ROLE, value: EUnitRole.LIGHT },
            expected: "Light units",
        },
        {
            selector: { property: EUnitSelectorProperty.ROLE, value: EUnitRole.SHADOW },
            expected: "Shadow units",
        },
        {
            selector: { property: EUnitSelectorProperty.MOVEMENT_TYPE, value: { name: "Flying" } },
            expected: "Flying units",
        },
        {
            selector: { property: EUnitSelectorProperty.WEAPON_TYPE, value: { name: "Bow" } },
            expected: "Bow units",
        },
        {
            selector: { property: EUnitSelectorProperty.WEAPON_RANGE, value: 2 },
            expected: "units with a range of 2",
        },
    ])("describes $selector", ({ selector, expected }) => {
        expect(describeUnitSelector(selector)).toBe(expected);
    });
});
