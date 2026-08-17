import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../src/application/lfg/types.ts";
import { transfer } from "../../../../src/application/lfg/useCases/transfer.ts";
import { GUILD_ID, OWNER, PLAYER_1, useLfgUseCases } from "./shared.ts";

describe(transfer.name, { concurrent: false }, () => {
    const lfg = useLfgUseCases();

    test("transfers ownership in the room identified by code", async () => {
        await lfg.useCases.create(GUILD_ID, OWNER, "room");
        await lfg.useCases.move(GUILD_ID, PLAYER_1, "room");

        const response = await lfg.useCases.transfer(GUILD_ID, "room", PLAYER_1);

        expect(response).toEqual({
            kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
            value: {
                userId: OWNER.id,
                targetId: PLAYER_1.id,
                room: { code: "room", ownerId: PLAYER_1.id, playerIds: [OWNER.id, PLAYER_1.id] },
            },
        });
    });

    test("rejects missing rooms", async () => {
        const response = await lfg.useCases.transfer(GUILD_ID, "missing", PLAYER_1);

        expect(response).toEqual({
            kind: ELfgResultKind.ROOM_NOT_FOUND,
            value: { code: "missing" },
        });
    });

    test("rejects targets outside the room", async () => {
        await lfg.useCases.create(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.transfer(GUILD_ID, "room", PLAYER_1);

        expect(response).toEqual({
            kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
            value: { ownerId: OWNER.id, targetId: PLAYER_1.id, code: "room" },
        });
    });

    test("rejects transferring ownership to the current owner", async () => {
        await lfg.useCases.create(GUILD_ID, OWNER, "room");

        const response = await lfg.useCases.transfer(GUILD_ID, "room", OWNER);

        expect(response).toEqual({
            kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
            value: { userId: OWNER.id, code: "room" },
        });
    });
});
