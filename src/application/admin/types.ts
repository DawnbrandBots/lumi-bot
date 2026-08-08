import type {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_REMOVE,
    ADMIN_ACTION_SET,
} from "../../admin/constants.ts";
import type { TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type AdminActionOptions = typeof ADMIN_ACTION_SET | typeof ADMIN_ACTION_CLEAR;
export type AdminLfgChannelAction = AdminActionOptions;
export type AdminLfgRolePingCooldownAction = AdminActionOptions;
export type AdminLfgRoleAction = typeof ADMIN_ACTION_ADD | typeof ADMIN_ACTION_REMOVE;

export type TAdminLfgRoleConfig = {
    readonly lastPingedAt: string | null;
    readonly role: string;
};

export type TAdminGuildConfig = {
    readonly lfgChannel: string | null;
    readonly lfgRolePingCooldownMinutes: number | null;
    readonly lfgRoles: readonly TAdminLfgRoleConfig[];
};

export type TAdminFeature = {
    readonly getGuildConfig: (guild: string) => Promise<TAdminFeatureReturnTypes["getGuildConfig"]>;
    readonly getLfgRoleConfig: (guild: string, role: string) => Promise<TAdminFeatureReturnTypes["getLfgRoleConfig"]>;
    readonly lfgChannel: (
        guild: string,
        action: AdminLfgChannelAction | null,
        channel: string | null,
    ) => Promise<TAdminFeatureReturnTypes["lfgChannel"]>;
    readonly lfgRole: (
        guild: string,
        action: AdminLfgRoleAction | null,
        role: string | null,
    ) => Promise<TAdminFeatureReturnTypes["lfgRole"]>;
    readonly lfgRolePingCooldown: (
        guild: string,
        action: AdminLfgRolePingCooldownAction | null,
        minutes: number | null,
    ) => Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]>;
    readonly setLfgRoleLastPingedAt: (guild: string, role: string, date: Date) => Promise<void>;
};

export type TAdminPersistence = {
    readonly addLfgRole: (arg: { readonly guildId: string; readonly roleId: string }) => MaybePromise<void>;
    readonly clearLfgChannel: (arg: { readonly guildId: string }) => MaybePromise<void>;
    readonly clearLfgRolePingCooldown: (arg: { readonly guildId: string }) => MaybePromise<void>;
    readonly getGuildConfig: (arg: { readonly guildId: string }) => MaybePromise<TAdminGuildConfig | null>;
    readonly getLfgRole: (arg: {
        readonly guildId: string;
        readonly roleId: string;
    }) => MaybePromise<TAdminLfgRoleConfig | null>;
    readonly getOrCreateGuildConfig: (arg: { readonly guildId: string }) => MaybePromise<TAdminGuildConfig>;
    readonly listLfgRoles: (arg: { readonly guildId: string }) => MaybePromise<readonly TAdminLfgRoleConfig[]>;
    readonly removeLfgRole: (arg: { readonly guildId: string; readonly roleId: string }) => MaybePromise<void>;
    readonly setLfgChannel: (arg: { readonly guildId: string; readonly channelId: string }) => MaybePromise<void>;
    readonly setLfgRoleLastPingedAt: (arg: {
        readonly guildId: string;
        readonly roleId: string;
        readonly date: Date;
    }) => MaybePromise<void>;
    readonly setLfgRolePingCooldown: (arg: { readonly guildId: string; readonly minutes: number }) => MaybePromise<void>;
};
