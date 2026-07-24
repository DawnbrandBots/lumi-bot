import type { EntityManager } from "@mikro-orm/sqlite";
import { randomUUID } from "node:crypto";
import { ADMIN_ACTION_CLEAR, ADMIN_ACTION_SET } from "./constants.ts";
import { GuildConfig } from "./models/config.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "./types.ts";

type AdminFeatureCtorArg = {
    readonly em: EntityManager;
};

export type AdminLfgChannelAction = typeof ADMIN_ACTION_SET | typeof ADMIN_ACTION_CLEAR;

export class AdminFeature {
    private readonly em: EntityManager;

    public constructor({ em }: AdminFeatureCtorArg) {
        this.em = em;
    }

    public async getOrCreateConfig(guild: string): Promise<GuildConfig> {
        const config = await this._getGuildConfig(guild);
        if (config) {
            return config;
        }

        const newConfig = this.em.create(GuildConfig, {
            id: randomUUID(),
            guild,
            lfgChannel: null,
        });
        this.em.persist(newConfig);
        await this.em.flush();
        return newConfig;
    }

    public async lfgChannel(
        guild: string,
        action: AdminLfgChannelAction | null,
        channel: string | null,
    ): Promise<TAdminFeatureReturnTypes["lfgChannel"]> {
        // TODO: only create config on set action?
        const config = await this.getOrCreateConfig(guild);

        if (!action && !channel) {
            return {
                kind: EAdminFeatureReturnKind.LFG_CHANNEL_HELP,
                value: { channel: config.lfgChannel },
            };
        }

        if (action === ADMIN_ACTION_SET && channel) {
            config.lfgChannel = channel;
            await this.em.flush();
            return {
                kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
                value: { channel },
            };
        }

        if (action === ADMIN_ACTION_CLEAR && !channel) {
            config.lfgChannel = null;
            await this.em.flush();
            return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED };
        }

        if (action === ADMIN_ACTION_SET && !channel) {
            return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL };
        }

        return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS };
    }

    protected _getGuildConfig(guild: string): Promise<GuildConfig | null> {
        return this.em.findOne(GuildConfig, { guild });
    }

    public async getGuildConfig(guild: string): Promise<TAdminFeatureReturnTypes["getGuildConfig"]> {
        const config = await this._getGuildConfig(guild);
        return {
            kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
            value: config,
        };
    }
}
