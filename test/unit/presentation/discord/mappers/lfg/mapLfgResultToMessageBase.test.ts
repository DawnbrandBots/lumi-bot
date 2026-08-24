import { afterEach, describe, expect, test, vi } from "vitest";
import { ELfgResultKind } from "../../../../../../src/application/lfg/types.ts";
import { ELfgPlayerRemovalKind } from "../../../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { mapLfgResultToMessageBase } from "../../../../../../src/presentation/discord/mappers/lfg.ts";
import { GUILD_CONFIG, ROOM } from "./fixtures.ts";

const STATUS_NOW = new Date("2026-07-19T10:00:00.000Z");

afterEach(() => {
    vi.useRealTimers();
});

describe(mapLfgResultToMessageBase.name, () => {
    test.each<{
        readonly name: string;
        readonly input: Parameters<typeof mapLfgResultToMessageBase>[0];
        readonly setup?: () => void;
    }>([
        {
            name: "non-empty room list",
            input: {
                result: { kind: ELfgResultKind.ROOMS_LISTED, value: { guildConfig: null, rooms: [ROOM] } },
                callerId: "owner",
            },
        },
        {
            name: "empty room list",
            input: {
                result: { kind: ELfgResultKind.ROOMS_LISTED, value: { guildConfig: null, rooms: [] } },
                callerId: "owner",
            },
        },
        {
            name: "status with configured LFG channel",
            input: {
                result: { kind: ELfgResultKind.ROOMS_LISTED, value: { guildConfig: GUILD_CONFIG, rooms: [ROOM] } },
                callerId: "owner",
            },
            setup: () => {
                vi.useFakeTimers();
                vi.setSystemTime(STATUS_NOW);
            },
        },
        {
            name: "room created",
            input: {
                result: { kind: ELfgResultKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } },
                callerId: "owner",
            },
        },
        {
            name: "managed room creation",
            input: {
                result: { kind: ELfgResultKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } },
                callerId: "admin",
            },
        },
        {
            name: "room code changed",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_CODE_CHANGED,
                    value: { oldCode: "beta", newCode: ROOM.code },
                },
                callerId: "owner",
            },
        },
        {
            name: "managed room code change",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_CODE_CHANGED,
                    value: { oldCode: "beta", newCode: ROOM.code },
                },
                callerId: "admin",
            },
        },
        {
            name: "room joined with previous room context",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_JOINED,
                    value: { userId: "player-1", room: ROOM, leftRoomCode: "beta" },
                },
                callerId: "player-1",
            },
        },
        {
            name: "managed player move",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_JOINED,
                    value: { userId: "player-1", room: ROOM },
                },
                callerId: "admin",
            },
        },
        {
            name: "managed player move with ownership transfer consequence",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_JOINED,
                    value: {
                        userId: "owner",
                        room: ROOM,
                        leftRoomCode: "beta",
                        removalResult: {
                            kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                            newOwnerId: "player-2",
                        },
                    },
                },
                callerId: "admin",
            },
        },
        {
            name: "managed player move with room deletion consequence",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_JOINED,
                    value: {
                        userId: "owner",
                        room: ROOM,
                        leftRoomCode: "beta",
                        removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                    },
                },
                callerId: "admin",
            },
        },
        {
            name: "ownership transferred",
            input: {
                result: {
                    kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
                    value: { userId: "owner", targetId: "player-1", room: ROOM },
                },
                callerId: "owner",
            },
        },
        {
            name: "managed ownership transfer",
            input: {
                result: {
                    kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
                    value: { userId: "owner", targetId: "player-1", room: ROOM },
                },
                callerId: "admin",
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
                callerId: "owner",
            },
        },
        {
            name: "managed player kick",
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
                callerId: "admin",
            },
        },
        {
            name: "managed player kick with ownership transfer consequence",
            input: {
                result: {
                    kind: ELfgResultKind.PLAYER_KICKED,
                    value: {
                        userId: "owner",
                        targetId: "owner",
                        room: ROOM,
                        removalResult: {
                            kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                            newOwnerId: "player-2",
                        },
                    },
                },
                callerId: "admin",
            },
        },
        {
            name: "managed player kick with room deletion consequence",
            input: {
                result: {
                    kind: ELfgResultKind.PLAYER_KICKED,
                    value: {
                        userId: "owner",
                        targetId: "owner",
                        room: ROOM,
                        removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                    },
                },
                callerId: "admin",
            },
        },
        {
            name: "room left",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_LEFT,
                    value: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY, userId: "player-1", code: ROOM.code },
                },
                callerId: "owner",
            },
        },
        {
            name: "room left and deleted",
            input: {
                result: {
                    kind: ELfgResultKind.ROOM_LEFT,
                    value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: "owner", code: ROOM.code },
                },
                callerId: "owner",
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
                callerId: "owner",
            },
        },
        {
            name: "room disbanded",
            input: {
                result: { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: "owner", code: ROOM.code } },
                callerId: "owner",
            },
        },
        {
            name: "managed room disband",
            input: {
                result: { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: "owner", code: ROOM.code } },
                callerId: "admin",
            },
        },
        {
            name: "invalid room code",
            input: { result: { kind: ELfgResultKind.INVALID_ROOM_CODE }, callerId: "owner" },
        },
        {
            name: "already in a room",
            input: {
                result: { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: "owner" } },
                callerId: "owner",
            },
        },
        {
            name: "managed player already in a room",
            input: {
                result: { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: "owner" } },
                callerId: "admin",
            },
        },
        {
            name: "room already exists",
            input: {
                result: { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code: ROOM.code } },
                callerId: "owner",
            },
        },
        {
            name: "room not found",
            input: {
                result: { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code: ROOM.code } },
                callerId: "owner",
            },
        },
        {
            name: "already in target room",
            input: {
                result: {
                    kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
                    value: { room: ROOM, userId: "player-1" },
                },
                callerId: "player-1",
            },
        },
        {
            name: "managed player already in target room",
            input: {
                result: {
                    kind: ELfgResultKind.ALREADY_IN_TARGET_ROOM,
                    value: { userId: "owner", room: ROOM },
                },
                callerId: "admin",
            },
        },
        {
            name: "room full",
            input: { result: { kind: ELfgResultKind.ROOM_IS_FULL, value: { code: ROOM.code } }, callerId: "owner" },
        },
        {
            name: "cannot transfer to yourself",
            input: {
                result: {
                    kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
                    value: { code: ROOM.code, userId: "user" },
                },
                callerId: "user",
            },
        },
        {
            name: "managed current owner selected for transfer",
            input: {
                result: {
                    kind: ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF,
                    value: { userId: "owner", code: ROOM.code },
                },
                callerId: "admin",
            },
        },
        {
            name: "player not in room",
            input: {
                result: {
                    kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                    value: { ownerId: "owner", targetId: "target", code: ROOM.code },
                },
                callerId: "owner",
            },
        },
        {
            name: "managed player not in target room",
            input: {
                result: {
                    kind: ELfgResultKind.PLAYER_NOT_IN_ROOM,
                    value: { ownerId: "owner", targetId: "player-1", code: ROOM.code },
                },
                callerId: "admin",
            },
        },
        {
            name: "not room owner",
            input: { result: { kind: ELfgResultKind.NOT_ROOM_OWNER }, callerId: "owner" },
        },
        {
            name: "cannot kick yourself",
            input: { result: { kind: ELfgResultKind.CANNOT_KICK_YOURSELF }, callerId: "owner" },
        },
        {
            name: "not in a room",
            input: { result: { kind: ELfgResultKind.NOT_IN_A_ROOM }, callerId: "owner" },
        },
    ])("maps $name", (testCase) => {
        testCase.setup?.();

        expect(mapLfgResultToMessageBase(testCase.input)).toMatchSnapshot();
    });
});
