import type { IRoom } from "../../domain/lfg/models/room.types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type TLfgRepository = {
    readonly changeRoomCode: (arg: { readonly roomId: string; readonly newCode: string }) => MaybePromise<{
        readonly oldCode: string;
        readonly newCode: string;
    }>;
    readonly createRoom: (arg: {
        readonly guildId: string;
        readonly ownerId: string;
        readonly code: string;
    }) => MaybePromise<IRoom>;
    readonly findRoomByCode: (arg: { readonly guildId: string; readonly code: string }) => MaybePromise<IRoom | null>;
    // TODO: validity of requiring guildId on top of roomid?
    // "findRoomByIdInSameGuild?"
    readonly findRoomById: (arg: { readonly guildId: string; readonly roomId: string }) => MaybePromise<IRoom | null>;
    readonly findRoomByUser: (arg: { readonly guildId: string; readonly userId: string }) => MaybePromise<IRoom | null>;
    readonly listRooms: (arg: { readonly guildId: string }) => MaybePromise<readonly IRoom[]>;
    readonly removeRoom: (arg: { readonly roomId: string }) => MaybePromise<void>;
    readonly removeRoomPlayer: (arg: { readonly roomId: string; readonly userId: string }) => MaybePromise<void>;
    readonly moveUserToRoom: (arg: { readonly roomId: string; readonly userId: string }) => MaybePromise<IRoom>;
    readonly setRoomOwner: (arg: { readonly roomId: string; readonly ownerId: string }) => MaybePromise<IRoom>;
};
