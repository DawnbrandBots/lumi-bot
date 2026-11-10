import {
    ChannelType,
    MessageFlags,
    userMention,
    type ChatInputCommandInteraction,
    type InteractionResponse,
} from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EAdminResultKind } from "../../../src/application/admin/types.ts";
import { ELfgResultKind } from "../../../src/application/lfg/types.ts";
import type { TApplicationUseCases } from "../../../src/application/useCases.types.ts";
import { COMMANDS } from "../../../src/composition/presentation/commands.ts";
import getCommandRunHandler from "../../../src/composition/presentation/getCommandRunHandler.ts";
import { buildDependentFunctionsRecord } from "../../../src/composition/utils/buildDependentFunctionsRecord.ts";
import { ELfgPlayerRemovalKind } from "../../../src/domain/lfg/models/playerRemoval.types.ts";
import {
    formatJoinButtonId,
    LFG_CODE_OPTION_NAME,
    LFG_NEW_CODE_OPTION_NAME,
    LFG_PLAYER_OPTION_NAME,
} from "../../../src/presentation/discord/commands/lfg/constants.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_COMMAND_NAME,
    LFG_MANAGE_FIRST_PLAYER_OPTION_NAME,
    LFG_MANAGE_SECOND_PLAYER_OPTION_NAME,
} from "../../../src/presentation/discord/commands/lfgManage/constants.ts";
import type { TLfgPresentationResult } from "../../../src/presentation/discord/commands/types/lfg.types.ts";

const GUILD_ID = "guild-1";
const ADMIN_ID = "admin";
const PLAYER_ID = "player";
const ROOM_CODE = "room";
const ROOM_ID = "room-id";
const NEW_ROOM_CODE = "new-room";
const PUBLIC_CHANNEL_ID = "public-channel";
const OTHER_CHANNEL_ID = "other-channel";
const REPLY = {} as InteractionResponse<boolean>;

function getInteractionFixture({
    channelId = OTHER_CHANNEL_ID,
    guildId = GUILD_ID,
    subcommand = "create",
    send = vi.fn().mockResolvedValue({}),
}: {
    readonly channelId?: string;
    readonly guildId?: string | null;
    readonly subcommand?: string;
    readonly send?: ReturnType<typeof vi.fn>;
} = {}) {
    const channelFetch = vi.fn().mockResolvedValue({ type: ChannelType.GuildText, send });
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        commandName: LFG_MANAGE_COMMAND_NAME,
        guildId,
        inGuild: vi.fn().mockReturnValue(guildId !== null),
        channelId,
        user: { id: ADMIN_ID },
        guild: {
            channels: {
                fetch: channelFetch,
            },
        },
        options: {
            getBoolean: vi.fn().mockReturnValue(false),
            getSubcommandGroup: vi.fn().mockReturnValue(null),
            getSubcommand: vi.fn().mockReturnValue(subcommand),
            getString: vi.fn((name: string) =>
                name === LFG_CODE_OPTION_NAME ? ROOM_CODE : name === LFG_NEW_CODE_OPTION_NAME ? NEW_ROOM_CODE : null,
            ),
            getUser: vi.fn((name: string) =>
                name === LFG_PLAYER_OPTION_NAME || name === LFG_MANAGE_FIRST_PLAYER_OPTION_NAME
                    ? { id: PLAYER_ID }
                    : name === LFG_MANAGE_SECOND_PLAYER_OPTION_NAME
                      ? { id: "other-player" }
                      : null,
            ),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;

    return { channelFetch, interaction, reply, send };
}

function getCommand({
    result,
    channel = null,
}: {
    readonly result: TLfgPresentationResult;
    readonly channel?: string | null;
}) {
    const lfgUseCases = {
        changeRoomCode: vi.fn().mockResolvedValue(result),
        changeOwnedRoomCode: vi.fn().mockResolvedValue(result),
        createRoom: vi.fn().mockResolvedValue(result),
        disbandOwnedRoom: vi.fn().mockResolvedValue(result),
        movePlayerToRoomByCode: vi.fn().mockResolvedValue(result),
        movePlayerToRoomById: vi.fn().mockResolvedValue(result),
        getLfgStatus: vi.fn().mockResolvedValue(result),
        pingCurrentRoom: vi.fn().mockResolvedValue(result),
        pingRoom: vi.fn().mockResolvedValue(result),
        getRoomList: vi.fn().mockResolvedValue(result),
        kickPlayerFromRoom: vi.fn().mockResolvedValue(result),
        kickPlayerFromOwnedRoom: vi.fn().mockResolvedValue(result),
        leaveRoom: vi.fn().mockResolvedValue(result),
        transferRoomToPlayer: vi.fn().mockResolvedValue(result),
        transferOwnedRoomToPlayer: vi.fn().mockResolvedValue(result),
        swapPlayers: vi.fn().mockResolvedValue(result),
        disbandRoom: vi.fn().mockResolvedValue(result),
    };
    const getGuildConfig = vi.fn().mockResolvedValue({
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: channel ? { guild: GUILD_ID, lfgChannel: channel } : null,
    });
    const adminUseCases = {
        addLfgRole: vi.fn(),
        clearLfgChannel: vi.fn(),
        clearLfgRolePingCooldown: vi.fn(),
        getGuildConfig,
        getLfgRoleConfig: vi.fn(),
        removeLfgRole: vi.fn(),
        setLfgChannel: vi.fn(),
        setLfgRoleLastPingedAt: vi.fn(),
        setLfgRolePingCooldown: vi.fn(),
    };
    const searchUseCases = {
        resolveSearchInput: vi.fn(),
        suggestSearchResults: vi.fn().mockResolvedValue([]),
    };

    return {
        getGuildConfig,
        command: {
            admin: adminUseCases,
            lfg: lfgUseCases,
            search: searchUseCases,
        } satisfies TApplicationUseCases,
        lfgUseCases,
    };
}

async function runCommand(useCases: TApplicationUseCases, interaction: ChatInputCommandInteraction) {
    const command = getCommandRunHandler(COMMANDS)(interaction);
    if (!command) {
        throw new Error("No run handler found for test interaction.");
    }
    await buildDependentFunctionsRecord({ useCases }, { command }).command(interaction);
}

describe("lfg-manage command", () => {
    test("does not ping when the LFG channel is not configured", async () => {
        const fixture = getCommand({
            result: {
                kind: ELfgResultKind.ROOM_PINGED,
                value: { room: { id: ROOM_ID, code: ROOM_CODE, ownerId: "owner", playerIds: ["owner"] } },
            },
        });
        const { interaction, reply, send } = getInteractionFixture({ subcommand: "ping-room" });
        await runCommand(fixture.command, interaction);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: "LFG channel does not exist." })],
            }),
        );
        expect(send).not.toHaveBeenCalled();
    });

    test.each([PUBLIC_CHANNEL_ID, OTHER_CHANNEL_ID])("pings room players from %s", async (channelId) => {
        const fixture = getCommand({
            channel: PUBLIC_CHANNEL_ID,
            result: {
                kind: ELfgResultKind.ROOM_PINGED,
                value: {
                    room: { id: ROOM_ID, code: ROOM_CODE, ownerId: ADMIN_ID, playerIds: [ADMIN_ID, "other-player"] },
                },
            },
        });
        const { interaction, reply, send } = getInteractionFixture({ channelId, subcommand: "ping-room" });
        await runCommand(fixture.command, interaction);
        const destination = channelId === PUBLIC_CHANNEL_ID ? reply : send;
        expect(destination).toHaveBeenCalledWith(
            expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                content: expect.stringContaining("<@other-player>"),
                allowedMentions: { parse: [], users: [ADMIN_ID, "other-player"] },
            }),
        );
        expect(fixture.lfgUseCases.pingRoom).toHaveBeenCalledWith({
            guildId: GUILD_ID,
            code: ROOM_CODE,
        });
    });

    test("rejects non-guild interactions", async () => {
        const { command, getGuildConfig, lfgUseCases } = getCommand({
            result: { kind: ELfgResultKind.INVALID_ROOM_CODE },
        });
        const { interaction, reply } = getInteractionFixture({ guildId: null });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: MessageFlags.Ephemeral,
                embeds: [expect.objectContaining({ description: "LFG management is only available in servers." })],
            }),
        );
        expect(getGuildConfig).not.toHaveBeenCalled();
        expect(lfgUseCases.createRoom).not.toHaveBeenCalled();
    });

    test.each([
        {
            subcommand: "create",
            method: "createRoom",
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: {
                    userId: PLAYER_ID,
                    room: { id: ROOM_ID, code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgPresentationResult,
            expectedArg: { guildId: GUILD_ID, owner: { id: PLAYER_ID }, code: ROOM_CODE },
        },
        {
            subcommand: "move",
            method: "movePlayerToRoomByCode",
            result: {
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_ID,
                    room: { id: ROOM_ID, code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgPresentationResult,
            expectedArg: { guildId: GUILD_ID, user: { id: PLAYER_ID }, code: ROOM_CODE },
        },
        {
            subcommand: "swap",
            method: "swapPlayers",
            result: {
                kind: ELfgResultKind.PLAYERS_SWAPPED,
                value: {
                    firstUserId: PLAYER_ID,
                    secondUserId: "other-player",
                    firstRoomCode: ROOM_CODE,
                    ownershipTransfers: [],
                },
            } satisfies TLfgPresentationResult,
            expectedArg: {
                guildId: GUILD_ID,
                firstUser: { id: PLAYER_ID },
                secondUser: { id: "other-player" },
            },
        },
        {
            subcommand: LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
            method: "changeRoomCode",
            result: {
                kind: ELfgResultKind.ROOM_CODE_CHANGED,
                value: {
                    oldCode: ROOM_CODE,
                    newCode: NEW_ROOM_CODE,
                },
            } satisfies TLfgPresentationResult,
            expectedArg: { guildId: GUILD_ID, code: ROOM_CODE, newCode: NEW_ROOM_CODE },
        },
        {
            subcommand: "kick",
            method: "kickPlayerFromRoom",
            result: {
                kind: ELfgResultKind.PLAYER_KICKED,
                value: {
                    userId: PLAYER_ID,
                    targetId: PLAYER_ID,
                    room: { id: ROOM_ID, code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [] },
                    removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                },
            } satisfies TLfgPresentationResult,
            expectedArg: { guildId: GUILD_ID, code: ROOM_CODE, target: { id: PLAYER_ID } },
        },
        {
            subcommand: "transfer",
            method: "transferRoomToPlayer",
            result: {
                kind: ELfgResultKind.OWNERSHIP_TRANSFERRED,
                value: {
                    userId: PLAYER_ID,
                    targetId: PLAYER_ID,
                    room: { id: ROOM_ID, code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgPresentationResult,
            expectedArg: { guildId: GUILD_ID, code: ROOM_CODE, target: { id: PLAYER_ID } },
        },
        {
            subcommand: "disband",
            method: "disbandRoom",
            result: {
                kind: ELfgResultKind.ROOM_DISBANDED,
                value: { userId: PLAYER_ID, code: ROOM_CODE },
            } satisfies TLfgPresentationResult,
            expectedArg: { guildId: GUILD_ID, code: ROOM_CODE },
        },
    ] as const)("dispatches $subcommand", async ({ expectedArg, method, result, subcommand }) => {
        const { command, lfgUseCases } = getCommand({ result });
        const { interaction, reply } = getInteractionFixture({ subcommand });

        await runCommand(command, interaction);

        expect(lfgUseCases[method]).toHaveBeenCalledWith(expectedArg);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [
                    expect.objectContaining({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        description: expect.stringContaining(userMention(ADMIN_ID)),
                    }),
                ],
            }),
        );
    });

    test.each([
        {
            firstRoomCode: "first",
            secondRoomCode: "second",
            ownershipTransfers: [],
            expected: `<@${ADMIN_ID}> swapped <@${PLAYER_ID}> and <@other-player>:\n- <@${PLAYER_ID}> was moved to \`second\`.\n- <@other-player> was moved to \`first\`.`,
        },
        {
            firstRoomCode: "first",
            secondRoomCode: "second",
            ownershipTransfers: [
                { roomCode: "first", newOwnerId: "other-player" },
                { roomCode: "second", newOwnerId: PLAYER_ID },
            ],
            expected: `<@${ADMIN_ID}> swapped <@${PLAYER_ID}> and <@other-player>:\n- <@${PLAYER_ID}> was moved to \`second\`.\n- <@other-player> was moved to \`first\`.\n\nOwnership transfers:\n- <@other-player> now owns \`first\`.\n- <@${PLAYER_ID}> now owns \`second\`.`,
        },
        {
            firstRoomCode: "first",
            secondRoomCode: "second",
            ownershipTransfers: [{ roomCode: "first", newOwnerId: "existing-player" }],
            expected: `<@${ADMIN_ID}> swapped <@${PLAYER_ID}> and <@other-player>:\n- <@${PLAYER_ID}> was moved to \`second\`.\n- <@other-player> was moved to \`first\`.\n\nOwnership transfers:\n- <@existing-player> now owns \`first\`.`,
        },
        {
            firstRoomCode: "first",
            secondRoomCode: undefined,
            ownershipTransfers: [{ roomCode: "first", newOwnerId: "other-player" }],
            expected: `<@${ADMIN_ID}> swapped <@${PLAYER_ID}> and <@other-player>:\n- <@${PLAYER_ID}> was removed from \`first\`.\n- <@other-player> was moved to \`first\`.\n\nOwnership transfers:\n- <@other-player> now owns \`first\`.`,
        },
        {
            firstRoomCode: undefined,
            secondRoomCode: "second",
            ownershipTransfers: [{ roomCode: "second", newOwnerId: PLAYER_ID }],
            expected: `<@${ADMIN_ID}> swapped <@${PLAYER_ID}> and <@other-player>:\n- <@${PLAYER_ID}> was moved to \`second\`.\n- <@other-player> was removed from \`second\`.\n\nOwnership transfers:\n- <@${PLAYER_ID}> now owns \`second\`.`,
        },
    ])("formats the swap result", async (caseItem) => {
        const { command } = getCommand({
            result: {
                kind: ELfgResultKind.PLAYERS_SWAPPED,
                value: { firstUserId: PLAYER_ID, secondUserId: "other-player", ...caseItem },
            },
        });
        const { interaction, reply } = getInteractionFixture({ subcommand: "swap" });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: caseItem.expected })],
            }),
        );
    });

    test.each([
        {
            kind: ELfgResultKind.ATTEMPTED_TO_SWAP_THE_SAME_PLAYER,
            expected: "Choose two different players.",
        },
        {
            kind: ELfgResultKind.CANNOT_SWAP_TWO_PLAYERS_NOT_IN_A_ROOM,
            expected: "Neither player is in a room.",
        },
        {
            kind: ELfgResultKind.CANNOT_SWAP_PLAYERS_IN_SAME_ROOM,
            expected: "Both players are already in the same room.",
        },
    ] as const)("returns the $kind rejection message", async ({ kind, expected }) => {
        const { command } = getCommand({ result: { kind } });
        const { interaction, reply } = getInteractionFixture({ subcommand: "swap" });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: expected })],
            }),
        );
    });

    test("sends a public copy to the configured LFG channel", async () => {
        const { command } = getCommand({
            channel: PUBLIC_CHANNEL_ID,
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: {
                    userId: PLAYER_ID,
                    room: { id: ROOM_ID, code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            },
        });
        const send = vi.fn().mockResolvedValue({});
        const { channelFetch, interaction, reply } = getInteractionFixture({ send });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(send.mock.calls[0]?.[0]).toMatchObject({
            flags: [MessageFlags.IsComponentsV2],
            components: [
                {
                    components: [{ accessory: { custom_id: formatJoinButtonId(ROOM_ID) } }],
                },
            ],
        });
    });

    test("does not publish negative results", async () => {
        const { command } = getCommand({
            channel: PUBLIC_CHANNEL_ID,
            result: { kind: ELfgResultKind.ROOM_NOT_FOUND, value: { code: ROOM_CODE } },
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({ subcommand: "disband" });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });
});
