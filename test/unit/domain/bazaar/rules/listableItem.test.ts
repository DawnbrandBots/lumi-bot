import { describe, expect, test } from "vitest";
import {
    isDiscipleWithListableSoul,
    isListableWeaponLevel,
} from "../../../../../src/domain/bazaar/rules/listableItem.ts";

describe(isListableWeaponLevel.name, () => {
    test.each([
        [1, false],
        [2, false],
        [3, false],
        [4, true],
        [5, false],
        [6, true],
        [7, true],
        [8, true],
    ])("$0 => $1", (input, expected) => {
        expect(isListableWeaponLevel(input)).toBe(expected);
    });
});

describe(isDiscipleWithListableSoul.name, () => {
    test.each([
        [{ isBattlePassDisciple: true }, true],
        [{ isBattlePassDisciple: false }, false],
    ])("$0 => $1", (input, expected) => {
        expect(isDiscipleWithListableSoul(input)).toBe(expected);
    });
});
