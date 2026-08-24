import { ChannelType, MessageFlags, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EAdminResultKind } from "../../../src/application/admin/types.ts";
import type { adminCommandCommandRegistrationData } from "../../../src/presentation/discord/commandRegistrationData/admin.ts";
import { getAdminCommand } from "../../../src/presentation/discord/commands/admin.ts";
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
} from "../../../src/presentation/discord/commands/admin/constants.ts";
import { getCommandRunHandler } from "../../../src/presentation/discord/commands/handlers.ts";
import type { TAdminCommandArgs } from "../../../src/presentation/discord/commands/admin/types.ts";
import type { TCommandRunHandlers } from "../../../src/presentation/discord/commands/types.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";
const ROLE_ID = "role-1";
const REPLY = {};

function getInteractionFixture({
    canManageGuild = true,
    inGuild = true,
    subcommand = ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    action = null,
    channel = null,
    minutes = null,
    role = null,
}: {
    readonly canManageGuild?: boolean;
    readonly inGuild?: boolean;
    readonly subcommand?: string;
    readonly action?: string | null;
    readonly channel?: { id: string; type: ChannelType } | null;
    readonly minutes?: number | null;
    readonly role?: { id: string } | null;
} = {}) {
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        guildId: GUILD_ID,
        inGuild: vi.fn().mockReturnValue(inGuild),
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
    command: TCommandRunHandlers<typeof adminCommandCommandRegistrationData>,
    interaction: ChatInputCommandInteraction,
) {
    const run = getCommandRunHandler({ run: command }, interaction);
    if (!run) {
        throw new Error("No run handler found for test interaction.");
    }
    await run(interaction);
}

function getAdminCommandArgs(arg: Partial<TAdminCommandArgs["useCases"]> = {}): TAdminCommandArgs {
    return {
        useCases: {
            addLfgRole: vi.fn(),
            clearLfgChannel: vi.fn(),
            clearLfgRolePingCooldown: vi.fn(),
            getGuildConfig: vi.fn(),
            removeLfgRole: vi.fn(),
            setLfgChannel: vi.fn(),
            setLfgRolePingCooldown: vi.fn(),
            ...arg,
        },
    };
}

describe(getAdminCommand.name, () => {
    test("rejects interactions outside guilds", async () => {
        const command = getAdminCommand(getAdminCommandArgs());
        const { interaction, reply } = getInteractionFixture({ inGuild: false });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: MessageFlags.Ephemeral,
                embeds: [expect.objectContaining({ title: "Admin unavailable" })],
            }),
        );
    });

    test("rejects users without ManageGuild", async () => {
        const command = getAdminCommand(getAdminCommandArgs());
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
        const setLfgChannel = vi.fn().mockResolvedValue({
            kind: EAdminResultKind.LFG_CHANNEL_SET,
            value: { channel: CHANNEL_ID },
        });
        const command = getAdminCommand(getAdminCommandArgs({ setLfgChannel }));
        const { interaction, reply } = getInteractionFixture({
            action: "set",
            channel: { id: CHANNEL_ID, type: ChannelType.GuildText },
        });

        await runCommand(command, interaction);

        expect(setLfgChannel).toHaveBeenCalledWith({ guildId: GUILD_ID, channelId: CHANNEL_ID });
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
        const addLfgRole = vi.fn().mockResolvedValue({
            kind: EAdminResultKind.LFG_ROLE_ADDED,
            value: { role: ROLE_ID },
        });
        const command = getAdminCommand(getAdminCommandArgs({ addLfgRole }));
        const { interaction, reply } = getInteractionFixture({
            subcommand: ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
            action: "add",
            role: { id: ROLE_ID },
        });

        await runCommand(command, interaction);

        expect(addLfgRole).toHaveBeenCalledWith({ guildId: GUILD_ID, roleId: ROLE_ID });
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
        const setLfgRolePingCooldown = vi.fn().mockResolvedValue({
            kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes: 45 },
        });
        const command = getAdminCommand(getAdminCommandArgs({ setLfgRolePingCooldown }));
        const { interaction, reply } = getInteractionFixture({
            subcommand: ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
            action: "set",
            minutes: 45,
        });

        await runCommand(command, interaction);

        expect(setLfgRolePingCooldown).toHaveBeenCalledWith({ guildId: GUILD_ID, minutes: 45 });
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
            kind: EAdminResultKind.LFG_GET_CONFIG,
            value: null,
        });
        const command = getAdminCommand(getAdminCommandArgs({ getGuildConfig }));
        const { interaction, reply } = getInteractionFixture({ subcommand: ADMIN_LFG_SHOW_SUBCOMMAND_NAME });

        await runCommand(command, interaction);

        expect(getGuildConfig).toHaveBeenCalledWith({ guildId: GUILD_ID });
        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: [MessageFlags.Ephemeral],
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                embeds: [expect.objectContaining({ fields: expect.any(Array) })],
            }),
        );
    });
});
