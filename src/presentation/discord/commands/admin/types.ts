import type { InteractionReplyOptions } from "discord.js";
import type { Paths, PickDeep } from "type-fest";
import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TGuildCommandInteraction } from "../types.ts";

export type TAdminCommandArgs = {
    readonly useCases: Pick<
        TAdminUseCases,
        | "addLfgRole"
        | "clearLfgChannel"
        | "clearLfgRolePingCooldown"
        | "getGuildConfig"
        | "removeLfgRole"
        | "setLfgChannel"
        | "setLfgRolePingCooldown"
    >;
};

export type TAdminCommandBase<ArgPaths extends Paths<TAdminCommandArgs>> = (
    arg: PickDeep<TAdminCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => Promise<InteractionReplyOptions>;
