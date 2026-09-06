import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { movePlayerToRoomById } from "../../../../src/application/lfg/useCases/movePlayerToRoomById.ts";
import typeGuardExpectToStrictEqual from "../../../utils/typeGuardExpectToStrictEqual.ts";
import { GUILD_ID, OTHER_GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";
const expectedRoomCreated = {
    kind: ELfgResultKind.ROOM_CREATED,
    value: {
        room: {
            code: "room",
            id: expect.any(String) as string,
            ownerId: OWNER.id,
            playerIds: [OWNER.id],
        },
        userId: OWNER.id,
    },
} as const;
// TODO: nice, but can this be made generic and reused in other places?
function expectRoomCreated(creation: unknown): asserts creation is typeof expectedRoomCreated {
    typeGuardExpectToStrictEqual<typeof expectedRoomCreated>(creation, expectedRoomCreated);
}

describe(movePlayerToRoomById.name, () => {
    const lfg = useLfgUseCases();

    test("joins an existing room", async () => {
        // TODO: asser
        const creation = await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        expectRoomCreated(creation);

        const response = await lfg.useCases.movePlayerToRoomById({
            guildId: GUILD_ID,
            user: PLAYER_1,
            roomId: creation.value.room.id,
        });

        expect(response).toMatchObject({
            kind: ELfgResultKind.ROOM_JOINED,
            value: {
                userId: PLAYER_1.id,
                room: { code: "room", ownerId: OWNER.id, playerIds: [OWNER.id, PLAYER_1.id] },
            },
        });
    });

    test.each([
        { name: "deleted", guildId: GUILD_ID, deleteRoom: true },
        { name: "from another guild", guildId: OTHER_GUILD_ID, deleteRoom: false },
    ])("rejects a $name room", async ({ deleteRoom, guildId }) => {
        const creation = await lfg.useCases.createRoom({ guildId: GUILD_ID, owner: OWNER, code: "room" });
        expectRoomCreated(creation);
        if (deleteRoom) {
            await lfg.useCases.disbandRoom({ guildId: GUILD_ID, code: "room" });
        }

        const response = await lfg.useCases.movePlayerToRoomById({
            guildId,
            user: PLAYER_1,
            roomId: creation.value.room.id,
        });

        expect(response).toEqual({ kind: ELfgResultKind.ROOM_NOT_FOUND, value: {} });
    });
});
