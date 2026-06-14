import type { InteractionReplyOptions } from "discord.js";
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
import { createNeutralMessage } from "../../src/bot/message.ts";

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
        const adminFeature = { lfgChannel: vi.fn(), lfgShow: vi.fn() } as unknown as AdminFeature;
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
        const response = createNeutralMessage<InteractionReplyOptions>({
            embed: { title: "ok" },
            flags: [MessageFlags.Ephemeral],
        });
        const lfgChannel = vi.fn().mockResolvedValue(response);
        const adminFeature = {
            getConfig: vi.fn().mockResolvedValue(null),
            lfgChannel,
            lfgShow: vi.fn(),
        } as unknown as AdminFeature;
        const command = new AdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({
            action: "set",
            channel: { id: CHANNEL_ID, type: ChannelType.GuildText },
        });

        await command.run(interaction);

        expect(lfgChannel).toHaveBeenCalledWith(GUILD_ID, "set", CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(response);
    });

    test("dispatches lfg show", async () => {
        const response = createNeutralMessage<InteractionReplyOptions>({
            embed: { title: "ok" },
            flags: [MessageFlags.Ephemeral],
        });
        const lfgShow = vi.fn().mockResolvedValue(response);
        const adminFeature = {
            lfgChannel: vi.fn(),
            lfgShow,
        } as unknown as AdminFeature;
        const command = new AdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({ subcommand: ADMIN_LFG_SHOW_SUBCOMMAND_NAME });

        await command.run(interaction);

        expect(lfgShow).toHaveBeenCalledWith(GUILD_ID);
        expect(reply).toHaveBeenCalledWith(response);
    });
});
