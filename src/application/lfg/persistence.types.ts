import type { MaybePromise } from "../../utils/types.ts";
import type { TLfgRoom } from "./types.ts";

export type TFindLfgRoomByCode = (arg: {
    readonly guildId: string;
    readonly code: string;
}) => MaybePromise<TLfgRoom | null>;
export type TFindLfgRoomByUser = (arg: {
    readonly guildId: string;
    readonly userId: string;
}) => MaybePromise<TLfgRoom | null>;
export type TListLfgRooms = (arg: { readonly guildId: string }) => MaybePromise<readonly TLfgRoom[]>;

export type TCreateLfgRoom = (arg: {
    readonly guildId: string;
    readonly ownerId: string;
    readonly code: string;
}) => MaybePromise<TLfgRoom>;

export type TMoveUserToLfgRoom = (arg: { readonly roomId: string; readonly userId: string }) => MaybePromise<TLfgRoom>;

export type TSetLfgRoomOwner = (arg: { readonly roomId: string; readonly ownerId: string }) => MaybePromise<TLfgRoom>;

export type TRemoveLfgRoomPlayer = (arg: { readonly roomId: string; readonly userId: string }) => MaybePromise<void>;

export type TRemoveLfgRoom = (arg: { readonly roomId: string }) => MaybePromise<void>;

export type TChangeLfgRoomCode = (arg: { readonly roomId: string; readonly newCode: string }) => MaybePromise<{
    readonly oldCode: string;
    readonly newCode: string;
}>;

export type TLfgPersistence = {
    readonly changeRoomCode: TChangeLfgRoomCode;
    readonly createRoom: TCreateLfgRoom;
    readonly findRoomByCode: TFindLfgRoomByCode;
    readonly findRoomByUser: TFindLfgRoomByUser;
    readonly listRooms: TListLfgRooms;
    readonly removeRoom: TRemoveLfgRoom;
    readonly removeRoomPlayer: TRemoveLfgRoomPlayer;
    readonly moveUserToRoom: TMoveUserToLfgRoom;
    readonly setRoomOwner: TSetLfgRoomOwner;
};
