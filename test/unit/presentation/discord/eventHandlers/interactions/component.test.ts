import type { MessageComponentInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import { describe, expect, test, vi } from "vitest";
import { EAdminResultKind } from "../../../../../../src/application/admin/types.ts";
import { ELfgResultKind } from "../../../../../../src/application/lfg/types.ts";
import { formatJoinButtonId } from "../../../../../../src/presentation/discord/commands/lfg/constants.ts";
import { handleComponentInteraction } from "../../../../../../src/presentation/discord/eventHandlers/interactions/component.ts";

const GUILD_ID = "guild-id";
const ROOM_ID = "room-id";
const USER_ID = "user-id";

function createFixture(customId: string = formatJoinButtonId(ROOM_ID)) {
    const reply = vi.fn();
    const interaction = {
        channelId: "channel-id",
        customId,
        guildId: GUILD_ID,
        inGuild: vi.fn().mockReturnValue(true),
        isButton: vi.fn().mockReturnValue(true),
        reply,
        user: { id: USER_ID },
    } as unknown as MessageComponentInteraction;
    const movePlayerToRoomById = vi.fn().mockResolvedValue({
        kind: ELfgResultKind.ROOM_NOT_FOUND,
        value: {},
    });
    const getGuildConfig = vi.fn().mockResolvedValue({
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: null,
    });

    return {
        getGuildConfig,
        interaction,
        movePlayerToRoomById,
        reply,
        useCases: { admin: { getGuildConfig }, lfg: { movePlayerToRoomById } },
    };
}

describe(handleComponentInteraction.name, () => {
    test("moves the player using the room id from a join button", async () => {
        const fixture = createFixture();

        await handleComponentInteraction({ interaction: fixture.interaction, useCases: fixture.useCases });

        expect(fixture.movePlayerToRoomById).toHaveBeenCalledWith({
            guildId: GUILD_ID,
            roomId: ROOM_ID,
            user: { id: USER_ID },
        });
        // TODO: I am not sure testing implementation is such a good idea
        expect(fixture.getGuildConfig).toHaveBeenCalledWith({ guildId: GUILD_ID });
        expect(fixture.reply).toHaveBeenCalledWith(
            expect.objectContaining({
                embeds: [expect.objectContaining({ description: "This room no longer exists." })],
                flags: [MessageFlags.Ephemeral],
            }),
        );
    });

    test("ignores unrelated component ids", async () => {
        const fixture = createFixture("unrelated");

        await handleComponentInteraction({ interaction: fixture.interaction, useCases: fixture.useCases });

        expect(fixture.movePlayerToRoomById).not.toHaveBeenCalled();
        expect(fixture.reply).not.toHaveBeenCalled();
    });
});
