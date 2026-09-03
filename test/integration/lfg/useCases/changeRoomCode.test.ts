import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { changeRoomCode } from "../../../../src/application/lfg/useCases/changeRoomCode.ts";
import { FRIEND_BATTLE_CODE_MAXIMUM_LENGTH } from "../../../../src/domain/game/constants.ts";
import { GUILD_ID, NEW_ROOM_CODE, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(changeRoomCode.name, () => {
    const lfg = useLfgUseCases();

    test("changes the room code identified by code", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "old" });
        await lfg.useCases.movePlayerToRoom({ guildId: GUILD_ID, user: PLAYER_1, code: "old" });

        const response = await lfg.useCases.changeRoomCode({ guildId: GUILD_ID, code: "old", newCode: NEW_ROOM_CODE });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_CODE_CHANGED,
            value: {
                oldCode: "old",
                newCode: NEW_ROOM_CODE,
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: NEW_ROOM_CODE, ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
        ]);
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.changeRoomCode({
            guildId: GUILD_ID,
            code: "missing",
            newCode: NEW_ROOM_CODE,
        });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });

    test("rejects invalid room code length", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "old" });

        const response = await lfg.useCases.changeRoomCode({
            guildId: GUILD_ID,
            code: "old",
            newCode: "x".repeat(FRIEND_BATTLE_CODE_MAXIMUM_LENGTH + 1),
        });

        expect(response).toEqual({ kind: ELfgResultKind.INVALID_ROOM_CODE });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([{ code: "old", ownerId: OWNER.id, playerIds: [OWNER.id] }]);
    });

    test("rejects duplicate room codes in the same guild", async () => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "old" });
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: PLAYER_1, code: NEW_ROOM_CODE });

        const response = await lfg.useCases.changeRoomCode({ guildId: GUILD_ID, code: "old", newCode: NEW_ROOM_CODE });

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_ALREADY_EXISTS,
            value: { code: NEW_ROOM_CODE },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual([
            { code: "old", ownerId: OWNER.id, playerIds: [OWNER.id] },
            { code: NEW_ROOM_CODE, ownerId: PLAYER_1.id, playerIds: [PLAYER_1.id] },
        ]);
    });
});
