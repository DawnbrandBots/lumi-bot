import type { MaybePromise } from "../../utils/types.ts";
import type { TLfgRoom } from "./types.ts";

export type TLfgRepository = {
    readonly changeRoomCode: (arg: { readonly roomId: string; readonly newCode: string }) => MaybePromise<{
        readonly oldCode: string;
        readonly newCode: string;
    }>;
    readonly createRoom: (arg: {
        readonly guildId: string;
        readonly ownerId: string;
        readonly code: string;
    }) => MaybePromise<TLfgRoom>;
    readonly findRoomByCode: (arg: {
        readonly guildId: string;
        readonly code: string;
    }) => MaybePromise<TLfgRoom | null>;
    readonly findRoomByUser: (arg: {
        readonly guildId: string;
        readonly userId: string;
    }) => MaybePromise<TLfgRoom | null>;
    readonly listRooms: (arg: { readonly guildId: string }) => MaybePromise<readonly TLfgRoom[]>;
    readonly removeRoom: (arg: { readonly roomId: string }) => MaybePromise<void>;
    readonly removeRoomPlayer: (arg: { readonly roomId: string; readonly userId: string }) => MaybePromise<void>;
    readonly moveUserToRoom: (arg: { readonly roomId: string; readonly userId: string }) => MaybePromise<TLfgRoom>;
    readonly setRoomOwner: (arg: { readonly roomId: string; readonly ownerId: string }) => MaybePromise<TLfgRoom>;
};
