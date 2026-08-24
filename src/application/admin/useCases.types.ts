import type { TAdminPersistence } from "./persistence.types.ts";
import type { TAdminResultTypes } from "./types.ts";

export type TAdminUseCaseDependencies = {
    readonly persistence: TAdminPersistence;
};

export type TAdminUseCases = {
    readonly addLfgRole: (arg: {
        readonly guildId: string;
        readonly roleId: string;
    }) => Promise<TAdminResultTypes["lfgRole"]>;
    readonly clearLfgChannel: (arg: { readonly guildId: string }) => Promise<TAdminResultTypes["lfgChannel"]>;
    readonly clearLfgRolePingCooldown: (arg: {
        readonly guildId: string;
    }) => Promise<TAdminResultTypes["lfgRolePingCooldown"]>;
    readonly getGuildConfig: (arg: { readonly guildId: string }) => Promise<TAdminResultTypes["getGuildConfig"]>;
    readonly getLfgRoleConfig: (arg: {
        readonly guildId: string;
        readonly roleId: string;
    }) => Promise<TAdminResultTypes["getLfgRoleConfig"]>;
    readonly removeLfgRole: (arg: {
        readonly guildId: string;
        readonly roleId: string;
    }) => Promise<TAdminResultTypes["lfgRole"]>;
    readonly setLfgChannel: (arg: {
        readonly guildId: string;
        readonly channelId: string;
    }) => Promise<TAdminResultTypes["lfgChannel"]>;
    readonly setLfgRoleLastPingedAt: (arg: {
        readonly guildId: string;
        readonly roleId: string;
        readonly date: Date;
    }) => Promise<void>;
    readonly setLfgRolePingCooldown: (arg: {
        readonly guildId: string;
        readonly minutes: number;
    }) => Promise<TAdminResultTypes["lfgRolePingCooldown"]>;
};
