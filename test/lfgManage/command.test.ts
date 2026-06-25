import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    userMention,
    type ChatInputCommandInteraction,
    type InteractionResponse,
} from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../../src/lfg/constants.ts";
import type { LfgFeature } from "../../src/lfg/feature.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind, type TLfgFeatureReturn } from "../../src/lfg/types.ts";
import { getLfgManageCommand } from "../../src/lfgManage/command.ts";

const GUILD_ID = "guild-1";
const ADMIN_ID = "admin";
const PLAYER_ID = "player";
const ROOM_CODE = "room";
const PUBLIC_CHANNEL_ID = "public-channel";
const OTHER_CHANNEL_ID = "other-channel";
const REPLY = {} as InteractionResponse<boolean>;

function getInteractionFixture({
    canManageGuild = true,
    channelId = OTHER_CHANNEL_ID,
    subcommand = "create",
    send = vi.fn().mockResolvedValue({}),
}: {
    readonly canManageGuild?: boolean;
    readonly channelId?: string;
    readonly subcommand?: string;
    readonly send?: ReturnType<typeof vi.fn>;
} = {}) {
    const channelFetch = vi.fn().mockResolvedValue({ type: ChannelType.GuildText, send });
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        guildId: GUILD_ID,
        channelId,
        user: { id: ADMIN_ID },
        memberPermissions: {
            has: vi.fn((permission) => permission === PermissionFlagsBits.ManageGuild && canManageGuild),
        },
        guild: {
            channels: {
                fetch: channelFetch,
            },
        },
        options: {
            getSubcommand: vi.fn().mockReturnValue(subcommand),
            getString: vi.fn((name: string) => (name === LFG_CODE_OPTION_NAME ? ROOM_CODE : null)),
            getUser: vi.fn((name: string) => (name === LFG_PLAYER_OPTION_NAME ? { id: PLAYER_ID } : null)),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;

    return { channelFetch, interaction, reply, send };
}

function getCommand({
    result,
    channel = null,
}: {
    readonly result: TLfgFeatureReturn;
    readonly channel?: string | null;
}) {
    const lfgFeature = {
        create: vi.fn().mockResolvedValue(result),
        move: vi.fn().mockResolvedValue(result),
        kick: vi.fn().mockResolvedValue(result),
        disband: vi.fn().mockResolvedValue(result),
    };
    const adminFeature = {
        getGuildConfig: vi.fn().mockResolvedValue({
            kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
            value: channel ? { guild: GUILD_ID, lfgChannel: channel } : null,
        }),
    };

    return {
        adminFeature,
        command: getLfgManageCommand({
            adminFeature: adminFeature,
            lfgFeature: lfgFeature as unknown as LfgFeature,
        }),
        lfgFeature,
    };
}

describe(getLfgManageCommand.name, () => {
    test("rejects users without Manage Server", async () => {
        const { adminFeature, command, lfgFeature } = getCommand({
            result: { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND },
        });
        const { interaction, reply } = getInteractionFixture({ canManageGuild: false });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: MessageFlags.Ephemeral,
                embeds: [expect.objectContaining({ title: "Missing permission" })],
            }),
        );
        expect(adminFeature.getGuildConfig).not.toHaveBeenCalled();
        expect(lfgFeature.create).not.toHaveBeenCalled();
    });

    test.each([
        {
            subcommand: "create",
            method: "create",
            result: {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: {
                    userId: PLAYER_ID,
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgFeatureReturn,
            expectedArgs: [GUILD_ID, { id: PLAYER_ID }, ROOM_CODE],
        },
        {
            subcommand: "move",
            method: "move",
            result: {
                kind: ELfgFeatureReturnKind.ROOM_JOINED,
                value: {
                    userId: PLAYER_ID,
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            } satisfies TLfgFeatureReturn,
            expectedArgs: [GUILD_ID, { id: PLAYER_ID }, ROOM_CODE],
        },
        {
            subcommand: "kick",
            method: "kick",
            result: {
                kind: ELfgFeatureReturnKind.PLAYER_KICKED,
                value: {
                    userId: PLAYER_ID,
                    targetId: PLAYER_ID,
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [] },
                    removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED },
                },
            } satisfies TLfgFeatureReturn,
            expectedArgs: [GUILD_ID, ROOM_CODE, { id: PLAYER_ID }],
        },
        {
            subcommand: "disband",
            method: "disband",
            result: {
                kind: ELfgFeatureReturnKind.ROOM_DISBANDED,
                value: { userId: PLAYER_ID, code: ROOM_CODE },
            } satisfies TLfgFeatureReturn,
            expectedArgs: [GUILD_ID, ROOM_CODE],
        },
    ] as const)("dispatches $subcommand", async ({ expectedArgs, method, result, subcommand }) => {
        const { command, lfgFeature } = getCommand({ result });
        const { interaction, reply } = getInteractionFixture({ subcommand });

        await command.run(interaction);

        expect(lfgFeature[method]).toHaveBeenCalledWith(...expectedArgs);
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
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: {
                    userId: PLAYER_ID,
                    room: { code: ROOM_CODE, ownerId: PLAYER_ID, playerIds: [PLAYER_ID] },
                },
            },
        });
        const send = vi.fn().mockResolvedValue({});
        const { channelFetch, interaction, reply } = getInteractionFixture({ send });

        await command.run(interaction);

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
            result: { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code: ROOM_CODE } },
        });
        const { channelFetch, interaction, reply } = getInteractionFixture({ subcommand: "disband" });

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: [MessageFlags.Ephemeral] }));
        expect(channelFetch).not.toHaveBeenCalled();
    });
});
