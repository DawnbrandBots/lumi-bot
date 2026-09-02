import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const getGuildConfig: TAdminUseCaseBase<"getGuildConfig", "repositories.admin.getGuildConfig"> = async function (
    dependencies,
    arg,
) {
    const config = await dependencies.repositories.admin.getGuildConfig(arg);
    return {
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: config,
    };
};
