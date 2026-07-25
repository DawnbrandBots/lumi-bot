import { ChannelType, MessageFlags, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import type { adminCommandApiInfo } from "../../src/admin/command/apiInfo.ts";
import { getAdminCommand } from "../../src/admin/command/handlers.ts";
import {
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
    ADMIN_MINUTES_OPTION_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "../../src/admin/constants.ts";
import type { AdminFeature } from "../../src/admin/feature.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import { getCommandRunHandler } from "../../src/bot/commands/handlers.ts";
import type { TCommandHandlers } from "../../src/bot/commands/types.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";
const ROLE_ID = "role-1";
const REPLY = {};

function getInteractionFixture({
    canManageGuild = true,
    subcommand = ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    action = null,
    channel = null,
    minutes = null,
    role = null,
}: {
    readonly canManageGuild?: boolean;
    readonly subcommand?: string;
    readonly action?: string | null;
    readonly channel?: { id: string; type: ChannelType } | null;
    readonly minutes?: number | null;
    readonly role?: { id: string } | null;
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
            getInteger: vi.fn((name: string) => (name === ADMIN_MINUTES_OPTION_NAME ? minutes : null)),
            getRole: vi.fn((name: string) => (name === ADMIN_ROLE_OPTION_NAME ? role : null)),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;
    return { interaction, reply };
}

async function runCommand(
    command: TCommandHandlers<typeof adminCommandApiInfo>,
    interaction: ChatInputCommandInteraction,
) {
    const run = getCommandRunHandler(command, interaction);
    if (!run) {
        throw new Error("No run handler found for test interaction.");
    }
    await run(interaction);
}

describe(getAdminCommand.name, () => {
    test("rejects users without ManageGuild", async () => {
        const adminFeature = {
            lfgChannel: vi.fn(),
            lfgRole: vi.fn(),
            getGuildConfig: vi.fn(),
        } as unknown as AdminFeature;
        const command = getAdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({ canManageGuild: false });

        await runCommand(command, interaction);

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
            lfgRolePingCooldown: vi.fn(),
            lfgRole: vi.fn(),
            getGuildConfig: vi.fn(),
        } as unknown as AdminFeature;
        const command = getAdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({
            action: "set",
            channel: { id: CHANNEL_ID, type: ChannelType.GuildText },
        });

        await runCommand(command, interaction);

        expect(lfgChannel).toHaveBeenCalledWith(GUILD_ID, "set", CHANNEL_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [
                    expect.objectContaining({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        description: expect.stringContaining(CHANNEL_ID),
                    }),
                ],
            }),
        );
    });

    test("dispatches lfg role", async () => {
        const lfgRole = vi.fn().mockResolvedValue({
            kind: EAdminFeatureReturnKind.LFG_ROLE_ADDED,
            value: { role: ROLE_ID },
        });
        const adminFeature = {
            lfgChannel: vi.fn(),
            lfgRolePingCooldown: vi.fn(),
            lfgRole,
            getGuildConfig: vi.fn(),
        } as unknown as AdminFeature;
        const command = getAdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({
            subcommand: ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
            action: "add",
            role: { id: ROLE_ID },
        });

        await runCommand(command, interaction);

        expect(lfgRole).toHaveBeenCalledWith(GUILD_ID, "add", ROLE_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [
                    expect.objectContaining({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        description: expect.stringContaining(ROLE_ID),
                    }),
                ],
            }),
        );
    });

    test("dispatches lfg role ping cooldown", async () => {
        const lfgRolePingCooldown = vi.fn().mockResolvedValue({
            kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes: 45 },
        });
        const adminFeature = {
            lfgChannel: vi.fn(),
            lfgRolePingCooldown,
            lfgRole: vi.fn(),
            getGuildConfig: vi.fn(),
        } as unknown as AdminFeature;
        const command = getAdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({
            subcommand: ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
            action: "set",
            minutes: 45,
        });

        await runCommand(command, interaction);

        expect(lfgRolePingCooldown).toHaveBeenCalledWith(GUILD_ID, "set", 45);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                embeds: [
                    expect.objectContaining({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        description: expect.stringContaining("45 minutes"),
                    }),
                ],
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
            lfgRolePingCooldown: vi.fn(),
            lfgRole: vi.fn(),
            getGuildConfig,
        } as unknown as AdminFeature;
        const command = getAdminCommand({ adminFeature });
        const { interaction, reply } = getInteractionFixture({ subcommand: ADMIN_LFG_SHOW_SUBCOMMAND_NAME });

        await runCommand(command, interaction);

        expect(getGuildConfig).toHaveBeenCalledWith(GUILD_ID);
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                embeds: [expect.objectContaining({ fields: expect.any(Array) })],
            }),
        );
    });
});
