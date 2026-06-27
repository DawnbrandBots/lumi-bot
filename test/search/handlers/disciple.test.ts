import { describe, expect, test } from "vitest";
import { getDiscipleBaseStatsTable } from "../../../src/search/handlers/disciple.ts";

describe(getDiscipleBaseStatsTable.name, () => {
    test("returns stats for level 1 and the relevant levels", () => {
        const discipleStats = {
            getHp: ({ level }) => level * 10,
            getAtk: ({ level }) => level * 5,
        } satisfies Parameters<typeof getDiscipleBaseStatsTable>[0];

        expect(getDiscipleBaseStatsTable(discipleStats)).toEqual([
            ["Level", 1, 8, 9, 10, 11],
            ["HP", 80, 136, 144, 152, 160],
            ["Atk", 42, 71, 75, 79, 84],
        ]);
    });
});
