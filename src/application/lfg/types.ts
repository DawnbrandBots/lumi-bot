import type { MaybePromise } from "../../utils/types.ts";
import type { ILfgFeature, IRoom, TLfgPlayerRemovalResult } from "../../lfg/types.ts";

export type TLfgRoom = IRoom & {
    readonly id: string;
};

export type TFindLfgRoomByCode = (arg: { readonly guildId: string; readonly code: string }) => MaybePromise<TLfgRoom | null>;
export type TFindLfgRoomByUser = (arg: { readonly guildId: string; readonly userId: string }) => MaybePromise<TLfgRoom | null>;
export type TListLfgRooms = (arg: { readonly guildId: string }) => MaybePromise<readonly TLfgRoom[]>;

export type TCreateLfgRoom = (arg: {
    readonly guildId: string;
    readonly ownerId: string;
    readonly code: string;
}) => MaybePromise<TLfgRoom>;

export type TMoveUserToLfgRoom = (arg: {
    readonly guildId: string;
    readonly userId: string;
    readonly roomId: string;
}) => MaybePromise<{
    readonly room: TLfgRoom;
    readonly leftRoomCode?: string;
    readonly removalResult?: TLfgPlayerRemovalResult;
}>;

export type TTransferLfgRoom = (arg: {
    readonly roomId: string;
    readonly targetId: string;
}) => MaybePromise<TLfgRoom>;

export type TKickUserFromLfgRoom = (arg: {
    readonly roomId: string;
    readonly targetId: string;
}) => MaybePromise<{
    readonly room: TLfgRoom;
    readonly removalResult: TLfgPlayerRemovalResult;
}>;

export type TLeaveLfgRoom = (arg: {
    readonly guildId: string;
    readonly userId: string;
}) => MaybePromise<{
    readonly code: string;
} & TLfgPlayerRemovalResult>;

export type TDisbandLfgRoom = (arg: { readonly roomId: string }) => MaybePromise<{
    readonly userId: string;
    readonly code: string;
}>;

export type TChangeLfgRoomCode = (arg: {
    readonly roomId: string;
    readonly newCode: string;
}) => MaybePromise<{
    readonly oldCode: string;
    readonly newCode: string;
}>;

export type TLfgPersistence = {
    readonly changeRoomCode: TChangeLfgRoomCode;
    readonly createRoom: TCreateLfgRoom;
    readonly disbandRoom: TDisbandLfgRoom;
    readonly findRoomByCode: TFindLfgRoomByCode;
    readonly findRoomByUser: TFindLfgRoomByUser;
    readonly kickUserFromRoom: TKickUserFromLfgRoom;
    readonly leaveRoom: TLeaveLfgRoom;
    readonly listRooms: TListLfgRooms;
    readonly moveUserToRoom: TMoveUserToLfgRoom;
    readonly transferRoom: TTransferLfgRoom;
};

export type TLfgFeature = ILfgFeature;
