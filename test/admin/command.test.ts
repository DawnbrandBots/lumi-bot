import { ChannelType, MessageFlags, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { AdminCommand } from "../../src/admin/command.ts";
import {
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
} from "../../src/admin/constants.ts";
import type { AdminFeature } from "../../src/admin/feature.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";
const REPLY = {};

function getInteractionFixture({
    canManageGuild = true,
    subcommand = ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    action = null,
    channel = null,
}: {
    readonly canManageGuild?: boolean;
    readonly subcommand?: string;
    readonly action?: string | null;
    readonly channel?: { id: string; type: ChannelType } | null;
} = {}) {
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        guildId: GUILD_ID,
        memberPermissions: {
            has: vi.fn((permission) => permission === PermissionFlagsBits.ManageGuild && canManageGuild),
        },
        options: {
            getSubcommandGroup: vi.fn().mockReturnValue(ADMIN_LFG_GROUP_NAME),
            getSubcommand: vi.fn().mockReturnValue(subcommand),
            getString: vi.fn((name: string) => (name === ADMIN_ACTION_OPTION_NAME ? action : null)),
            getChannel: vi.fn((name: string) => (name === ADMIN_CHANNEL_OPTION_NAME ? channel : null)),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;
    return { interaction, reply };
}

describe(AdminCommand.name, () => {
    test("rejects users without ManageGuild", async () => {
        const adminFeature = { lfgChannel: vi.fn(), getGuildConfig: vi.fn() } as unknown as AdminFeature;
        const command = new AdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({ canManageGuild: false });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: MessageFlags.Ephemeral,
                embeds: [expect.objectContaining({ title: "Missing permission" })],
            }),
        );
    });

    test("dispatches lfg channel", async () => {
        const lfgChannel = vi.fn().mockResolvedValue({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
            value: { channel: CHANNEL_ID },
        });
        const adminFeature = {
            lfgChannel,
            getGuildConfig: vi.fn(),
        } as unknown as AdminFeature;
        const command = new AdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({
            action: "set",
            channel: { id: CHANNEL_ID, type: ChannelType.GuildText },
        });

        await command.run(interaction);

        expect(lfgChannel).toHaveBeenCalledWith(GUILD_ID, "set", CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ title: "LFG public channel set" })],
            }),
        );
    });

    test("dispatches lfg show", async () => {
        const getGuildConfig = vi.fn().mockResolvedValue({
            kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
            value: null,
        });
        const adminFeature = {
            lfgChannel: vi.fn(),
            getGuildConfig,
        } as unknown as AdminFeature;
        const command = new AdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({ subcommand: ADMIN_LFG_SHOW_SUBCOMMAND_NAME });

        await command.run(interaction);

        expect(getGuildConfig).toHaveBeenCalledWith(GUILD_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [expect.objectContaining({ title: "LFG config" })],
            }),
        );
    });
});
