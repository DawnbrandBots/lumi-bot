import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, PLAYER_2, useLfgUseCases } from "./shared.ts";

describe("room pings", () => {
    const lfg = useLfgUseCases();

    test.each(["owner", "member", "managed"] as const)(
        "returns all players without changing the %s room",
        async (mode) => {
            await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
            await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });
            const before = await lfg.getRooms(GUILD_ID);

            const result =
                mode !== "managed"
                    ? await lfg.useCases.pingCurrentRoom({
                          guildId: GUILD_ID,
                          user: mode === "owner" ? OWNER : PLAYER_1,
                      })
                    : await lfg.useCases.pingRoom({ guildId: GUILD_ID, code: "room" });

            expect(result).toEqual({
                kind: ELfgResultKind.ROOM_PINGED,
                value: {
                    room: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        id: expect.any(String),
                        code: "room",
                        ownerId: OWNER.id,
                        playerIds: [OWNER.id, PLAYER_1.id],
                    },
                },
            });
            expect(await lfg.getRooms(GUILD_ID)).toEqual(before);
        },
    );

    test.each([GUILD_ID, OTHER_GUILD_ID])("rejects callers without a room in %s", async (guildId) => {
        await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        await lfg.useCases.movePlayerToRoomByCode({ guildId: GUILD_ID, user: PLAYER_1, code: "room" });
        const user = guildId === GUILD_ID ? PLAYER_2 : PLAYER_1;
        expect(await lfg.useCases.pingCurrentRoom({ guildId, user })).toEqual({
            kind: ELfgResultKind.NOT_IN_A_ROOM,
        });
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
