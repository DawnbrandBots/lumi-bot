import { describe, expect, test } from "vitest";
import SpellShape from "../../../src/game/rules/spellShape.ts";

describe(SpellShape.isAoe.name, () => {
    test.each([
        ["............X............", false],
        ["...........OX............", true],
        ["..........OOXOO..........", true],
    ])("tiles %s => %s", (tiles, expected) => {
        expect(SpellShape.isAoe({ tiles })).toBe(expected);
    });
});
