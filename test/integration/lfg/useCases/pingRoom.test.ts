import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, PLAYER_2, useLfgUseCases } from "./shared.ts";

describe("room pings", () => {
    const lfg = useLfgUseCases();

    test.each(["owned", "managed"] as const)("returns all players without changing the %s room", async (mode) => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });
        const before = await lfg.getRooms(GUILD_ID);

        const result =
            mode === "owned"
                ? await lfg.useCases.pingOwnedRoom({ guildId: GUILD_ID, owner: OWNER })
                : await lfg.useCases.pingRoom({ guildId: GUILD_ID, code: "room" });

        expect(result).toEqual({
            kind: ELfgResultKind.ROOM_PINGED,
            value: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                room: { id: expect.any(String), code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            },
        });
        expect(await lfg.getRooms(GUILD_ID)).toEqual(before);
    });

    test.each([
        { user: PLAYER_1, kind: ELfgResultKind.NOT_ROOM_OWNER },
        { user: PLAYER_2, kind: ELfgResultKind.NOT_IN_A_ROOM },
    ])("rejects $kind", async ({ user, kind }) => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });
        expect(await lfg.useCases.pingOwnedRoom({ guildId: GUILD_ID, owner: user })).toEqual({ kind });
    });

    test.each([GUILD_ID, OTHER_GUILD_ID])("does not find a missing room in %s", async (guildId) => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        const code = guildId === GUILD_ID ? "missing" : "room";
        expect(await lfg.useCases.pingRoom({ guildId, code })).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code },
        });
    });
});
