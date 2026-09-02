import { ChannelType, MessageFlags, PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EAdminResultKind, type TAdminUseCases } from "../../../src/application/admin/types.ts";
import type { TApplicationUseCases } from "../../../src/application/useCases.types.ts";
import { buildDependentFunctionsRecord } from "../../../src/composition/utils/buildDependentFunctionsRecord.ts";
import { COMMANDS } from "../../../src/presentation/discord/commands.ts";
import {
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_COMMAND_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
    ADMIN_MINUTES_OPTION_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "../../../src/presentation/discord/commands/admin/constants.ts";
import type { TAdminCommandArgs } from "../../../src/presentation/discord/commands/admin/types.ts";
import { getCommandRunHandler } from "../../../src/presentation/discord/commands/handlers.ts";

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
        commandName: ADMIN_COMMAND_NAME,
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

async function runCommand(useCases: TApplicationUseCases, interaction: ChatInputCommandInteraction) {
    const command = getCommandRunHandler(COMMANDS)(interaction);
    if (!command) {
        throw new Error("No run handler found for test interaction.");
    }
    await buildDependentFunctionsRecord({ useCases }, { command }).command(interaction);
}

function getAdminCommandArgs(arg: Partial<TAdminUseCases> = {}): TAdminCommandArgs {
    return {
        useCases: {
            admin: {
                addLfgRole: vi.fn(),
                clearLfgChannel: vi.fn(),
                clearLfgRolePingCooldown: vi.fn(),
                getGuildConfig: vi.fn(),
                getLfgRoleConfig: vi.fn(),
                removeLfgRole: vi.fn(),
                setLfgChannel: vi.fn(),
                setLfgRoleLastPingedAt: vi.fn(),
                setLfgRolePingCooldown: vi.fn(),
                ...arg,
            },
            lfg: {
                changeRoomCode: vi.fn(),
                changeOwnedRoomCode: vi.fn(),
                createRoom: vi.fn(),
                disbandRoom: vi.fn(),
                disbandOwnedRoom: vi.fn(),
                getLfgStatus: vi.fn(),
                kickPlayerFromRoom: vi.fn(),
                kickPlayerFromOwnedRoom: vi.fn(),
                leaveRoom: vi.fn(),
                movePlayerToRoom: vi.fn(),
                transferRoomToPlayer: vi.fn(),
                transferOwnedRoomToPlayer: vi.fn(),
            },
            search: {
                resolveSearchInput: vi.fn(),
                suggestSearchResults: vi.fn(),
            },
        },
    };
}

describe("admin command", () => {
    test("rejects interactions outside guilds", async () => {
        const { useCases } = getAdminCommandArgs();
        const { interaction, reply } = getInteractionFixture({ inGuild: false });

        await runCommand(useCases, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: MessageFlags.Ephemeral,
                embeds: [expect.objectContaining({ title: "Admin unavailable" })],
            }),
        );
    });

    test("rejects users without ManageGuild", async () => {
        const { useCases } = getAdminCommandArgs();
        const { interaction, reply } = getInteractionFixture({ canManageGuild: false });

        await runCommand(useCases, interaction);

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
        const { useCases } = getAdminCommandArgs({ setLfgChannel });
        const { interaction, reply } = getInteractionFixture({
            action: "set",
            channel: { id: CHANNEL_ID, type: ChannelType.GuildText },
        });

        await runCommand(useCases, interaction);

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
        const { useCases } = getAdminCommandArgs({ addLfgRole });
        const { interaction, reply } = getInteractionFixture({
            subcommand: ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
            action: "add",
            role: { id: ROLE_ID },
        });

        await runCommand(useCases, interaction);

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
        const { useCases } = getAdminCommandArgs({ setLfgRolePingCooldown });
        const { interaction, reply } = getInteractionFixture({
            subcommand: ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
            action: "set",
            minutes: 45,
        });

        await runCommand(useCases, interaction);

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
        const { useCases } = getAdminCommandArgs({ getGuildConfig });
        const { interaction, reply } = getInteractionFixture({ subcommand: ADMIN_LFG_SHOW_SUBCOMMAND_NAME });

        await runCommand(useCases, interaction);

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
