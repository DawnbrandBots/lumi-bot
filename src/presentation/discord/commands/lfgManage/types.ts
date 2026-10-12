import type { Paths, PickDeep } from "type-fest";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TCommandArgs, TGuildCommandInteraction } from "../types.ts";
import type { TLfgPresentationResult } from "../types/lfg.types.ts";

export type TLfgManageCommandArgs = TCommandArgs;

export type TLfgManageCommandBase<ArgPaths extends Paths<TLfgManageCommandArgs>> = (
    arg: PickDeep<TLfgManageCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgPresentationResult>;

export type TLfgManageFeatureCommand = (
    arg: TLfgManageCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgPresentationResult>;
