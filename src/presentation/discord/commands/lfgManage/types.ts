import type { Paths, PickDeep } from "type-fest";
import type { TAdminUseCases } from "../../../../application/admin/types.ts";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import type { TLfgUseCases } from "../../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import type { TGuildCommandInteraction } from "../types.ts";

export type TLfgManageCommandArgs = {
    readonly useCases: {
        readonly admin: Pick<TAdminUseCases, "getGuildConfig">;
        readonly lfg: Pick<
            TLfgUseCases,
            | "changeRoomCode"
            | "createRoom"
            | "disbandRoom"
            | "kickPlayerFromRoom"
            | "movePlayerToRoom"
            | "transferRoomToPlayer"
        >;
    };
};

export type TLfgManageCommandBase<ArgPaths extends Paths<TLfgManageCommandArgs>> = (
    arg: PickDeep<TLfgManageCommandArgs, ArgPaths>,
    interaction: TGuildCommandInteraction,
) => MaybePromise<TLfgResult>;
