import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { transferOwnedRoomToPlayer } from "../../../../src/application/lfg/useCases/transferOwnedRoomToPlayer.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(transferOwnedRoomToPlayer.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("transfers ownership to another room player", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.transferOwnedRoomToPlayer(GUILD_ID, OWNER, PLAYER_1);

        expect(response.kind).toBe(ELfgResultKind.OWNERSHIP_TRANSFERRED);
        expect((await lfg.getRooms(GUILD_ID))[0]?.ownerId).toBe(PLAYER_1.id);
    });

    test("rejects targets outside the room", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.transferOwnedRoomToPlayer(GUILD_ID, OWNER, PLAYER_1);

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });

    test("rejects self-transfer", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.transferOwnedRoomToPlayer(GUILD_ID, OWNER, OWNER);

        expect(response).toEqual({
            kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
            value: { userId: OWNER.id, code: "room" },
        });
    });

    test("rejects non-owners", async () => {
        await lfg.useCases.createRoom(GUILD_ID, OWNER, "room");
        await lfg.useCases.movePlayerToRoom(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.transferOwnedRoomToPlayer(GUILD_ID, PLAYER_1, OWNER);

        expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
    });
});
