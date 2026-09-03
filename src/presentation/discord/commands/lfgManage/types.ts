import type { Paths, PickDeep } from "type-fest";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TCommandArgs, TGuildCommandInteraction } from "../types.ts";

export type TLfgManageCommandArgs = TCommandArgs;

export type TLfgManageCommandBase<ArgPaths extends Paths<TLfgManageCommandArgs>> = (
    arg: PickDeep<TLfgManageCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgResult>;

export type TLfgManageFeatureCommand = (
    arg: TLfgManageCommandArgs,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgResult>;
