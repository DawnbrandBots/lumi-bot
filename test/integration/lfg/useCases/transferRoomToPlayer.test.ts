import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { transferRoomToPlayer } from "../../../../src/application/lfg/useCases/transferRoomToPlayer.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(transferRoomToPlayer.name, () => {
    const lfg = useLfgUseCases();

    test("transfers ownership in the room identified by code", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });

        const response = await lfg.useCases.transferRoomToPlayer({ guildId: GUILD_ID, code: "room", target: PLAYER_1 });

        expect(response).toMatchObject({
            kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
            value: {
                userId: OWNER.id,
                targetId: PLAYER_1.id,
                room: {
                    code: "room",
                    ownerId: PLAYER_1.id,
                    playerIds: [OWNER.id, PLAYER_1.id],
                },
            },
        });
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.transferRoomToPlayer({
            guildId: GUILD_ID,
            code: "missing",
            target: PLAYER_1,
        });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });

    test("rejects targets outside the room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.transferRoomToPlayer({ guildId: GUILD_ID, code: "room", target: PLAYER_1 });

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });

    test("rejects transferring ownership to the current owner", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.transferRoomToPlayer({ guildId: GUILD_ID, code: "room", target: OWNER });

        expect(response).toEqual({
            kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
            value: { userId: OWNER.id, code: "room" },
        });
    });
});
