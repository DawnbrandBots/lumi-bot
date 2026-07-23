import { describe, expect, test } from "vitest";
import mapDiscipleToMessage, { getDiscipleBaseStatsTable } from "../../../../src/search/mappers/disciple.ts";
import { DISCIPLE } from "./disciple.fixtures.ts";

describe(getDiscipleBaseStatsTable.name, () => {
    test("returns stats for level 1 and the relevant levels", () => {
        const discipleStats = {
            getHp: ({ level }) => level * 10,
            getAtk: ({ level }) => level * 5,
        } satisfies Parameters<typeof getDiscipleBaseStatsTable>[0];

        expect(getDiscipleBaseStatsTable(discipleStats)).toEqual([
            ["Level", 1, 8, 9, 10, 11],
            ["HP", 10, 80, 90, 100, 110],
            ["Atk", 5, 40, 45, 50, 55],
        ]);
    });
});

describe(mapDiscipleToMessage.name, () => {
    test.each([
        ["with linked shadow music", DISCIPLE],
        [
            "with an unlinked shadow music",
            {
                ...DISCIPLE,
                shadowMusic: {
                    ...DISCIPLE.shadowMusic,
                    url: null,
                },
            },
        ],
    ])("%s", (_, disciple) => {
        expect(mapDiscipleToMessage(disciple)).toMatchSnapshot();
    });
});
