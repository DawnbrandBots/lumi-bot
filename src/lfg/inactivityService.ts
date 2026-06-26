import type { MikroORM } from "@mikro-orm/sqlite";
import debug from "debug";
import { userMention, type BaseMessageOptions } from "discord.js";
import { GuildConfig } from "../admin/models/config.ts";
import { createPositiveMessage } from "../bot/message.ts";
import { LFG_ROOM_CODE_MARKER, LFG_ROOM_OWNER_LABEL } from "./constants.ts";
import { LfgFeature } from "./feature.ts";
import { LfgRoomPlayer } from "./models/roomPlayer.ts";
import { ELfgPlayerRemovalKind, type TLfgPlayerRemovalResult } from "./types.ts";

const log = debug("bot:lfg:inactivity");

// // For testing
// const DEFAULT_CHECK_INTERVAL_MS = 10 * 1000;
// const DEFAULT_INACTIVITY_MS = 5 * 1000;
// const DEFAULT_GRACE_MS = 5 * 1000;

const DEFAULT_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_INACTIVITY_MS = 60 * 60 * 1000;
const DEFAULT_GRACE_MS = 5 * 60 * 1000;

const DEFAULT_ACTIVITY_WRITE_DEBOUNCE_MS = 60 * 1000;
const DISCORD_MAX_MESSAGE_LENGTH = 2000;

type LfgInactivityServiceCtorArg = {
    readonly orm: MikroORM;
    readonly sendMessage: (channelId: string, message: string | BaseMessageOptions) => Promise<boolean>;
    readonly canSendMessage: (channelId: string) => Promise<boolean>;
    readonly checkIntervalMs?: number;
    readonly inactivityMs?: number;
    readonly graceMs?: number;
    readonly activityWriteDebounceMs?: number;
    readonly now?: () => Date;
};

type RemovedInactivePlayer = {
    readonly userId: string;
    readonly code: string;
} & TLfgPlayerRemovalResult;

function timestamp(value: Date | string): number {
    return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function formatRoomCode(code: string) {
    return `${LFG_ROOM_CODE_MARKER}${code}${LFG_ROOM_CODE_MARKER}`;
}

function formatInactiveRemoval(result: RemovedInactivePlayer): string {
    const base = `${userMention(result.userId)} was removed from ${formatRoomCode(result.code)} due to inactivity.`;
    switch (result.kind) {
        case ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED:
            return `${base} Ownership transferred to ${userMention(result.newOwnerId)} (${LFG_ROOM_OWNER_LABEL}).`;
        case ELfgPlayerRemovalKind.ROOM_DELETED:
            return `${base} Room deleted.`;
        case ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY:
            return base;
    }
}

function splitMentionMessages(prefix: string, userIds: readonly string[], suffix: string): string[] {
    const messages: string[] = [];
    let currentUserIds: string[] = [];

    for (const userId of userIds) {
        const nextUserIds = [...currentUserIds, userId];
        const nextMessage = formatMentionMessage(prefix, nextUserIds, suffix);
        if (currentUserIds.length > 0 && nextMessage.length > DISCORD_MAX_MESSAGE_LENGTH) {
            messages.push(formatMentionMessage(prefix, currentUserIds, suffix));
            currentUserIds = [userId];
        } else {
            currentUserIds = nextUserIds;
        }
    }

    if (currentUserIds.length > 0) {
        messages.push(formatMentionMessage(prefix, currentUserIds, suffix));
    }

    return messages;
}

function formatMentionMessage(prefix: string, userIds: readonly string[], suffix: string): string {
    return `${prefix}${userIds.map((userId) => userMention(userId)).join(", ")}${suffix}`;
}

// TODO: I find this class to be too tightly coupled to Discord
// Services are not supposed to be aware of what platform they are answering to.
// Methods should not be sending messages, rather that would be up to the platform-specific code to do so.

// TODO: like other services (should be named "feature" for now btw???),
// this should implement an interface with commented properties,
// and properties here should be typed with <INTERFACES>[<PROPERTY NAME>]
export class LfgInactivityService {
    private readonly orm: MikroORM;
    private readonly sendMessage: (channelId: string, message: string | BaseMessageOptions) => Promise<boolean>;
    private readonly canSendMessage: (channelId: string) => Promise<boolean>;
    private readonly checkIntervalMs: number;
    private readonly inactivityMs: number;
    private readonly graceMs: number;
    private readonly activityWriteDebounceMs: number;
    private readonly now: () => Date;
    private readonly activeChannels = new Map<string, string>();
    private readonly lastActivityWriteAtByPlayerId = new Map<string, number>();
    private interval: NodeJS.Timeout | null = null;

    // TODO: note to self, many of these constructor arg properties exist
    // to allow for better customization during tests
    public constructor({
        orm,
        sendMessage,
        canSendMessage,
        checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS,
        inactivityMs = DEFAULT_INACTIVITY_MS,
        graceMs = DEFAULT_GRACE_MS,
        activityWriteDebounceMs = DEFAULT_ACTIVITY_WRITE_DEBOUNCE_MS,
        now = () => new Date(),
    }: LfgInactivityServiceCtorArg) {
        this.orm = orm;
        this.sendMessage = sendMessage;
        this.canSendMessage = canSendMessage;
        this.checkIntervalMs = checkIntervalMs;
        this.inactivityMs = inactivityMs;
        this.graceMs = graceMs;
        this.activityWriteDebounceMs = activityWriteDebounceMs;
        this.now = now;
    }

    public async start() {
        await this.loadActiveChannels();
        this.interval = setInterval(() => {
            void this.runInactivityCheck();
        }, this.checkIntervalMs);
    }

    public stop() {
        if (!this.interval) {
            return;
        }
        clearInterval(this.interval);
        this.interval = null;
    }

    public async recordMessageActivity(guildId: string, channelId: string, userId: string) {
        if (this.activeChannels.get(guildId) !== channelId) {
            return;
        }
        await this.recordActivity(guildId, userId);
    }

    public async recordCommandActivity(guildId: string, userId: string) {
        if (!this.activeChannels.has(guildId)) {
            return;
        }
        await this.recordActivity(guildId, userId);
    }

    public async handleLfgChannelChange(
        guildId: string,
        previousChannelId: string | null,
        nextChannelId: string | null,
    ) {
        if (previousChannelId === nextChannelId) {
            return;
        }

        if (previousChannelId) {
            const message = nextChannelId
                ? "This channel is no longer the LFG public channel. Inactivity cleanup will continue in the new LFG channel."
                : "The LFG public channel was cleared. Inactivity cleanup will not occur while no LFG channel is set.";
            await this.sendBestEffort(previousChannelId, message);
        }

        if (!nextChannelId) {
            this.activeChannels.delete(guildId);
            await this.clearWarnings(guildId);
            return;
        }

        this.activeChannels.set(guildId, nextChannelId);
        if (!previousChannelId) {
            await this.resetActivityForGuild(guildId);
        } else {
            await this.clearWarnings(guildId);
        }

        await this.sendBestEffort(
            nextChannelId,
            "This channel is now the LFG public channel. Inactivity cleanup is active here.",
        );
    }

    public async runInactivityCheck() {
        const entries = [...this.activeChannels.entries()];
        for (const [guildId, channelId] of entries) {
            if (!(await this.canSendMessage(channelId))) {
                log(`Configured LFG channel ${channelId} is unavailable. Pausing inactivity cleanup for ${guildId}.`);
                continue;
            }

            const em = this.orm.em.fork();
            await this.warnInactivePlayers(guildId, channelId, em);
            await this.removeExpiredWarnedPlayers(guildId, channelId, em);
        }
    }

    private async loadActiveChannels() {
        const em = this.orm.em.fork();
        const configs = await em.find(GuildConfig, { lfgChannel: { $ne: null } });
        this.activeChannels.clear();
        for (const config of configs) {
            if (config.lfgChannel) {
                this.activeChannels.set(config.guild, config.lfgChannel);
            }
        }
    }

    private async recordActivity(guildId: string, userId: string) {
        const em = this.orm.em.fork();
        const player = await em.findOne(LfgRoomPlayer, { userId, room: { guildId } });
        if (!player) {
            return;
        }

        const now = this.now();
        const nowTimestamp = now.getTime();
        const lastWriteTimestamp = this.lastActivityWriteAtByPlayerId.get(player.id);
        if (
            !player.inactivityWarnedAt &&
            lastWriteTimestamp !== undefined &&
            nowTimestamp - lastWriteTimestamp < this.activityWriteDebounceMs
        ) {
            return;
        }

        player.lastActivityAt = now.toISOString();
        player.inactivityWarnedAt = null;
        this.lastActivityWriteAtByPlayerId.set(player.id, nowTimestamp);
        await em.flush();
    }

    // TODO: note to self: the service's behavior is not obvious and must absolutely be documented outside the code
    private async warnInactivePlayers(guildId: string, channelId: string, em: ReturnType<MikroORM["em"]["fork"]>) {
        const inactiveBefore = new Date(this.now().getTime() - this.inactivityMs).toISOString();
        const inactivePlayers = await em.find(
            LfgRoomPlayer,
            {
                room: { guildId },
                lastActivityAt: { $lte: inactiveBefore },
                inactivityWarnedAt: null,
            },
            { orderBy: { joinedAt: "asc" } },
        );
        if (inactivePlayers.length === 0) {
            return;
        }

        const messages = splitMentionMessages(
            "No LFG activity was detected in the past hour for: ",
            inactivePlayers.map((player) => player.userId),
            ". Send any message in this channel within 5 minutes to stay in your room.",
        );
        for (const message of messages) {
            if (!(await this.sendMessage(channelId, message))) {
                log(`Failed to send LFG inactivity warning in channel ${channelId}.`);
                return;
            }
        }

        const warnedAt = this.now().toISOString();
        for (const player of inactivePlayers) {
            player.inactivityWarnedAt = warnedAt;
        }
        await em.flush();
    }

    private async removeExpiredWarnedPlayers(
        guildId: string,
        channelId: string,
        em: ReturnType<MikroORM["em"]["fork"]>,
    ) {
        const warnedBefore = new Date(this.now().getTime() - this.graceMs).toISOString();
        const players = await em.find(
            LfgRoomPlayer,
            {
                room: { guildId },
                inactivityWarnedAt: { $lte: warnedBefore },
            },
            { orderBy: { joinedAt: "asc" } },
        );

        for (const player of players) {
            if (!player.inactivityWarnedAt || timestamp(player.lastActivityAt) > timestamp(player.inactivityWarnedAt)) {
                player.inactivityWarnedAt = null;
                continue;
            }

            // TODO: a new LfgFeature should not be created
            const feature = new LfgFeature({ em });
            const result = await feature.removePlayer(guildId, player.userId);
            if (!result) {
                continue;
            }
            await this.sendMessage(
                channelId,
                createPositiveMessage({
                    embed: {
                        description: formatInactiveRemoval(result),
                    },
                }),
            );
        }

        await em.flush();
    }

    private async resetActivityForGuild(guildId: string) {
        const em = this.orm.em.fork();
        const players = await em.find(LfgRoomPlayer, { room: { guildId } });
        const now = this.now().toISOString();
        for (const player of players) {
            player.lastActivityAt = now;
            player.inactivityWarnedAt = null;
            this.lastActivityWriteAtByPlayerId.delete(player.id);
        }
        await em.flush();
    }

    private async clearWarnings(guildId: string) {
        const em = this.orm.em.fork();
        const players = await em.find(LfgRoomPlayer, { room: { guildId }, inactivityWarnedAt: { $ne: null } });
        for (const player of players) {
            player.inactivityWarnedAt = null;
        }
        await em.flush();
    }

    private async sendBestEffort(channelId: string, message: string | BaseMessageOptions) {
        if (await this.sendMessage(channelId, message)) {
            return;
        }
        log(`Failed to send LFG inactivity service message in channel ${channelId}.`);
    }
}
