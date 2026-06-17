import type { EntityManager } from "@mikro-orm/sqlite";
import { randomUUID } from "node:crypto";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_REMOVE,
    ADMIN_ACTION_SET,
    ADMIN_LFG_ROLE_LIMIT,
} from "./constants.ts";
import { GuildConfig } from "./models/config.ts";
import { GuildConfigLfgRole } from "./models/configLfgRole.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "./types.ts";

type AdminFeatureCtorArg = {
    readonly em: EntityManager;
};

export type AdminActionOptions = typeof ADMIN_ACTION_SET | typeof ADMIN_ACTION_CLEAR;
export type AdminLfgChannelAction = AdminActionOptions;
export type AdminLfgRoleAction = typeof ADMIN_ACTION_ADD | typeof ADMIN_ACTION_REMOVE;

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

    public async lfgRole(
        guild: string,
        action: AdminLfgRoleAction | null,
        role: string | null,
    ): Promise<TAdminFeatureReturnTypes["lfgRole"]> {
        const config = await this.getOrCreateConfig(guild);
        const roles = await this.getLfgRoles(guild);

        if (!action && !role) {
            return {
                kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
                value: { roles: roles.map((lfgRole) => lfgRole.role) },
            };
        }

        if (action === ADMIN_ACTION_ADD && role) {
            if (roles.some((lfgRole) => lfgRole.role === role)) {
                return { kind: EAdminFeatureReturnKind.LFG_ROLE_ALREADY_EXISTS, value: { role } };
            }
            if (roles.length >= ADMIN_LFG_ROLE_LIMIT) {
                return { kind: EAdminFeatureReturnKind.LFG_ROLE_LIMIT_REACHED };
            }
            const lfgRole = this.em.create(GuildConfigLfgRole, {
                id: randomUUID(),
                guildConfig: config,
                role,
                lastPingedAt: null,
            });
            this.em.persist(lfgRole);
            await this.em.flush();
            return {
                kind: EAdminFeatureReturnKind.LFG_ROLE_ADDED,
                value: { role },
            };
        }

        if (action === ADMIN_ACTION_REMOVE && role) {
            const lfgRole = roles.find((candidate) => candidate.role === role);
            if (!lfgRole) {
                return { kind: EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND, value: { role } };
            }
            this.em.remove(lfgRole);
            await this.em.flush();
            return { kind: EAdminFeatureReturnKind.LFG_ROLE_REMOVED, value: { role } };
        }

        if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
            return { kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE };
        }

        return { kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS };
    }

    public async getLfgRoleConfig(guild: string, role: string): Promise<TAdminFeatureReturnTypes["getLfgRoleConfig"]> {
        const lfgRole = await this.getLfgRole(guild, role);
        return {
            kind: EAdminFeatureReturnKind.LFG_GET_ROLE_CONFIG,
            value: lfgRole,
        };
    }

    public async setLfgRoleLastPingedAt(guild: string, role: string, date: Date): Promise<void> {
        const lfgRole = await this.getLfgRole(guild, role);
        if (!lfgRole) {
            return;
        }
        lfgRole.lastPingedAt = date.toISOString();
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
        const config = await this.em.findOne(GuildConfig, { guild }, { populate: ["lfgRoles"] });
        return {
            kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
            value: config,
        };
    }

    protected getLfgRoles(guild: string): Promise<GuildConfigLfgRole[]> {
        return this.em.find(GuildConfigLfgRole, { guildConfig: { guild } }, { orderBy: { role: "asc" } });
    }

    protected getLfgRole(guild: string, role: string): Promise<GuildConfigLfgRole | null> {
        return this.em.findOne(GuildConfigLfgRole, { guildConfig: { guild }, role });
    }
}
