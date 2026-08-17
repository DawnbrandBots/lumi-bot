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
import { ELfgPlayerRemovalKind } from "../../../src/domain/lfg/models/playerRemoval.types.ts";
import type { lfgManageCommandCommandRegistrationData } from "../../../src/presentation/discord/commandRegistrationData/lfgManage.ts";
import { getCommandRunHandler } from "../../../src/presentation/discord/commands/handlers.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_NEW_CODE_OPTION_NAME,
    LFG_PLAYER_OPTION_NAME,
} from "../../../src/presentation/discord/commands/lfg/constants.ts";
import { getLfgManageCommand } from "../../../src/presentation/discord/commands/lfgManage.ts";
import { LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME } from "../../../src/presentation/discord/commands/lfgManage/constants.ts";
import type { TCommandRunHandlers } from "../../../src/presentation/discord/commands/types.ts";

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
        guildId,
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

function getCommand({
    result,
    channel = null,
}: {
    readonly result: TLfgResult;
    readonly channel?: string | null;
}) {
    const lfgUseCases = {
        changeLfgRoomCode: vi.fn().mockResolvedValue(result),
        createLfgRoom: vi.fn().mockResolvedValue(result),
        moveLfgUser: vi.fn().mockResolvedValue(result),
        kickFromLfgRoom: vi.fn().mockResolvedValue(result),
        transferLfgRoom: vi.fn().mockResolvedValue(result),
        disbandLfgRoom: vi.fn().mockResolvedValue(result),
    };
    const getGuildConfig = vi.fn().mockResolvedValue({
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: channel ? { guild: GUILD_ID, lfgChannel: channel } : null,
    });

    return {
        getGuildConfig,
        command: getLfgManageCommand({
            getGuildConfig,
            ...lfgUseCases,
        }),
        lfgUseCases,
    };
}

async function runCommand(
    command: TCommandRunHandlers<typeof lfgManageCommandCommandRegistrationData>,
    interaction: ChatInputCommandInteraction,
) {
    const run = getCommandRunHandler({ run: command }, interaction);
    if (!run) {
        throw new Error("No run handler found for test interaction.");
    }
    await run(interaction);
}

describe(getLfgManageCommand.name, () => {
    test("rejects non-guild interactions", async () => {
        const { command, getGuildConfig, lfgUseCases } = getCommand({
            result: { kind: ELfgResultKind.INVALID_SUBCOMMAND },
        });
        const { interaction, reply } = getInteractionFixture({ guildId: null });

        await runCommand(command, interaction);

        expect(reply).toHaveBeenCalledWith(
            expect.objectContaining({
                flags: MessageFlags.Ephemeral,
                embeds: [expect.objectContaining({ title: "LFG management unavailable" })],
            }),
        );
        expect(getGuildConfig).not.toHaveBeenCalled();
        expect(lfgUseCases.createLfgRoom).not.toHaveBeenCalled();
    });

    test.each([
        {
            subcommand: "create",
            method: "createLfgRoom",
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
            method: "moveLfgUser",
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
            method: "changeLfgRoomCode",
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
            method: "kickFromLfgRoom",
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
            method: "transferLfgRoom",
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
            method: "disbandLfgRoom",
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
