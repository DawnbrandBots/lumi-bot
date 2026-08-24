import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function getGuildConfig(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string },
): Promise<TAdminResultTypes["getGuildConfig"]> {
    const config = await dependencies.persistence.getGuildConfig(arg);
    return {
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: config,
    };
}
