import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { disband } from "../../../../src/application/lfg/useCases/disband.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(disband.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("deletes the room identified by code", async () => {
        await lfg.useCases.create(GUILD_ID, OWNER, "room");
        await lfg.useCases.move(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.disband(GUILD_ID, "room");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_DISBANDED,
            value: { userId: OWNER.id, code: "room" },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([]);
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.disband(GUILD_ID, "missing");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });
});
