export type { TAdminPersistence } from "./persistence.types.ts";
export type { TAdminUseCases } from "./useCases.types.ts";

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
    LFG_CHANNEL_SET = "LFG_CHANNEL_SET",
    LFG_CHANNEL_CLEARED = "LFG_CHANNEL_CLEARED",
    LFG_ROLE_PING_COOLDOWN_SET = "LFG_ROLE_PING_COOLDOWN_SET",
    LFG_ROLE_PING_COOLDOWN_CLEARED = "LFG_ROLE_PING_COOLDOWN_CLEARED",
    LFG_ROLE_ADDED = "LFG_ROLE_ADDED",
    LFG_ROLE_REMOVED = "LFG_ROLE_REMOVED",
    LFG_ROLE_ALREADY_EXISTS = "LFG_ROLE_ALREADY_EXISTS",
    LFG_ROLE_NOT_FOUND = "LFG_ROLE_NOT_FOUND",
    LFG_ROLE_LIMIT_REACHED = "LFG_ROLE_LIMIT_REACHED",
    LFG_ROLE_CANNOT_BE_EVERYONE = "LFG_ROLE_CANNOT_BE_EVERYONE",
    LFG_GET_CONFIG = "LFG_GET_CONFIG",
    LFG_GET_ROLE_CONFIG = "LFG_GET_ROLE_CONFIG",
}

type TAdminResultValueByKind = {
    [EAdminResultKind.LFG_CHANNEL_SET]: { readonly channel: string };
    [EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET]: { readonly minutes: number };
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
            | EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED
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
    addLfgRole: TAdminResultOfKind<
        | EAdminResultKind.LFG_ROLE_ADDED
        | EAdminResultKind.LFG_ROLE_ALREADY_EXISTS
        | EAdminResultKind.LFG_ROLE_LIMIT_REACHED
        | EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE
    >;
    clearLfgChannel: TAdminResultOfKind<EAdminResultKind.LFG_CHANNEL_CLEARED>;
    clearLfgRolePingCooldown: TAdminResultOfKind<EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED>;
    getGuildConfig: TAdminResultOfKind<EAdminResultKind.LFG_GET_CONFIG>;
    getLfgRoleConfig: TAdminResultOfKind<EAdminResultKind.LFG_GET_ROLE_CONFIG>;
    removeLfgRole: TAdminResultOfKind<EAdminResultKind.LFG_ROLE_REMOVED | EAdminResultKind.LFG_ROLE_NOT_FOUND>;
    setLfgChannel: TAdminResultOfKind<EAdminResultKind.LFG_CHANNEL_SET>;
    setLfgRoleLastPingedAt: void;
    setLfgRolePingCooldown: TAdminResultOfKind<EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET>;
};
