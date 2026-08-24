import type { InteractionReplyOptions } from "discord.js";
import type { Paths, PickDeep } from "type-fest";
import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgResult, TLfgUseCases } from "../../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TGuildCommandInteraction } from "../types.ts";

export type TLfgCommandArgs = {
    readonly useCases: {
        // TODO: indicator that something is wrong architecture-wise here
        readonly admin: Pick<TAdminUseCases, "getGuildConfig" | "getLfgRoleConfig" | "setLfgRoleLastPingedAt">;
        readonly lfg: Pick<
            TLfgUseCases,
            | "changeOwnedRoomCode"
            | "createRoom"
            | "disbandOwnedRoom"
            | "getLfgStatus"
            | "kickPlayerFromOwnedRoom"
            | "leaveRoom"
            | "movePlayerToRoom"
            | "transferOwnedRoomToPlayer"
        >;
    };
};

export type TLfgCommandBase<ArgPaths extends Paths<TLfgCommandArgs>, Return = MaybePromise<TLfgResult>> = (
    arg: PickDeep<TLfgCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => Return;

export type TLfgReplyCommandBase<ArgPaths extends Paths<TLfgCommandArgs>> = TLfgCommandBase<
    ArgPaths,
    MaybePromise<InteractionReplyOptions>
>;

export type TLfgVoidCommandBase<ArgPaths extends Paths<TLfgCommandArgs>> = TLfgCommandBase<
    ArgPaths,
    MaybePromise<void>
>;
