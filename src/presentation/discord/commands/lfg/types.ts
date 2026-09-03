import type { Paths, PickDeep } from "type-fest";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TCommandArgs, TGuildCommandInteraction } from "../types.ts";

export type TLfgCommandArgs = TCommandArgs;

export type TLfgCommandBase<ArgPaths extends Paths<TLfgCommandArgs>, Return = MaybePromise<TLfgResult>> = (
    arg: PickDeep<TLfgCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => Return;

export type TLfgFeatureCommand = (
    arg: TLfgCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgResult>;
