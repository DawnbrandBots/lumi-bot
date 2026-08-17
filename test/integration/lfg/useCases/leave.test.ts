import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { leave } from "../../../../src/application/lfg/useCases/leave.ts";
import { ELfgPlayerRemovalKind } from "../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { GUILD_ID, OWNER, PLAYER_1, PLAYER_2, useLfgUseCases } from "./shared.ts";

describe(leave.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("deletes the room when the last player leaves", async () => {
        await lfg.useCases.create(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.leave(GUILD_ID, OWNER);

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_LEFT,
            value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: OWNER.id, code: "room" },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([]);
    });

    test("transfers ownership to the earliest remaining player", async () => {
        await lfg.useCases.create(GUILD_ID, OWNER, "room");
        await lfg.useCases.move(GUILD_ID, PLAYER_1, "room");
        await lfg.useCases.move(GUILD_ID, PLAYER_2, "room");

        const response = await lfg.useCases.leave(GUILD_ID, OWNER);

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_LEFT,
            value: {
                kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                userId: OWNER.id,
                code: "room",
                newOwnerId: PLAYER_1.id,
            },
        });
        expect((await lfg.getRooms(GUILD_ID))[0]).toEqual({
            code: "room",
            ownerId: PLAYER_1.id,
            playerIds: [PLAYER_1.id, PLAYER_2.id],
        });
    });

    test("rejects users who are not in a room", async () => {
        const response = await lfg.useCases.leave(GUILD_ID, OWNER);

        expect(response).toEqual({ kind: ELfgResultKind.NOT_IN_A_ROOM });
    });
});
