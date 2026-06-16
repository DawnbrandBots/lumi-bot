import {
    ChannelType,
    MessageFlags,
    channelMention,
    roleMention,
    type ChatInputCommandInteraction,
    type InteractionResponse,
    userMention,
} from "discord.js";
import { describe, expect, test, vi } from "vitest";
import type { AdminFeature } from "../../src/admin/feature.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import type { Command } from "../../src/bot/command.ts";
import { getLfgCommand } from "../../src/lfg/command.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_NO_CHANNEL_TO_PING_DESCRIPTION,
    LFG_NO_ROLE_TO_PING_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
} from "../../src/lfg/constants.ts";
import type { LfgFeature } from "../../src/lfg/feature.ts";
import { ELfgFeatureReturnKind, type TLfgFeatureReturn } from "../../src/lfg/types.ts";

const GUILD_ID = "guild-1";
const USER_ID = "user-1";
const ROOM_CODE = "room";
const PUBLIC_CHANNEL_ID = "public-channel";
const OTHER_CHANNEL_ID = "other-channel";
const ROLE_ID = "role-1";
const REPLY = {} as InteractionResponse<boolean>;
const POSITIVE_RESULT = {
    kind: ELfgFeatureReturnKind.ROOM_CREATED,
    value: {
        userId: USER_ID,
        room: { code: ROOM_CODE, ownerId: USER_ID, playerIds: [USER_ID] },
    },
} satisfies TLfgFeatureReturn;

type ReplyArg = {
    readonly allowedMentions?: unknown;
    readonly content?: unknown;
    readonly embeds?: readonly { readonly description?: string }[];
    readonly flags?: unknown;
};

function getInteractionFixture({
    channelId,
    send = vi.fn().mockResolvedValue({}),
    subcommand = LFG_CREATE_SUBCOMMAND_NAME,
    roleExists = true,
    channelExists = true,
}: {
    readonly channelId: string;
    readonly send?: ReturnType<typeof vi.fn>;
    readonly subcommand?: string;
    readonly roleExists?: boolean;
    readonly channelExists?: boolean;
}) {
    const channelFetch = vi.fn().mockResolvedValue(channelExists ? { type: ChannelType.GuildText, send } : null);
    const roleFetch = vi.fn().mockResolvedValue(roleExists ? { id: ROLE_ID } : null);
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        guildId: GUILD_ID,
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
            getSubcommand: vi.fn().mockReturnValue(subcommand),
            getString: vi.fn((name: string) => (name === LFG_CODE_OPTION_NAME ? ROOM_CODE : null)),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;
    return { channelFetch, interaction, reply, roleFetch, send };
}

function getCommand({
    result,
    channel,
    lfgRole = null,
    lfgRoleLastPingedAt = null,
    setLfgRoleLastPingedAt = vi.fn(),
}: {
    readonly result: TLfgFeatureReturn;
    readonly channel: string | null;
    readonly lfgRole?: string | null;
    readonly lfgRoleLastPingedAt?: Date | null;
    readonly setLfgRoleLastPingedAt?: ReturnType<typeof vi.fn>;
}): Command {
    return getLfgCommand({
        lfgFeature: {
            create: vi.fn().mockResolvedValue(result),
        } as unknown as LfgFeature,
        adminFeature: {
            getGuildConfig: vi.fn().mockResolvedValue({
                kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
                value:
                    channel || lfgRole || lfgRoleLastPingedAt
                        ? { guild: GUILD_ID, lfgChannel: channel, lfgRole, lfgRoleLastPingedAt }
                        : null,
            }),
            setLfgRoleLastPingedAt,
        } as unknown as Pick<AdminFeature, "getGuildConfig" | "setLfgRoleLastPingedAt">,
    });
}

describe(getLfgCommand.name, () => {
    test("replies ephemerally when no channel is configured", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: null });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("replies ephemerally and sends a public copy outside configured channel", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID });
        const send = vi.fn().mockResolvedValue({});
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID, send });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        const publicMessage = send.mock.calls[0]?.[0] as { readonly flags?: unknown } | undefined;
        expect(publicMessage?.flags).toBeUndefined();
    });

    test("replies publicly in the configured channel", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: PUBLIC_CHANNEL_ID });

        await command.run(interaction);

        const publicReply = reply.mock.calls[0]?.[0] as { readonly flags?: unknown } | undefined;
        expect(publicReply?.flags).toBeUndefined();
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("does not mirror error responses", async () => {
        const command = getCommand({
            result: { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND },
            channel: PUBLIC_CHANNEL_ID,
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("does not mirror negative responses", async () => {
        const command = getCommand({
            result: { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE },
            channel: PUBLIC_CHANNEL_ID,
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({ channelId: OTHER_CHANNEL_ID });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when no LFG channel is configured", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: null });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await command.run(interaction);

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

        await command.run(interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION })],
            }),
        );
        expect(roleFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when no role is configured", async () => {
        const command = getCommand({ result: POSITIVE_RESULT, channel: PUBLIC_CHANNEL_ID });
        const { channelFetch, interaction, reply, roleFetch } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await command.run(interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ description: LFG_NO_ROLE_TO_PING_DESCRIPTION })],
            }),
        );
        expect(roleFetch).not.toHaveBeenCalled();
    });

    test("lfg ping replies ephemerally when the configured role no longer exists", async () => {
        const setLfgRoleLastPingedAt = vi.fn();
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

        await command.run(interaction);

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
        const setLfgRoleLastPingedAt = vi.fn();
        const command = getCommand({
            result: POSITIVE_RESULT,
            channel: PUBLIC_CHANNEL_ID,
            lfgRole: ROLE_ID,
            lfgRoleLastPingedAt: new Date(),
            setLfgRoleLastPingedAt,
        });
        const { interaction, reply } = getInteractionFixture({
            channelId: OTHER_CHANNEL_ID,
            subcommand: LFG_PING_SUBCOMMAND_NAME,
        });

        await command.run(interaction);

        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.flags).toEqual([MessageFlags.Ephemeral]);
        expect(response?.embeds?.[0]?.description).toContain("again on");
        expect(setLfgRoleLastPingedAt).not.toHaveBeenCalled();
    });

    test("lfg ping sends to the LFG channel, replies ephemerally, and records the timestamp", async () => {
        const setLfgRoleLastPingedAt = vi.fn().mockResolvedValue(undefined);
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

        await command.run(interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        const publicMessage = send.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(publicMessage?.content).toBe(`${roleMention(ROLE_ID)} ${userMention(USER_ID)} is looking for game.`);
        expect(publicMessage?.allowedMentions).toEqual({ roles: [ROLE_ID], users: [USER_ID] });
        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.flags).toEqual([MessageFlags.Ephemeral]);
        expect(response?.embeds?.[0]?.description).toBe(`LFG role pinged in ${channelMention(PUBLIC_CHANNEL_ID)}.`);
        expect(setLfgRoleLastPingedAt).toHaveBeenCalledWith(GUILD_ID, expect.any(Date));
    });

    test("lfg ping replies publicly in the LFG channel and records the timestamp", async () => {
        const setLfgRoleLastPingedAt = vi.fn().mockResolvedValue(undefined);
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

        await command.run(interaction);

        expect(channelFetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        expect(send).not.toHaveBeenCalled();
        const response = reply.mock.calls[0]?.[0] as ReplyArg | undefined;
        expect(response?.content).toBe(`${roleMention(ROLE_ID)} ${userMention(USER_ID)} is looking for game.`);
        expect(response?.allowedMentions).toEqual({ roles: [ROLE_ID], users: [USER_ID] });
        expect(response).not.toHaveProperty("flags");
        expect(setLfgRoleLastPingedAt).toHaveBeenCalledWith(GUILD_ID, expect.any(Date));
    });
});
