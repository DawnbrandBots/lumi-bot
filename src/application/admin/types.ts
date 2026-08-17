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

export const enum EAdminFeatureReturnKind {
    LFG_CHANNEL_HELP = "LFG_CHANNEL_HELP",
    LFG_CHANNEL_SET = "LFG_CHANNEL_SET",
    LFG_CHANNEL_CLEARED = "LFG_CHANNEL_CLEARED",
    LFG_CHANNEL_MISSING_CHANNEL = "LFG_CHANNEL_MISSING_CHANNEL",
    LFG_CHANNEL_INVALID_OPTIONS = "LFG_CHANNEL_INVALID_OPTIONS",
    LFG_ROLE_PING_COOLDOWN_HELP = "LFG_ROLE_PING_COOLDOWN_HELP",
    LFG_ROLE_PING_COOLDOWN_SET = "LFG_ROLE_PING_COOLDOWN_SET",
    LFG_ROLE_PING_COOLDOWN_CLEARED = "LFG_ROLE_PING_COOLDOWN_CLEARED",
    LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES = "LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES",
    LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS = "LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS",
    LFG_ROLE_HELP = "LFG_ROLE_HELP",
    LFG_ROLE_ADDED = "LFG_ROLE_ADDED",
    LFG_ROLE_REMOVED = "LFG_ROLE_REMOVED",
    LFG_ROLE_MISSING_ROLE = "LFG_ROLE_MISSING_ROLE",
    LFG_ROLE_INVALID_OPTIONS = "LFG_ROLE_INVALID_OPTIONS",
    LFG_ROLE_ALREADY_EXISTS = "LFG_ROLE_ALREADY_EXISTS",
    LFG_ROLE_NOT_FOUND = "LFG_ROLE_NOT_FOUND",
    LFG_ROLE_LIMIT_REACHED = "LFG_ROLE_LIMIT_REACHED",
    LFG_ROLE_CANNOT_BE_EVERYONE = "LFG_ROLE_CANNOT_BE_EVERYONE",
    LFG_GET_CONFIG = "LFG_GET_CONFIG",
    LFG_GET_ROLE_CONFIG = "LFG_GET_ROLE_CONFIG",
}

type TAdminFeatureReturnValueByKind = {
    [EAdminFeatureReturnKind.LFG_CHANNEL_HELP]: { readonly channel: string | null | undefined };
    [EAdminFeatureReturnKind.LFG_CHANNEL_SET]: { readonly channel: string };
    [EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_HELP]: { readonly minutes: number | null | undefined };
    [EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET]: { readonly minutes: number };
    [EAdminFeatureReturnKind.LFG_ROLE_HELP]: { readonly roles: readonly string[] };
    [EAdminFeatureReturnKind.LFG_ROLE_ADDED]: { readonly role: string };
    [EAdminFeatureReturnKind.LFG_ROLE_REMOVED]: { readonly role: string };
    [EAdminFeatureReturnKind.LFG_ROLE_ALREADY_EXISTS]: { readonly role: string };
    [EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND]: { readonly role: string };
    [EAdminFeatureReturnKind.LFG_GET_CONFIG]: TAdminGuildConfig | null;
    [EAdminFeatureReturnKind.LFG_GET_ROLE_CONFIG]: TAdminLfgRoleConfig | null;
} & {
    [
        _ in
            | EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED
            | EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL
            | EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS
            | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_CLEARED
            | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES
            | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS
            | EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE
            | EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS
            | EAdminFeatureReturnKind.LFG_ROLE_LIMIT_REACHED
            | EAdminFeatureReturnKind.LFG_ROLE_CANNOT_BE_EVERYONE
    ]: never;
};

// TODO: implement a utility type to reuse the following logic which can also be found in lfg/types
export type TAdminFeatureReturnOfKind<Kind extends EAdminFeatureReturnKind> = Kind extends EAdminFeatureReturnKind
    ? TAdminFeatureReturnValueByKind[Kind] extends never
        ? { readonly kind: Kind }
        : { readonly kind: Kind; readonly value: TAdminFeatureReturnValueByKind[Kind] }
    : never;

export type TAdminFeatureReturn = {
    [Kind in EAdminFeatureReturnKind]: TAdminFeatureReturnOfKind<Kind>;
}[EAdminFeatureReturnKind];

export type TAdminFeatureReturnTypes = {
    lfgChannel: TAdminFeatureReturnOfKind<
        | EAdminFeatureReturnKind.LFG_CHANNEL_HELP
        | EAdminFeatureReturnKind.LFG_CHANNEL_SET
        | EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED
        | EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL
        | EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS
    >;
    lfgRolePingCooldown: TAdminFeatureReturnOfKind<
        | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_HELP
        | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET
        | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_CLEARED
        | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES
        | EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS
    >;
    lfgRole: TAdminFeatureReturnOfKind<
        | EAdminFeatureReturnKind.LFG_ROLE_HELP
        | EAdminFeatureReturnKind.LFG_ROLE_ADDED
        | EAdminFeatureReturnKind.LFG_ROLE_REMOVED
        | EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE
        | EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS
        | EAdminFeatureReturnKind.LFG_ROLE_ALREADY_EXISTS
        | EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND
        | EAdminFeatureReturnKind.LFG_ROLE_LIMIT_REACHED
        | EAdminFeatureReturnKind.LFG_ROLE_CANNOT_BE_EVERYONE
    >;
    getGuildConfig: TAdminFeatureReturnOfKind<EAdminFeatureReturnKind.LFG_GET_CONFIG>;
    getLfgRoleConfig: TAdminFeatureReturnOfKind<EAdminFeatureReturnKind.LFG_GET_ROLE_CONFIG>;
};

export type TAddAdminLfgRole = (guild: string, role: string) => Promise<TAdminFeatureReturnTypes["lfgRole"]>;
export type TClearAdminLfgChannel = (guild: string) => Promise<TAdminFeatureReturnTypes["lfgChannel"]>;
export type TClearAdminLfgRolePingCooldown = (
    guild: string,
) => Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]>;
export type TGetAdminGuildConfig = (guild: string) => Promise<TAdminFeatureReturnTypes["getGuildConfig"]>;
export type TGetAdminLfgRoleConfig = (
    guild: string,
    role: string,
) => Promise<TAdminFeatureReturnTypes["getLfgRoleConfig"]>;
export type TRemoveAdminLfgRole = (guild: string, role: string) => Promise<TAdminFeatureReturnTypes["lfgRole"]>;
export type TSetAdminLfgChannel = (
    guild: string,
    channel: string,
) => Promise<TAdminFeatureReturnTypes["lfgChannel"]>;
export type TSetAdminLfgRoleLastPingedAt = (guild: string, role: string, date: Date) => Promise<void>;
export type TSetAdminLfgRolePingCooldown = (
    guild: string,
    minutes: number,
) => Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]>;

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
