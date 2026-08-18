import { inlineCode, userMention } from "discord.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ELfgResultKind } from "../../../../../../src/application/lfg/types.ts";
import { ELfgPlayerRemovalKind } from "../../../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { mapLfgResultToMessageBase } from "../../../../../../src/presentation/discord/mappers/lfg.ts";
import {
    COOLDOWN_ROLE_ID,
    GUILD_CONFIG,
    PINGABLE_ROLE_ID,
    ROOM,
} from "./fixtures.ts";

afterEach(() => {
    vi.useRealTimers();
});

type Input = Parameters<typeof mapLfgResultToMessageBase>[0];

describe(mapLfgResultToMessageBase.name, () => {
    test.each<{
        readonly name: string;
        readonly input: Omit<Input, "callerId"> & { readonly callerId?: Input["callerId"] };
    }>([
        {
            name: "non-empty room list",
            input: { result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } } },
        },
        {
            name: "empty room list",
            input: { result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [] } } },
        },
        {
            name: "maps status with configured LFG channel",
            input: {
                result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
                guildConfig: GUILD_CONFIG,
            },
        },
        {
            name: "room created",
            input: {
                result: { kind: ELfgResultKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } },
            },
        },
        {
            name: "room code changed",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_CODE_CHANGED,
                    value: { oldCode: "beta", newCode: ROOM.code },
                },
            },
        },
        {
            name: "room joined with previous room context",
            input: {
                callerId: "player-1",
                result: {
                    kind: ELfgResultKind.ROOM_JOINED,
                    value: { userId: "player-1", room: ROOM, leftRoomCode: "beta" },
                },
            },
        },
        {
            name: "ownership transferred",
            input: {
                result: {
                    kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
                    value: { userId: "owner", targetId: "player-1", room: ROOM },
                },
            },
        },
        {
            name: "player kicked",
            input: {
                result: {
                    kind: ELfgResultKind.PLAYER_KICKED,
                    value: {
                        userId: "owner",
                        targetId: "player-1",
                        room: ROOM,
                        removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
                    },
                },
            },
        },
        {
            name: "room left",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_LEFT,
                    value: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY, userId: "player-1", code: ROOM.code },
                },
            },
        },
        {
            name: "room left and deleted",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_LEFT,
                    value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: "owner", code: ROOM.code },
                },
            },
        },
        {
            name: "room left and ownership transferred",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_LEFT,
                    value: {
                        kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                        userId: "owner",
                        code: ROOM.code,
                        newOwnerId: "player-1",
                    },
                },
            },
        },
        {
            name: "room disbanded",
            input: {
                result: { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: "owner", code: ROOM.code } },
            },
        },
        {
            name: "invalid room code",
            input: { result: { kind: ELfgResultKind.INVALID_ROOM_CODE } },
        },
        {
            name: "already in a room",
            input: { result: { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: "owner" } } },
        },
        {
            name: "room already exists",
            input: {
                result: { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code: ROOM.code } },
            },
        },
        {
            name: "room not found",
            input: { result: { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code: ROOM.code } } },
        },
        {
            name: "already in target room",
            input: {
                callerId: "player-1",
                result: {
                    kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
                    value: { room: ROOM, userId: "player-1" },
                },
            },
        },
        {
            name: "room full",
            input: { result: { kind: ELfgResultKind.ROOM_IS_FULL, value: { code: ROOM.code } } },
        },
        {
            name: "cannot transfer to yourself",
            input: {
                callerId: "user",
                result: {
                    kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
                    value: { code: ROOM.code, userId: "user" },
                },
            },
        },
        {
            name: "player not in room",
            input: {
                result: {
                    kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                    value: { ownerId: "owner", targetId: "target", code: ROOM.code },
                },
            },
        },
        {
            name: "not room owner",
            input: { result: { kind: ELfgResultKind.NOT_ROOM_OWNER } },
        },
        {
            name: "cannot kick yourself",
            input: { result: { kind: ELfgResultKind.CANNOT_KICK_YOURSELF } },
        },
        {
            name: "not in a room",
            input: { result: { kind: ELfgResultKind.NOT_IN_A_ROOM } },
        },
    ])("maps $name", ({ input }) => {
        const { callerId = "owner", ...mapperInput } = input;
        const messageBase = mapLfgResultToMessageBase({ ...mapperInput, callerId });

        expect(messageBase).toMatchSnapshot();
    });

    test.each([
        {
            name: "room creation",
            input: { kind: ELfgResultKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } } as const,
            expected: `${userMention("admin")} created room \`${ROOM.code}\` with ${userMention("owner")} as owner.`,
        },
        {
            name: "room code change",
            input: {
                kind: ELfgResultKind.ROOM_CODE_CHANGED,
                value: { oldCode: "beta", newCode: ROOM.code },
            } as const,
            expected: `${userMention("admin")} changed room ${inlineCode("beta")}'s code to ${inlineCode(ROOM.code)}.`,
        },
        {
            name: "player move",
            input: {
                kind: ELfgResultKind.ROOM_JOINED,
                value: { userId: "player-1", room: ROOM },
            } as const,
            expected: `${userMention("admin")} moved ${userMention("player-1")} to room \`${ROOM.code}\`.`,
        },
        {
            name: "ownership transfer",
            input: {
                kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
                value: { userId: "owner", targetId: "player-1", room: ROOM },
            } as const,
            expected: `${userMention("admin")} transferred \`${ROOM.code}\`'s ownership to ${userMention("player-1")}.`,
        },
        {
            name: "player kick",
            input: {
                kind: ELfgResultKind.PLAYER_KICKED,
                value: {
                    userId: "owner",
                    targetId: "player-1",
                    room: ROOM,
                    removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
                },
            } as const,
            expected: `${userMention("admin")} kicked ${userMention("player-1")} from \`${ROOM.code}\`.`,
        },
        {
            name: "room disband",
            input: {
                kind: ELfgResultKind.ROOM_DISBANDED,
                value: { userId: "owner", code: ROOM.code },
            } as const,
            expected: `${userMention("admin")} disbanded \`${ROOM.code}\`.`,
        },
        {
            name: "player already in a room",
            input: {
                kind: ELfgResultKind.ALREADY_IN_A_ROOM,
                value: { userId: "owner" },
            } as const,
            expected: `${userMention("owner")} is already in a room.`,
        },
        {
            name: "player already in target room",
            input: {
                kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
                value: { userId: "owner", room: ROOM },
            } as const,
            expected: `${userMention("owner")} is already in room \`${ROOM.code}\`.`,
        },
        {
            name: "current owner selected for transfer",
            input: {
                kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
                value: { userId: "owner", code: ROOM.code },
            } as const,
            expected: `${userMention("owner")} already owns room \`${ROOM.code}\`.`,
        },
        {
            name: "player not in target room",
            input: {
                kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: "owner", targetId: "player-1", code: ROOM.code },
            } as const,
            expected: `${userMention("player-1")} is not in room \`${ROOM.code}\`.`,
        },
    ])("maps managed $name", ({ input, expected }) => {
        const messageBase = mapLfgResultToMessageBase({ result: input, callerId: "admin" });

        expect(messageBase.embeds[0]?.description).toBe(expected);
    });

    test.each([
        {
            removalResult: {
                kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                newOwnerId: "player-2",
            } as const,
            suffix: ` Ownership transferred to ${userMention("player-2")}.`,
        },
        {
            removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED } as const,
            suffix: " Room deleted.",
        },
    ])("includes kick removal consequence", ({ removalResult, suffix }) => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.PLAYER_KICKED,
                value: { userId: "owner", targetId: "owner", room: ROOM, removalResult },
            },
            callerId: "admin",
        });

        expect(messageBase.embeds[0]?.description).toBe(
            `${userMention("admin")} kicked ${userMention("owner")} from \`${ROOM.code}\`.${suffix}`,
        );
    });

    test.each([
        {
            removalResult: {
                kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                newOwnerId: "player-2",
            } as const,
            suffix: ` Ownership of \`beta\` transferred to ${userMention("player-2")}.`,
        },
        {
            removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED } as const,
            suffix: " Room `beta` deleted.",
        },
    ])("includes managed move removal consequence", ({ removalResult, suffix }) => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    userId: "owner",
                    room: ROOM,
                    leftRoomCode: "beta",
                    removalResult,
                },
            },
            callerId: "admin",
        });

        expect(messageBase.embeds[0]?.description).toBe(
            `${userMention("admin")} moved ${userMention("owner")} to room \`${ROOM.code}\`.${suffix}`,
        );
    });

    test("maps status with configured LFG values", () => {
        const STATUS_NOW = new Date("2026-07-19T10:00:00.000Z");
        const COOLDOWN_ROLE_LAST_PINGED_AT = new Date("2026-07-19T09:30:00.000Z");

        vi.useFakeTimers();
        vi.setSystemTime(STATUS_NOW);

        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            callerId: "owner",
            guildConfig: {
                ...GUILD_CONFIG,
                lfgRoles: [
                    { role: PINGABLE_ROLE_ID, lastPingedAt: null },
                    { role: COOLDOWN_ROLE_ID, lastPingedAt: COOLDOWN_ROLE_LAST_PINGED_AT },
                ],
            },
        });

        expect(messageBase).toMatchSnapshot();
    });
});
