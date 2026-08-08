import type { TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { MaybePromise } from "../../utils/types.ts";

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
    readonly addLfgRole: (guild: string, role: string) => Promise<TAdminFeatureReturnTypes["lfgRole"]>;
    readonly clearLfgChannel: (guild: string) => Promise<TAdminFeatureReturnTypes["lfgChannel"]>;
    readonly clearLfgRolePingCooldown: (guild: string) => Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]>;
    readonly getGuildConfig: (guild: string) => Promise<TAdminFeatureReturnTypes["getGuildConfig"]>;
    readonly getLfgRoleConfig: (guild: string, role: string) => Promise<TAdminFeatureReturnTypes["getLfgRoleConfig"]>;
    readonly removeLfgRole: (guild: string, role: string) => Promise<TAdminFeatureReturnTypes["lfgRole"]>;
    readonly setLfgChannel: (guild: string, channel: string) => Promise<TAdminFeatureReturnTypes["lfgChannel"]>;
    readonly setLfgRoleLastPingedAt: (guild: string, role: string, date: Date) => Promise<void>;
    readonly setLfgRolePingCooldown: (
        guild: string,
        minutes: number,
    ) => Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]>;
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
