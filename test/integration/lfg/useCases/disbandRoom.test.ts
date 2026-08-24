import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { disbandRoom } from "../../../../src/application/lfg/useCases/disbandRoom.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(disbandRoom.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("deletes the room identified by code", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.disbandRoom(GUILD_ID, "room");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_DISBANDED,
            value: { userId: OWNER.id, code: "room" },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([]);
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.disbandRoom(GUILD_ID, "missing");

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });
});
