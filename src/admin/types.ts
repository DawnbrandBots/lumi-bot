import type { GuildConfig } from "./models/config.ts";

export const enum EAdminFeatureReturnKind {
    LFG_CHANNEL_HELP = "LFG_CHANNEL_HELP",
    LFG_CHANNEL_SET = "LFG_CHANNEL_SET",
    LFG_CHANNEL_CLEARED = "LFG_CHANNEL_CLEARED",
    LFG_CHANNEL_MISSING_CHANNEL = "LFG_CHANNEL_MISSING_CHANNEL",
    LFG_CHANNEL_INVALID_OPTIONS = "LFG_CHANNEL_INVALID_OPTIONS",
    LFG_GET_CONFIG = "LFG_GET_CONFIG",
}

type TAdminFeatureReturnValueByKind = {
    [EAdminFeatureReturnKind.LFG_CHANNEL_HELP]: { readonly channel: string | null | undefined };
    [EAdminFeatureReturnKind.LFG_CHANNEL_SET]: { readonly channel: string };
    // TODO: add IGuildConfig
    [EAdminFeatureReturnKind.LFG_GET_CONFIG]: GuildConfig | null;
} & {
    [
        _ in
            | EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED
            | EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL
            | EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS
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
    getGuildConfig: TAdminFeatureReturnOfKind<EAdminFeatureReturnKind.LFG_GET_CONFIG>;
};
