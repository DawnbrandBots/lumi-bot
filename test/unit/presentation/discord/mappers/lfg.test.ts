import {
    channelMention,
    heading,
    HeadingLevel,
    inlineCode,
    italic,
    MessageFlags,
    roleMention,
    time,
    unorderedList,
    userMention,
} from "discord.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { EMessageKind } from "../../../../../src/presentation/discord/message.types.ts";
import { ELfgResultKind } from "../../../../../src/application/lfg/types.ts";
import * as constants from "../../../../../src/domain/game/constants.ts";
import type { IRoom } from "../../../../../src/domain/lfg/models/room.types.ts";
import { ELfgPlayerRemovalKind } from "../../../../../src/domain/lfg/models/playerRemoval.types.ts";
import { LFG_SHOW_RESPONSE_OPTION_NAME } from "../../../../../src/presentation/discord/commands/lfg/constants.ts";
import {
    createLfgHelpMessageBase,
    createInvalidLfgSubcommandMessageBase,
    mapLfgResultToMessageBase,
    mapLfgMessageBaseToReply,
} from "../../../../../src/presentation/discord/mappers/lfg.ts";

const ROOM: IRoom = {
    code: "alpha",
    ownerId: "owner",
    playerIds: ["player-1", "owner", "player-2"],
};
const PUBLIC_CHANNEL_ID = "public-channel";
const GUILD_CONFIG = {
    guild: "guild-1",
    lfgChannel: PUBLIC_CHANNEL_ID,
    lfgRolePingCooldownMinutes: 45,
};
const PINGABLE_ROLE_ID = "pingable-role";
const COOLDOWN_ROLE_ID = "cooldown-role";
const LfgConstants = {
    LFG_NOT_CONFIGURED_DESCRIPTION: italic("Not configured"),
    LFG_EMPTY_ROOM_LIST_DESCRIPTION: "No active rooms. :(",
    LFG_INVALID_ROOM_CODE_DESCRIPTION: `Room codes must be between ${constants.FRIEND_BATTLE_CODE_MINIMUM_LENGTH} and ${constants.FRIEND_BATTLE_CODE_MAXIMUM_LENGTH} characters.`,
    LFG_ALREADY_IN_A_ROOM_DESCRIPTION: "Leave your current room before creating a new one.",
    LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION: "Choose another player in your room.",
    LFG_NOT_ROOM_OWNER_DESCRIPTION: "Only the room owner can do that.",
    LFG_CANNOT_KICK_YOURSELF_DESCRIPTION: `Use ${inlineCode("lfg leave")} to leave your room.`,
    LFG_NOT_IN_A_ROOM_DESCRIPTION: "Join or create a room first.",
    LFG_SHOW_RESPONSE_OPTION_NAME,
} as const;

afterEach(() => {
    vi.useRealTimers();
});

function statusDescription({
    roomsDescription,
    lfgChannel,
    lfgRoles = LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION,
    lfgRolePingCooldownMinutes = null,
}: {
    readonly roomsDescription: string;
    readonly lfgChannel: string;
    readonly lfgRoles?: string | readonly string[];
    readonly lfgRolePingCooldownMinutes?: number | null;
}) {
    const lfgRolesDescription = typeof lfgRoles === "string" ? [`LFG roles: ${lfgRoles}`] : ["LFG roles:", lfgRoles];
    return [
        heading("Rooms", HeadingLevel.Three),
        roomsDescription,
        heading("Server config", HeadingLevel.Three),
        unorderedList([
            `LFG channel: ${lfgChannel}`,
            ...lfgRolesDescription,
            `LFG roles ping cooldown: ${
                lfgRolePingCooldownMinutes != null
                    ? `${lfgRolePingCooldownMinutes} minutes`
                    : LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION
            }`,
        ]),
    ].join("\n");
}

function roomDescription(room: IRoom) {
    return `${inlineCode(room.code)}: ${userMention(room.ownerId)} (owner), ${userMention("player-1")}, ${userMention("player-2")}`;
}

type Input = Parameters<typeof mapLfgResultToMessageBase>[0];

describe(mapLfgResultToMessageBase.name, () => {
    test.each<{
        readonly name: string;
        readonly input: Omit<Input, "callerId"> & { readonly callerId?: Input["callerId"] };
        readonly expected: Pick<ReturnType<typeof mapLfgResultToMessageBase>, "kind" | "embeds">;
    }>([
        {
            name: "non-empty room list",
            input: { result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    {
                        description: statusDescription({
                            roomsDescription: `- ${roomDescription(ROOM)}`,
                            lfgChannel: LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION,
                        }),
                    },
                ],
            },
        },
        {
            name: "empty room list",
            input: { result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [] } } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    {
                        description: statusDescription({
                            roomsDescription: LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION,
                            lfgChannel: LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION,
                        }),
                    },
                ],
            },
        },
        {
            name: "maps status with configured LFG channel",
            input: {
                result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
                guildConfig: GUILD_CONFIG,
            },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    {
                        description: statusDescription({
                            roomsDescription: `- ${roomDescription(ROOM)}`,
                            lfgChannel: channelMention(PUBLIC_CHANNEL_ID),
                            lfgRolePingCooldownMinutes: 45,
                        }),
                    },
                ],
            },
        },
        {
            name: "room created",
            input: {
                result: { kind: ELfgResultKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} created room ${inlineCode(ROOM.code)}.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} changed room ${inlineCode("beta")}'s code to ${inlineCode(ROOM.code)}.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("player-1")} joined room ${inlineCode(ROOM.code)}.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} transferred ${inlineCode(ROOM.code)}'s ownership to ${userMention("player-1")}.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} kicked ${userMention("player-1")} from ${inlineCode(ROOM.code)}.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("player-1")} left ${inlineCode(ROOM.code)}.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} left ${inlineCode(ROOM.code)}. Room deleted.`,
                    },
                ],
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
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} left ${inlineCode(ROOM.code)}. Ownership transferred to ${userMention("player-1")}`,
                    },
                ],
            },
        },
        {
            name: "room disbanded",
            input: {
                result: { kind: ELfgResultKind.ROOM_DISBANDED, value: { userId: "owner", code: ROOM.code } },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} disbanded ${inlineCode(ROOM.code)}.`,
                    },
                ],
            },
        },
        {
            name: "invalid room code",
            input: { result: { kind: ELfgResultKind.INVALID_ROOM_CODE } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "already in a room",
            input: { result: { kind: ELfgResultKind.ALREADY_IN_A_ROOM, value: { userId: "owner" } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_ALREADY_IN_A_ROOM_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "room already exists",
            input: {
                result: { kind: ELfgResultKind.ROOM_ALREADY_EXISTS, value: { code: ROOM.code } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} already exists.`,
                    },
                ],
            },
        },
        {
            name: "room not found",
            input: { result: { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code: ROOM.code } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} does not exist.`,
                    },
                ],
            },
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
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [{ description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room full",
            input: { result: { kind: ELfgResultKind.ROOM_IS_FULL, value: { code: ROOM.code } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} already has ${constants.AMOUNT_OF_PLAYERS_IN_A_BATTLE} players.`,
                    },
                ],
            },
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
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION,
                    },
                ],
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
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `${userMention("target")} is not in your room.`,
                    },
                ],
            },
        },
        {
            name: "not room owner",
            input: { result: { kind: ELfgResultKind.NOT_ROOM_OWNER } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_NOT_ROOM_OWNER_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "cannot kick yourself",
            input: { result: { kind: ELfgResultKind.CANNOT_KICK_YOURSELF } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "not in a room",
            input: { result: { kind: ELfgResultKind.NOT_IN_A_ROOM } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_NOT_IN_A_ROOM_DESCRIPTION,
                    },
                ],
            },
        },
    ])("maps $name", ({ input, expected }) => {
        const { callerId = "owner", ...mapperInput } = input;
        const messageBase = mapLfgResultToMessageBase({ ...mapperInput, callerId });
        expect(messageBase).toMatchObject(expected);
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
        const COOLDOWN_ROLE_PINGABLE_AT = new Date("2026-07-19T10:15:00.000Z");

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

        expect(messageBase).toMatchObject({
            kind: EMessageKind.NEUTRAL,
            embeds: [
                {
                    description: statusDescription({
                        roomsDescription: `- ${roomDescription(ROOM)}`,
                        lfgChannel: channelMention(PUBLIC_CHANNEL_ID),
                        lfgRoles: [
                            `${roleMention(PINGABLE_ROLE_ID)} (pingable immediately)`,
                            `${roleMention(COOLDOWN_ROLE_ID)} (pingable on ${time(COOLDOWN_ROLE_PINGABLE_AT)})`,
                        ],
                        lfgRolePingCooldownMinutes: 45,
                    }),
                },
            ],
        });
    });
});

describe("LFG command-only messages", () => {
    test("creates help message", () => {
        expect(createLfgHelpMessageBase()).toMatchObject({
            kind: EMessageKind.NEUTRAL,
            embeds: [{ description: expect.any(String) }],
        });
    });

    test("creates invalid subcommand message", () => {
        expect(createInvalidLfgSubcommandMessageBase()).toMatchObject({
            kind: EMessageKind.ERROR,
            embeds: [{ description: "Please specify a valid subcommand." }],
        });
    });
});

const defaultOptions = { getBoolean: () => false } as const;

describe(mapLfgMessageBaseToReply.name, () => {
    test("keeps positive messages public in the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: defaultOptions },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).toEqual(messageBase);
        expect(reply).not.toHaveProperty("flags");
    });

    test("makes positive messages ephemeral outside the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: "other-channel", options: defaultOptions },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes positive messages ephemeral when no channel is configured", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: "other-channel", options: defaultOptions },
            guildConfig: null,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes non-positive messages ephemeral in the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.INVALID_ROOM_CODE },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: defaultOptions },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test(`message visible to everyone when ${LfgConstants.LFG_SHOW_RESPONSE_OPTION_NAME} is true`, () => {
        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: { getBoolean: () => true } },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).not.toHaveProperty("flags");
    });
});
