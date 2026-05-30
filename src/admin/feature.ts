import type { EntityManager } from "@mikro-orm/sqlite";
import type { InteractionReplyOptions } from "discord.js";
import { channelMention, MessageFlags } from "discord.js";
import { randomUUID } from "node:crypto";
import { createErrorMessage, createNeutralMessage, createPositiveMessage } from "../bot/message.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_NO_VALUE,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
} from "./constants.ts";
import { Config } from "./models/config.ts";

type AdminFeatureCtorArg = {
    readonly em: EntityManager;
};

export type AdminLfgChannelAction = typeof ADMIN_ACTION_SET | typeof ADMIN_ACTION_CLEAR;

export class AdminFeature {
    private readonly em: EntityManager;

    public constructor({ em }: AdminFeatureCtorArg) {
        this.em = em;
    }

    public getConfig(guild: string): Promise<Config | null> {
        return this.em.findOne(Config, { guild });
    }

    public async getOrCreateConfig(guild: string): Promise<Config> {
        const config = await this.em.findOne(Config, { guild });
        if (config) {
            return config;
        }

        const newConfig = this.em.create(Config, {
            id: randomUUID(),
            guild,
            channel: null,
        });
        this.em.persist(newConfig);
        await this.em.flush();
        return newConfig;
    }

    public async lfgChannel(guild: string, action: AdminLfgChannelAction | null, channel: string | null) {
        const config = await this.getOrCreateConfig(guild);

        if (!action && !channel) {
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG public channel",
                    description: [
                        "Sets the channel where LFG messages are sent.",
                        "By default, LFG messages are only visible to the command user.",
                        "",
                        "**Valid combinations:**",
                        `- \`/admin lfg ${ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME}\`: Show this help and current value.`,
                        `- \`/admin lfg ${ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_SET} ${ADMIN_CHANNEL_OPTION_NAME}:#channel\`: Set the public channel.`,
                        `- \`/admin lfg ${ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_CLEAR}\`: Clear the public channel.`,
                        "",
                        `**Current value:** ${this.formatChannel(config.channel)}`,
                    ].join("\n"),
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        if (action === ADMIN_ACTION_SET && channel) {
            config.channel = channel;
            await this.em.flush();
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG public channel set",
                    description: `LFG messages will be posted in ${channelMention(channel)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        if (action === ADMIN_ACTION_CLEAR && !channel) {
            config.channel = null;
            await this.em.flush();
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG public channel cleared",
                    description: "LFG messages are now only visible by command users.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                title: "Invalid options combination",
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    public async lfgShow(guild: string) {
        const config = await this.getOrCreateConfig(guild);
        return createNeutralMessage<InteractionReplyOptions>({
            embed: {
                title: "LFG config",
                fields: [{ name: "Channel", value: this.formatChannel(config.channel) }],
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    private formatChannel(channel: string | null | undefined): string {
        return channel ? channelMention(channel) : ADMIN_LFG_CHANNEL_NO_VALUE;
    }
}
