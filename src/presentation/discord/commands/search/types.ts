import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { Paths, PickDeep } from "type-fest";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TCommandArgs } from "../types.ts";

export type TSearchCommandArgs = TCommandArgs;

export type TSearchCommandBase<ArgPaths extends Paths<TSearchCommandArgs>> = (
    arg: PickDeep<TSearchCommandArgs, ArgPaths>,
    interaction: ChatInputCommandInteraction<CacheType>,
) => MaybePromise<void>;
