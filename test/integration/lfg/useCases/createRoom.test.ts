import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { createRoom } from "../../../../src/application/lfg/useCases/createRoom.ts";
import { FRIEND_BATTLE_CODE_MAXIMUM_LENGTH } from "../../../../src/domain/game/constants.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(createRoom.name, () => {
    const lfg = useLfgUseCases();

    test("creates a room with the creator as owner", async () => {
        const response = await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "AbC" });

        expect(response).toMatchObject({
            kind: ELfgResultKind.ROOM_CREATED,
            value: {
                userId: OWNER.id,
                room: { code: "AbC", ownerId: OWNER.id, playerIds: [OWNER.id] },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([{ code: "AbC", ownerId: OWNER.id, playerIds: [OWNER.id] }]);
    });

    test("rejects duplicate room codes in the same guild", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: PLAYER_1, code: "room" });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_ALREADY_EXISTS,
            value: { code: "room" },
        });
    });

    test("allows the same exact room code in another guild", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });

        const response = await lfg.useCases.createRoom({ guildId: OTHER_GUILD_ID, owner: OWNER, code: "room" });

        expect(response.kind).toBe(ELfgResultKind.ROOM_CREATED);
        expect(await lfg.getRooms(GUILD_ID)).toHaveLength(1);
        expect(await lfg.getRooms(OTHER_GUILD_ID)).toHaveLength(1);
    });

    test("rejects invalid room code length", async () => {
        const response = await lfg.useCases.createRoom({
            guildId: GUILD_ID,
            owner: OWNER,
            code: "x".repeat(FRIEND_BATTLE_CODE_MAXIMUM_LENGTH + 1),
        });

        expect(response).toEqual({ kind: ELfgResultKind.INVALID_ROOM_CODE });
    });

    test("rejects users already in a room", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room-1" });

        const response = await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room-2" });

        expect(response).toEqual({
            kind: ELfgResultKind.ALREADY_IN_A_ROOM,
            value: { userId: OWNER.id },
        });
    });
});
