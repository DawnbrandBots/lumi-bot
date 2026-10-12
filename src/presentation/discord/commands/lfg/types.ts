import type { Paths, PickDeep } from "type-fest";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TCommandArgs, TGuildCommandInteraction } from "../types.ts";
import type { TLfgPresentationResult } from "../types/lfg.types.ts";

export type TLfgCommandArgs = TCommandArgs;

export type TLfgCommandBase<ArgPaths extends Paths<TLfgCommandArgs>, Return = MaybePromise<TLfgPresentationResult>> = (
    arg: PickDeep<TLfgCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => Return;

export type TLfgFeatureCommand = (
    arg: TLfgCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgPresentationResult>;
