import type { InteractionReplyOptions } from "discord.js";
import type { Paths, PickDeep } from "type-fest";
import type { TCommandArgs, TGuildCommandInteraction } from "../types.ts";

export type TAdminCommandArgs = TCommandArgs;

export type TAdminCommandBase<ArgPaths extends Paths<TAdminCommandArgs>> = (
    arg: PickDeep<TAdminCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => Promise<InteractionReplyOptions>;

export type TAdminCommand = (
    arg: TAdminCommandArgs,
    interaction: TGuildCommandInteraction,
) => Promise<InteractionReplyOptions>;
