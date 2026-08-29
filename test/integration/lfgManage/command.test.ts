import {
    ChannelType,
    MessageFlags,
    userMention,
    type ChatInputCommandInteraction,
    type InteractionResponse,
} from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EAdminResultKind } from "../../../src/application/admin/types.ts";
import { ELfgResultKind, type TLfgResult } from "../../../src/application/lfg/types.ts";
import type { TApplicationUseCases } from "../../../src/application/useCases.types.ts";
import { build } from "../../../src/composition/utils/proxify.ts";
import { ELfgPlayerRemovalKind } from "../../../src/domain/lfg/models/playerRemoval.types.ts";
import { COMMANDS } from "../../../src/presentation/discord/commands.ts";
import { getCommandRunHandler } from "../../../src/presentation/discord/commands/handlers.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_NEW_CODE_OPTION_NAME,
    LFG_PLAYER_OPTION_NAME,
} from "../../../src/presentation/discord/commands/lfg/constants.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_COMMAND_NAME,
} from "../../../src/presentation/discord/commands/lfgManage/constants.ts";

const GUILD_ID = "guild-1";
const ADMIN_ID = "admin";
const PLAYER_ID = "player";
const ROOM_CODE = "room";
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
            getUser: vi.fn((name: string) => (name === LFG_PLAYER_OPTION_NAME ? { id: PLAYER_ID } : null)),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;

    return { channelFetch, interaction, reply, send };
}

function getCommand({ result, channel = null }: { readonly result: TLfgResult; readonly channel?: string | null }) {
    const lfgUseCases = {
        changeRoomCode: vi.fn().mockResolvedValue(result),
        changeOwnedRoomCode: vi.fn().mockResolvedValue(result),
        createRoom: vi.fn().mockResolvedValue(result),
        disbandOwnedRoom: vi.fn().mockResolvedValue(result),
        movePlayerToRoom: vi.fn().mockResolvedValue(result),
        getLfgStatus: vi.fn().mockResolvedValue(result),
        kickPlayerFromRoom: vi.fn().mockResolvedValue(result),
        kickPlayerFromOwnedRoom: vi.fn().mockResolvedValue(result),
        leaveRoom: vi.fn().mockResolvedValue(result),
        transferRoomToPlayer: vi.fn().mockResolvedValue(result),
        transferOwnedRoomToPlayer: vi.fn().mockResolvedValue(result),
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
    await build({ useCases }, { command }).command(interaction);
}

describe("lfg-manage command", () => {
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
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgResult,
            expectedArg: { guildId: GUILD_ID, owner: { id: PLAYER_ID }, code: ROOM_CODE },
        },
        {
            subcommand: "move",
            method: "movePlayerToRoom",
            result: {
                kind: ELfgResultKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_ID,
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgResult,
            expectedArg: { guildId: GUILD_ID, user: { id: PLAYER_ID }, code: ROOM_CODE },
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
            } satisfies TLfgResult,
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
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [] },
                    removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                },
            } satisfies TLfgResult,
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
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgResult,
            expectedArg: { guildId: GUILD_ID, code: ROOM_CODE, target: { id: PLAYER_ID } },
        },
        {
            subcommand: "disband",
            method: "disbandRoom",
            result: {
                kind: ELfgResultKind.ROOM_DISBANDED,
                value: { userId: PLAYER_ID, code: ROOM_CODE },
            } satisfies TLfgResult,
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

    test("sends a public copy to the configured LFG channel", async () => {
        const { command } = getCommand({
            channel: PUBLIC_CHANNEL_ID,
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: {
                    userId: PLAYER_ID,
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            },
        });
        const send = vi.fn().mockResolvedValue({});
        const { channelFetch, interaction, reply } = getInteractionFixture({ send });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                embeds: [
                    expect.objectContaining({
                        description: `${userMention(ADMIN_ID)} created room \`${ROOM_CODE}\` with ${userMention(PLAYER_ID)} as owner.`,
                    }),
                ],
            }),
        );
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
