import type { GuildConfig } from "./models/config.ts";

export const enum EAdminFeatureReturnKind {
    LFG_CHANNEL_HELP = "LFG_CHANNEL_HELP",
    LFG_CHANNEL_SET = "LFG_CHANNEL_SET",
    LFG_CHANNEL_CLEARED = "LFG_CHANNEL_CLEARED",
    LFG_CHANNEL_MISSING_CHANNEL = "LFG_CHANNEL_MISSING_CHANNEL",
    LFG_CHANNEL_INVALID_OPTIONS = "LFG_CHANNEL_INVALID_OPTIONS",
    LFG_ROLE_HELP = "LFG_ROLE_HELP",
    LFG_ROLE_SET = "LFG_ROLE_SET",
    LFG_ROLE_CLEARED = "LFG_ROLE_CLEARED",
    LFG_ROLE_MISSING_ROLE = "LFG_ROLE_MISSING_ROLE",
    LFG_ROLE_INVALID_OPTIONS = "LFG_ROLE_INVALID_OPTIONS",
    LFG_GET_CONFIG = "LFG_GET_CONFIG",
}

type TAdminFeatureReturnValueByKind = {
    [EAdminFeatureReturnKind.LFG_CHANNEL_HELP]: { readonly channel: string | null | undefined };
    [EAdminFeatureReturnKind.LFG_CHANNEL_SET]: { readonly channel: string };
    [EAdminFeatureReturnKind.LFG_ROLE_HELP]: { readonly role: string | null | undefined };
    [EAdminFeatureReturnKind.LFG_ROLE_SET]: { readonly role: string };
    // TODO: add IGuildConfig
    [EAdminFeatureReturnKind.LFG_GET_CONFIG]: GuildConfig | null;
} & {
    [_ in
        | EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED
        | EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL
        | EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS
        | EAdminFeatureReturnKind.LFG_ROLE_CLEARED
        | EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE
        | EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS]: never;
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
    lfgRole: TAdminFeatureReturnOfKind<
        | EAdminFeatureReturnKind.LFG_ROLE_HELP
        | EAdminFeatureReturnKind.LFG_ROLE_SET
        | EAdminFeatureReturnKind.LFG_ROLE_CLEARED
        | EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE
        | EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS
    >;
    getGuildConfig: TAdminFeatureReturnOfKind<EAdminFeatureReturnKind.LFG_GET_CONFIG>;
};
