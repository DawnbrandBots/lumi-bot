import type { EntityManager } from "@mikro-orm/sqlite";
import { randomUUID } from "node:crypto";
import { ADMIN_ACTION_CLEAR, ADMIN_ACTION_SET } from "./constants.ts";
import { GuildConfig } from "./models/config.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "./types.ts";

type AdminFeatureCtorArg = {
    readonly em: EntityManager;
};

export type AdminActionOptions = typeof ADMIN_ACTION_SET | typeof ADMIN_ACTION_CLEAR;
export type AdminLfgChannelAction = AdminActionOptions;
export type AdminLfgRoleAction = AdminActionOptions;

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
            lfgRole: null,
            lfgRoleLastPingedAt: null,
        });
        this.em.persist(newConfig);
        await this.em.flush();
        return newConfig;
    }

    public async lfgRole(
        guild: string,
        action: AdminLfgRoleAction | null,
        role: string | null,
    ): Promise<TAdminFeatureReturnTypes["lfgRole"]> {
        const config = await this.getOrCreateConfig(guild);

        if (!action && !role) {
            return {
                kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
                value: { role: config.lfgRole },
            };
        }

        if (action === ADMIN_ACTION_SET && role) {
            config.lfgRole = role;
            await this.em.flush();
            return {
                kind: EAdminFeatureReturnKind.LFG_ROLE_SET,
                value: { role },
            };
        }

        if (action === ADMIN_ACTION_CLEAR && !role) {
            config.lfgRole = null;
            await this.em.flush();
            return { kind: EAdminFeatureReturnKind.LFG_ROLE_CLEARED };
        }

        if (action === ADMIN_ACTION_SET && !role) {
            return { kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE };
        }

        return { kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS };
    }

    public async setLfgRoleLastPingedAt(guild: string, date: Date): Promise<void> {
        const config = await this.getOrCreateConfig(guild);
        config.lfgRoleLastPingedAt = date.toISOString();
        await this.em.flush();
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
