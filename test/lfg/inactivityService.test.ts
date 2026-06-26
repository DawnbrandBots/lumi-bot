import type { MikroORM } from "@mikro-orm/sqlite";
import type { APIEmbed, BaseMessageOptions } from "discord.js";
import { userMention } from "discord.js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import recreateDb from "../../scripts/utils/recreateDb.ts";
import { LfgFeature } from "../../src/lfg/feature.ts";
import { LfgInactivityService } from "../../src/lfg/inactivityService.ts";
import { LfgRoom } from "../../src/lfg/models/room.ts";
import { LfgRoomPlayer } from "../../src/lfg/models/roomPlayer.ts";
import { configsById } from "../mikro-orm.test.config.ts";
import { initTestLumiOrm } from "../orm.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";
const OWNER = { id: "owner" };
const PLAYER = { id: "player-1" };

let orm: MikroORM;
let feature: LfgFeature;
let now: Date;
let sendMessage: ReturnType<
    typeof vi.fn<(channelId: string, message: string | BaseMessageOptions) => Promise<boolean>>
>;
let canSendMessage: ReturnType<typeof vi.fn<(channelId: string) => Promise<boolean>>>;
let service: LfgInactivityService;

async function getPlayer(userId: string): Promise<LfgRoomPlayer> {
    const player = await orm.em.fork().findOne(LfgRoomPlayer, { userId, room: { guildId: GUILD_ID } });
    expect(player).not.toBeNull();
    return player as LfgRoomPlayer;
}

async function setPlayerActivity(userId: string, lastActivityAt: Date, inactivityWarnedAt: Date | null = null) {
    const em = orm.em.fork();
    const player = await em.findOne(LfgRoomPlayer, { userId, room: { guildId: GUILD_ID } });
    expect(player).not.toBeNull();
    if (!player) {
        return;
    }
    player.lastActivityAt = lastActivityAt.toISOString();
    player.inactivityWarnedAt = inactivityWarnedAt?.toISOString() ?? null;
    await em.flush();
}

async function getRoomCount(): Promise<number> {
    return orm.em.fork().count(LfgRoom, { guildId: GUILD_ID });
}

describe(LfgInactivityService.name, () => {
    beforeEach(async () => {
        await recreateDb(configsById.lumi);
        orm = await initTestLumiOrm();
        feature = new LfgFeature({ em: orm.em.fork() });
        now = new Date("2026-06-14T12:00:00.000Z");
        sendMessage = vi.fn().mockResolvedValue(true);
        canSendMessage = vi.fn().mockResolvedValue(true);
        service = new LfgInactivityService({
            orm,
            sendMessage,
            canSendMessage,
            now: () => now,
        });
    });

    afterEach(async () => {
        service.stop();
        await orm.close(true);
    });

    test("warns inactive players and removes them after the grace period", async () => {
        await feature.create(GUILD_ID, OWNER, "room");
        await service.handleLfgChannelChange(GUILD_ID, null, CHANNEL_ID);
        sendMessage.mockClear();
        await setPlayerActivity(OWNER.id, new Date("2026-06-14T10:59:59.000Z"));

        await service.runInactivityCheck();

        expect(sendMessage).toHaveBeenCalledWith(
            CHANNEL_ID,
            expect.stringContaining(`No LFG activity was detected in the past hour for: ${userMention(OWNER.id)}`),
        );
        expect((await getPlayer(OWNER.id)).inactivityWarnedAt).not.toBeNull();
        expect(await getRoomCount()).toBe(1);

        now = new Date("2026-06-14T12:05:01.000Z");
        sendMessage.mockClear();

        await service.runInactivityCheck();

        expect(await getRoomCount()).toBe(0);
        const removalMessage = sendMessage.mock.calls[0]?.[1] as BaseMessageOptions | undefined;
        const removalEmbed = removalMessage?.embeds?.[0] as APIEmbed | undefined;
        expect(removalEmbed?.description).toContain(`${userMention(OWNER.id)} was removed from`);
    });

    test("message activity clears a pending warning", async () => {
        await feature.create(GUILD_ID, OWNER, "room");
        await service.handleLfgChannelChange(GUILD_ID, null, CHANNEL_ID);
        await setPlayerActivity(OWNER.id, new Date("2026-06-14T10:59:59.000Z"), new Date("2026-06-14T12:00:00.000Z"));

        now = new Date("2026-06-14T12:01:00.000Z");
        await service.recordMessageActivity(GUILD_ID, CHANNEL_ID, OWNER.id);

        const player = await getPlayer(OWNER.id);
        expect(player.inactivityWarnedAt).toBeNull();
        expect(player.lastActivityAt).toBe("2026-06-14T12:01:00.000Z");

        now = new Date("2026-06-14T12:06:00.000Z");
        await service.runInactivityCheck();

        expect(await getRoomCount()).toBe(1);
    });

    test("enabling an LFG channel gives existing players a fresh hour", async () => {
        await feature.create(GUILD_ID, OWNER, "room");
        await feature.join(GUILD_ID, PLAYER, "room");
        await setPlayerActivity(OWNER.id, new Date("2026-06-14T10:00:00.000Z"), new Date("2026-06-14T11:00:00.000Z"));
        await setPlayerActivity(PLAYER.id, new Date("2026-06-14T10:00:00.000Z"));

        await service.handleLfgChannelChange(GUILD_ID, null, CHANNEL_ID);

        expect((await getPlayer(OWNER.id)).lastActivityAt).toBe("2026-06-14T12:00:00.000Z");
        expect((await getPlayer(OWNER.id)).inactivityWarnedAt).toBeNull();
        expect((await getPlayer(PLAYER.id)).lastActivityAt).toBe("2026-06-14T12:00:00.000Z");
        expect(sendMessage).toHaveBeenCalledWith(
            CHANNEL_ID,
            "This channel is now the LFG public channel. Inactivity cleanup is active here.",
        );
    });
});
