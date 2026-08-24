import type { MaybePromise } from "../../utils/types.ts";
import type { TAdminGuildConfig, TAdminLfgRoleConfig } from "./types.ts";

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
    readonly setLfgRolePingCooldown: (arg: {
        readonly guildId: string;
        readonly minutes: number;
    }) => MaybePromise<void>;
};
