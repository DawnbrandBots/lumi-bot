import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { transferOwnedRoomToPlayer } from "../../../../src/application/lfg/useCases/transferOwnedRoomToPlayer.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(transferOwnedRoomToPlayer.name, () => {
    const lfg = useLfgUseCases();

    test("transfers ownership to another room player", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.transferOwnedRoomToPlayer({
            guildId: GUILD_ID,
            owner: OWNER,
            target: PLAYER_1,
        });

        expect(response.kind).toBe(ELfgResultKind.OWNERSHIP_TRANSFERRED);
        expect((await lfg.getRooms(GUILD_ID))[0]?.ownerId).toBe(PLAYER_1.id);
    });

    test("rejects targets outside the room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.transferOwnedRoomToPlayer({
            guildId: GUILD_ID,
            owner: OWNER,
            target: PLAYER_1,
        });

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });

    test("rejects self-transfer", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.transferOwnedRoomToPlayer({
            guildId: GUILD_ID,
            owner: OWNER,
            target: OWNER,
        });

        expect(response).toEqual({
            kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
            value: { userId: OWNER.id, code: "room" },
        });
    });

    test("rejects non-owners", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.transferOwnedRoomToPlayer({
            guildId: GUILD_ID,
            owner: PLAYER_1,
            target: OWNER,
        });

        expect(response).toEqual({ kind: ELfgResultKind.NOT_ROOM_OWNER });
    });
});
