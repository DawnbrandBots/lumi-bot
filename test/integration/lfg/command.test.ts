import type { ChatInputCommandInteraction, InteractionResponse } from "discord.js";
import { channelMention, ChannelType, MessageFlags, roleMention, userMention } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import type { TAdminUseCases } from "../../../src/application/admin/types.ts";
import { EAdminResultKind } from "../../../src/application/admin/types.ts";
import { ELfgResultKind, type TLfgResult } from "../../../src/application/lfg/types.ts";
import type { TApplicationUseCases } from "../../../src/application/useCases.types.ts";
import { COMMANDS } from "../../../src/composition/presentation/commands.ts";
import { buildDependentFunctionsRecord } from "../../../src/composition/utils/buildDependentFunctionsRecord.ts";
import { getCommandRunHandler } from "../../../src/presentation/discord/commands/handlers.ts";
import {
    LFG_CANNOT_PING_EVERYONE_DESCRIPTION,
    LFG_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_CODE_OPTION_NAME,
    LFG_COMMAND_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_NO_CHANNEL_TO_PING_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_ROLE_NOT_CONFIGURED_DESCRIPTION,
    LFG_ROLE_OPTION_NAME,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
} from "../../../src/presentation/discord/commands/lfg/constants.ts";

const GUILD_ID = "guild-1";
const USER_ID = "user-1";
const ROOM_CODE = "room";
const PUBLIC_CHANNEL_ID = "public-channel";
const OTHER_CHANNEL_ID = "other-channel";
const ROLE_ID = "role-1";
const ROLE_NAME = "Raid";
const REPLY = {} as InteractionResponse<boolean>;
const ANY_DATE: unknown = expect.any(Date);
const POSITIVE_RESULT = {
    kind: ELfgResultKind.ROOM_CREATED,
    value: {
        userId: USER_ID,
        room: { code: ROOM_CODE, ownerId: USER_ID, playerIds: [USER_ID] },
    },
} satisfies TLfgResult;

type ReplyArg = {
    readonly allowedMentions?: unknown;
    readonly content?: unknown;
    readonly embeds?: readonly { readonly description?: string }[];
    readonly flags?: unknown;
};
type SetLfgRoleLastPingedAtMock = ReturnType<typeof getSetLfgRoleLastPingedAtMock>;

function getSetLfgRoleLastPingedAtMock() {
    return vi.fn<TAdminUseCases["setLfgRoleLastPingedAt"]>();
}

function getLfgUseCaseMocks(result: TLfgResult) {
    return {
        changeRoomCode: vi.fn().mockResolvedValue(result),
        changeOwnedRoomCode: vi.fn().mockResolvedValue(result),
        createRoom: vi.fn().mockResolvedValue(result),
        disbandRoom: vi.fn().mockResolvedValue(result),
        disbandOwnedRoom: vi.fn().mockResolvedValue(result),
        getLfgStatus: vi.fn().mockResolvedValue(result),
        kickPlayerFromRoom: vi.fn().mockResolvedValue(result),
        kickPlayerFromOwnedRoom: vi.fn().mockResolvedValue(result),
        leaveRoom: vi.fn().mockResolvedValue(result),
        movePlayerToRoom: vi.fn().mockResolvedValue(result),
        transferRoomToPlayer: vi.fn().mockResolvedValue(result),
        transferOwnedRoomToPlayer: vi.fn().mockResolvedValue(result),
    };
}

type LfgUseCasesMock = ReturnType<typeof getLfgUseCaseMocks>;

function getInteractionFixture({
    channelId,
    send = vi.fn().mockResolvedValue({}),
    subcommand = LFG_CREATE_SUBCOMMAND_NAME,
    roleExists = true,
    channelExists = true,
    roleId = ROLE_ID,
}: {
    readonly channelId: string;
    readonly send?: ReturnType<typeof vi.fn>;
    readonly subcommand?: string;
    readonly roleExists?: boolean;
    readonly channelExists?: boolean;
    readonly roleId?: string;
}) {
    const channelFetch = vi.fn().mockResolvedValue(channelExists ? { type: ChannelType.GuildText, send } : null);
    const roleFetch = vi.fn().mockResolvedValue(roleExists ? { id: roleId, name: ROLE_NAME } : null);
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        commandName: LFG_COMMAND_NAME,
        guildId: GUILD_ID,
        inGuild: vi.fn().mockReturnValue(true),
        channelId,
        user: { id: USER_ID },
        guild: {
            channels: {
                fetch: channelFetch,
            },
            roles: {
                fetch: roleFetch,
            },
        },
        options: {
            getSubcommandGroup: vi.fn().mockReturnValue(null),
            getSubcommand: vi.fn().mockReturnValue(subcommand),
            getString: vi.fn((name: string) => (name === LFG_CODE_OPTION_NAME ? ROOM_CODE : null)),
            getRole: vi.fn((name: string) => (name === LFG_ROLE_OPTION_NAME ? { id: roleId } : null)),
            getBoolean: vi.fn().mockReturnValue(false),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;
    return { channelFetch, interaction, reply, roleFetch, send };
}

function getCommand({
    result,
    channel,
    lfgUseCases = getLfgUseCaseMocks(result),
    lfgRole = null,
    lfgRoleLastPingedAt = null,
    lfgRolePingCooldownMinutes = undefined,
    setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock(),
}: {
    readonly result: TLfgResult;
    readonly channel: string | null;
    readonly lfgUseCases?: LfgUseCasesMock;
    readonly lfgRole?: string | null;
    readonly lfgRoleLastPingedAt?: Date | null;
    readonly lfgRolePingCooldownMinutes?: number;
    readonly setLfgRoleLastPingedAt?: SetLfgRoleLastPingedAtMock;
}): TApplicationUseCases {
    const getGuildConfig = vi.fn().mockResolvedValue({
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: channel ? { guild: GUILD_ID, lfgChannel: channel, lfgRolePingCooldownMinutes } : null,
    });
    const getLfgRoleConfig = vi.fn().mockResolvedValue({
        kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole ? { role: lfgRole, lastPingedAt: lfgRoleLastPingedAt } : null,
    });
    return {
        admin: {
            addLfgRole: vi.fn(),
            clearLfgChannel: vi.fn(),
            clearLfgRolePingCooldown: vi.fn(),
            getGuildConfig,
            getLfgRoleConfig,
            removeLfgRole: vi.fn(),
            setLfgChannel: vi.fn(),
            setLfgRoleLastPingedAt,
            setLfgRolePingCooldown: vi.fn(),
        },
        lfg: lfgUseCases,
        search: {
            resolveSearchInput: vi.fn(),
            suggestSearchResults: vi.fn().mockResolvedValue([]),
        },
    };
}

async function runCommand(useCases: TApplicationUseCases, interaction: ChatInputCommandInteraction) {
    const command = getCommandRunHandler(COMMANDS)(interaction);
    if (!command) {
        throw new Error("No run handler found for test interaction.");
    }
    await buildDependentFunctionsRecord({ useCases }, { command }).command(interaction);
}

describe("lfg command", () => {
    test("replies ephemerally when no channel is configured", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: null });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });
    test("replies ephemerally and sends a public copy outside configured channel", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID });
        const send = vi.fn().mockResolvedValue({});
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID, send });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        const publicMessage = send.mock.calls[0]?.[0] as { readonly flags?: unknown } | undefined;
        expect(publicMessage?.flags).toBeUndefined();
    });

    test("replies publicly in the configured channel", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: PUBLIC_CHANNEL_ID });

        await runCommand(command, interaction);

        const publicReply = reply.mock.calls[0]?.[0] as { readonly flags?: unknown } | undefined;
        expect(publicReply?.flags).toBeUndefined();
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("dispatches lfg change-code", async () => {
        const result = {
            kind: ELfgResultKind.ROOM_CODE_CHANGED,
            value: {
                oldCode: "old",
                newCode: ROOM_CODE,
            },
        } satisfies TLfgResult;
        const lfgUseCases = getLfgUseCaseMocks(result);
        const command = getCommand({ result, channel: null, lfgUseCases });
        const { interaction } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_CHANGE_CODE_SUBCOMMAND_NAME,
        });

        await runCommand(command, interaction);

        expect(lfgUseCases.changeOwnedRoomCode).toHaveBeenCalledWith({
            guildId: GUILD_ID,
            owner: { id: USER_ID },
            newCode: ROOM_CODE,
        });
    });

    test("does not mirror error responses", async () => {
        const command = getCommand({
            result: { kind: ELfgResultKind.INVALID_ROOM_CODE },
            channel: PUBLIC_CHANNEL_ID,
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("does not mirror negative responses", async () => {
        const command = getCommand({
            result: { kind: ELfgResultKind.INVALID_ROOM_CODE },
            channel: PUBLIC_CHANNEL_ID,
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when no LFG channel is configured", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: null });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION })],
            }),
        );
        expect(channelFetch).not.toHaveBeenCalled();
        expect(roleFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when the configured LFG channel no longer exists", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID, lfgRole: ROLE_ID });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
            channelExists: false,
        });

        await runCommand(command, interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION })],
            }),
        );
        expect(roleFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when the requested role is not configured", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await runCommand(command, interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_ROLE_NOT_CONFIGURED_DESCRIPTION })],
            }),
        );
        expect(roleFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when the requested role is everyone", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock();
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: GUILD_ID,
            setLfgRoleLastPingedAt,
        });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
            roleId: GUILD_ID,
        });

        await runCommand(command, interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_CANNOT_PING_EVERYONE_DESCRIPTION })],
            }),
        );
        expect(roleFetch).not.toHaveBeenCalled();
        expect(setLfgRoleLastPingedAt).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when the configured role no longer exists", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock();
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            setLfgRoleLastPingedAt,
        });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
            roleExists: false,
        });

        await runCommand(command, interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(roleFetch).toHaveBeenCalledWith(ROLE_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_ROLE_TO_PING_DELETED_DESCRIPTION })],
            }),
        );
        expect(setLfgRoleLastPingedAt).not.toHaveBeenCalled();
    });

    test("lfg ping respects the per-guild cooldown", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock();
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            lfgRoleLastPingedAt: new Date(),
            lfgRolePingCooldownMinutes: 30,
            setLfgRoleLastPingedAt,
        });
        const { interaction, reply } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await runCommand(command, interaction);

        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.flags).toEqual([MessageFlags.Ephemeral]);
        expect(response?.embeds?.[0]?.description).toContain(roleMention(ROLE_ID));
        expect(response?.embeds?.[0]?.description).toContain("again on");
        expect(setLfgRoleLastPingedAt).not.toHaveBeenCalled();
    });

    test("lfg ping uses configured cooldown minutes", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock();
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            lfgRoleLastPingedAt: new Date(Date.now() - 31 * 60 * 1000),
            lfgRolePingCooldownMinutes: 45,
            setLfgRoleLastPingedAt,
        });
        const { interaction, reply } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await runCommand(command, interaction);

        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.flags).toEqual([MessageFlags.Ephemeral]);
        expect(response?.embeds?.[0]?.description).toContain("again on");
        expect(setLfgRoleLastPingedAt).not.toHaveBeenCalled();
    });

    test("lfg ping treats zero cooldown minutes as no cooldown", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock().mockResolvedValue(undefined);
        const send = vi.fn().mockResolvedValue({});
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            lfgRoleLastPingedAt: new Date(Date.now() - 31 * 60 * 1000),
            lfgRolePingCooldownMinutes: 0,
            setLfgRoleLastPingedAt,
        });
        const { interaction } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
            send,
        });

        await runCommand(command, interaction);

        expect(send).toHaveBeenCalled();
        expect(setLfgRoleLastPingedAt).toHaveBeenCalledWith({
            guildId: GUILD_ID,
            roleId: ROLE_ID,
            date: ANY_DATE,
        });
    });

    test("lfg ping sends to the LFG channel, replies ephemerally, and records the timestamp", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock().mockResolvedValue(undefined);
        const send = vi.fn().mockResolvedValue({});
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            lfgRoleLastPingedAt: new Date(Date.now() - 31 * 60 * 1000),
            setLfgRoleLastPingedAt,
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
            send,
        });

        await runCommand(command, interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        const publicMessage = send.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(publicMessage?.content).toBe(
            `${roleMention(ROLE_ID)} people, ${userMention(USER_ID)} is looking for a room!`,
        );
        expect(publicMessage?.allowedMentions).toEqual({ roles: [ROLE_ID], users: [USER_ID] });
        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.flags).toEqual([MessageFlags.Ephemeral]);
        expect(response?.embeds?.[0]?.description).toBe(
            `${roleMention(ROLE_ID)} pinged in ${channelMention(PUBLIC_CHANNEL_ID)}.`,
        );
        expect(setLfgRoleLastPingedAt).toHaveBeenCalledWith({
            guildId: GUILD_ID,
            roleId: ROLE_ID,
            date: ANY_DATE,
        });
    });

    test("lfg ping replies publicly in the LFG channel and records the timestamp", async () => {
        const setLfgRoleLastPingedAt = getSetLfgRoleLastPingedAtMock().mockResolvedValue(undefined);
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            lfgRoleLastPingedAt: new Date(Date.now() - 31 * 60 * 1000),
            setLfgRoleLastPingedAt,
        });
        const { channelFetch, interaction, reply, send } = getInteractionFixture({
            channelId: PUBLIC_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await runCommand(command, interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(send).not.toHaveBeenCalled();
        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.content).toBe(
            `${roleMention(ROLE_ID)} people, ${userMention(USER_ID)} is looking for a room!`,
        );
        expect(response?.allowedMentions).toEqual({ roles: [ROLE_ID], users: [USER_ID] });
        expect(response).not.toHaveProperty("flags");
        expect(setLfgRoleLastPingedAt).toHaveBeenCalledWith({
            guildId: GUILD_ID,
            roleId: ROLE_ID,
            date: ANY_DATE,
        });
    });
});
