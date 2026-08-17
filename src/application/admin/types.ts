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

export const enum EAdminResultKind {
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

type TAdminResultValueByKind = {
    [EAdminResultKind.LFG_CHANNEL_HELP]: { readonly channel: string | null | undefined };
    [EAdminResultKind.LFG_CHANNEL_SET]: { readonly channel: string };
    [EAdminResultKind.LFG_ROLE_PING_COOLDOWN_HELP]: { readonly minutes: number | null | undefined };
    [EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET]: { readonly minutes: number };
    [EAdminResultKind.LFG_ROLE_HELP]: { readonly roles: readonly string[] };
    [EAdminResultKind.LFG_ROLE_ADDED]: { readonly role: string };
    [EAdminResultKind.LFG_ROLE_REMOVED]: { readonly role: string };
    [EAdminResultKind.LFG_ROLE_ALREADY_EXISTS]: { readonly role: string };
    [EAdminResultKind.LFG_ROLE_NOT_FOUND]: { readonly role: string };
    [EAdminResultKind.LFG_GET_CONFIG]: TAdminGuildConfig | null;
    [EAdminResultKind.LFG_GET_ROLE_CONFIG]: TAdminLfgRoleConfig | null;
} & {
    [
        _ in
            | EAdminResultKind.LFG_CHANNEL_CLEARED
            | EAdminResultKind.LFG_CHANNEL_MISSING_CHANNEL
            | EAdminResultKind.LFG_CHANNEL_INVALID_OPTIONS
            | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED
            | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES
            | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS
            | EAdminResultKind.LFG_ROLE_MISSING_ROLE
            | EAdminResultKind.LFG_ROLE_INVALID_OPTIONS
            | EAdminResultKind.LFG_ROLE_LIMIT_REACHED
            | EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE
    ]: never;
};

// TODO: implement a utility type to reuse the following logic which can also be found in lfg/types
export type TAdminResultOfKind<Kind extends EAdminResultKind> = Kind extends EAdminResultKind
    ? TAdminResultValueByKind[Kind] extends never
        ? { readonly kind: Kind }
        : { readonly kind: Kind; readonly value: TAdminResultValueByKind[Kind] }
    : never;

export type TAdminResult = {
    [Kind in EAdminResultKind]: TAdminResultOfKind<Kind>;
}[EAdminResultKind];

export type TAdminResultTypes = {
    lfgChannel: TAdminResultOfKind<
        | EAdminResultKind.LFG_CHANNEL_HELP
        | EAdminResultKind.LFG_CHANNEL_SET
        | EAdminResultKind.LFG_CHANNEL_CLEARED
        | EAdminResultKind.LFG_CHANNEL_MISSING_CHANNEL
        | EAdminResultKind.LFG_CHANNEL_INVALID_OPTIONS
    >;
    lfgRolePingCooldown: TAdminResultOfKind<
        | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_HELP
        | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET
        | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED
        | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES
        | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS
    >;
    lfgRole: TAdminResultOfKind<
        | EAdminResultKind.LFG_ROLE_HELP
        | EAdminResultKind.LFG_ROLE_ADDED
        | EAdminResultKind.LFG_ROLE_REMOVED
        | EAdminResultKind.LFG_ROLE_MISSING_ROLE
        | EAdminResultKind.LFG_ROLE_INVALID_OPTIONS
        | EAdminResultKind.LFG_ROLE_ALREADY_EXISTS
        | EAdminResultKind.LFG_ROLE_NOT_FOUND
        | EAdminResultKind.LFG_ROLE_LIMIT_REACHED
        | EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE
    >;
    getGuildConfig: TAdminResultOfKind<EAdminResultKind.LFG_GET_CONFIG>;
    getLfgRoleConfig: TAdminResultOfKind<EAdminResultKind.LFG_GET_ROLE_CONFIG>;
};

export type TAddAdminLfgRole = (guild: string, role: string) => Promise<TAdminResultTypes["lfgRole"]>;
export type TClearAdminLfgChannel = (guild: string) => Promise<TAdminResultTypes["lfgChannel"]>;
export type TClearAdminLfgRolePingCooldown = (
    guild: string,
) => Promise<TAdminResultTypes["lfgRolePingCooldown"]>;
export type TGetAdminGuildConfig = (guild: string) => Promise<TAdminResultTypes["getGuildConfig"]>;
export type TGetAdminLfgRoleConfig = (
    guild: string,
    role: string,
) => Promise<TAdminResultTypes["getLfgRoleConfig"]>;
export type TRemoveAdminLfgRole = (guild: string, role: string) => Promise<TAdminResultTypes["lfgRole"]>;
export type TSetAdminLfgChannel = (
    guild: string,
    channel: string,
) => Promise<TAdminResultTypes["lfgChannel"]>;
export type TSetAdminLfgRoleLastPingedAt = (guild: string, role: string, date: Date) => Promise<void>;
export type TSetAdminLfgRolePingCooldown = (
    guild: string,
    minutes: number,
) => Promise<TAdminResultTypes["lfgRolePingCooldown"]>;

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
