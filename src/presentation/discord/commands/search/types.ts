import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import type { Paths, PickDeep } from "type-fest";
import type { TSearchUseCases } from "../../../../application/search/useCases.types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";

export type TSearchCommandArgs = {
    readonly useCases: Pick<TSearchUseCases, "resolveSearchInput">;
};

export type TSearchCommandBase<ArgPaths extends Paths<TSearchCommandArgs>> = (
    arg: PickDeep<TSearchCommandArgs, ArgPaths>,
    interaction: ChatInputCommandInteraction<CacheType>,
) => MaybePromise<void>;
