import { ChannelType, MessageFlags, type ChatInputCommandInteraction, type InteractionResponse } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { getLfgCommand } from "../../src/lfg/command.ts";
import { LFG_CODE_OPTION_NAME, LFG_CREATE_SUBCOMMAND_NAME } from "../../src/lfg/constants.ts";
import type { LfgFeature } from "../../src/lfg/feature.ts";
import { ELfgFeatureReturnKind, type TLfgFeatureReturn } from "../../src/lfg/types.ts";

const GUILD_ID = "guild-1";
const USER_ID = "user-1";
const ROOM_CODE = "room";
const PUBLIC_CHANNEL_ID = "public-channel";
const OTHER_CHANNEL_ID = "other-channel";
const REPLY = {} as InteractionResponse<boolean>;

function getInteractionFixture(channelId: string, send = vi.fn().mockResolvedValue({})) {
    const fetch = vi.fn().mockResolvedValue({ type: ChannelType.GuildText, send });
    const reply = vi.fn().mockResolvedValue(REPLY);
    const interaction = {
        guildId: GUILD_ID,
        channelId,
        user: { id: USER_ID },
        guild: {
            channels: {
                fetch,
            },
        },
        options: {
            getSubcommand: vi.fn().mockReturnValue(LFG_CREATE_SUBCOMMAND_NAME),
            getString: vi.fn((name: string) => (name === LFG_CODE_OPTION_NAME ? ROOM_CODE : null)),
        },
        reply,
    } as unknown as ChatInputCommandInteraction;
    return { fetch, interaction, reply, send };
}

function getCommand({ response, channel }: { readonly response: TLfgFeatureReturn; readonly channel: string | null }) {
    return getLfgCommand({
        lfgFeature: {
            create: vi.fn().mockResolvedValue(response),
        } as unknown as LfgFeature,
        adminFeature: {
            getConfig: vi.fn().mockResolvedValue(channel ? { lfgChannel: channel } : null),
        },
    });
}

describe(getLfgCommand.name, () => {
    test("replies ephemerally when no channel is configured", async () => {
        const response = {
            kind: ELfgFeatureReturnKind.ROOM_CREATED,
            value: { userId: USER_ID, room: { code: ROOM_CODE, ownerId: USER_ID, playerIds: [USER_ID] } },
        } as const;
        const command = getCommand({ response, channel: null });
        const { fetch, interaction, reply } = getInteractionFixture(OTHER_CHANNEL_ID);

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: MessageFlags.Ephemeral }));
        expect(fetch).not.toHaveBeenCalled();
    });

    test("replies ephemerally and sends a public copy outside configured channel", async () => {
        const response = {
            kind: ELfgFeatureReturnKind.ROOM_CREATED,
            value: { userId: USER_ID, room: { code: ROOM_CODE, ownerId: USER_ID, playerIds: [USER_ID] } },
        } as const;
        const command = getCommand({ response, channel: PUBLIC_CHANNEL_ID });
        const send = vi.fn().mockResolvedValue({});
        const { fetch, interaction, reply } = getInteractionFixture(OTHER_CHANNEL_ID, send);

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: MessageFlags.Ephemeral }));
        expect(fetch).toHaveBeenCalledWith(PUBLIC_CHANNEL_ID);
        const publicMessage = send.mock.calls[0]?.[0] as { readonly flags?: unknown } | undefined;
        expect(publicMessage?.flags).toBeUndefined();
    });

    test("replies publicly in the configured channel", async () => {
        const response = {
            kind: ELfgFeatureReturnKind.ROOM_CREATED,
            value: { userId: USER_ID, room: { code: ROOM_CODE, ownerId: USER_ID, playerIds: [USER_ID] } },
        } as const;
        const command = getCommand({ response, channel: PUBLIC_CHANNEL_ID });
        const { fetch, interaction, reply } = getInteractionFixture(PUBLIC_CHANNEL_ID);

        await command.run(interaction);

        const publicReply = reply.mock.calls[0]?.[0] as { readonly flags?: unknown } | undefined;
        expect(publicReply?.flags).toBeUndefined();
        expect(fetch).not.toHaveBeenCalled();
    });

    test("does not mirror error responses", async () => {
        const response = { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE } as const;
        const command = getCommand({ response, channel: PUBLIC_CHANNEL_ID });
        const { fetch, interaction, reply } = getInteractionFixture(OTHER_CHANNEL_ID);

        await command.run(interaction);

        expect(reply).toHaveBeenCalledWith(expect.objectContaining({ flags: MessageFlags.Ephemeral }));
        expect(fetch).not.toHaveBeenCalled();
    });
});
