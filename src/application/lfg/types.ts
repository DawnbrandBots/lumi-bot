import type { MaybePromise } from "../../utils/types.ts";
import type { IRoom } from "../../domain/lfg/models/room.types.ts";
import type { IUser } from "../../domain/lfg/models/user.types.ts";
import type { TLfgPlayerRemovalResult } from "../../domain/lfg/models/playerRemoval.types.ts";

export const enum ELfgResultKind {
    ROOMS_LISTED = "ROOMS_LISTED",
    ROOM_CREATED = "ROOM_CREATED",
    ROOM_CODE_CHANGED = "ROOM_CODE_CHANGED",
    INVALID_ROOM_CODE = "INVALID_ROOM_CODE",
    ALREADY_IN_A_ROOM = "ALREADY_IN_A_ROOM",
    ROOM_ALREADY_EXISTS = "ROOM_ALREADY_EXISTS",
    ROOM_JOINED = "ROOM_JOINED",
    ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
    ALREADY_IN_TARGET_ROOM = "ALREADY_IN_TARGET_ROOM",
    ROOM_IS_FULL = "ROOM_IS_FULL",
    OWNERSHIP_TRANSFERRED = "OWNERSHIP_TRANSFERRED",
    CANNOT_TRANSFER_TO_YOURSELF = "CANNOT_TRANSFER_TO_YOURSELF",
    PLAYER_NOT_IN_ROOM = "PLAYER_NOT_IN_ROOM",
    NOT_ROOM_OWNER = "NOT_ROOM_OWNER",
    PLAYER_KICKED = "PLAYER_KICKED",
    CANNOT_KICK_YOURSELF = "CANNOT_KICK_YOURSELF",
    ROOM_LEFT = "ROOM_LEFT",
    NOT_IN_A_ROOM = "NOT_IN_A_ROOM",
    ROOM_DISBANDED = "ROOM_DISBANDED",
}

type TLfgResultValueByKind = {
    [ELfgResultKind.ROOMS_LISTED]: { readonly rooms: readonly IRoom[] };
    [ELfgResultKind.ROOM_CREATED]: { readonly userId: string; readonly room: IRoom };
    [ELfgResultKind.ROOM_CODE_CHANGED]: { readonly oldCode: string; readonly newCode: string };
    [ELfgResultKind.ALREADY_IN_A_ROOM]: { readonly userId: string };
    [ELfgResultKind.ROOM_ALREADY_EXISTS]: { readonly code: string };
    [ELfgResultKind.ROOM_JOINED]: {
        readonly userId: string;
        readonly room: IRoom;
        readonly leftRoomCode?: string;
        readonly removalResult?: TLfgPlayerRemovalResult;
    };
    [ELfgResultKind.ROOM_NOT_FOUND]: { readonly code: string };
    [ELfgResultKind.ALREADY_IN_TARGET_ROOM]: { readonly userId: string; readonly room: IRoom };
    [ELfgResultKind.ROOM_IS_FULL]: { readonly code: string };
    [ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF]: { readonly userId: string; readonly code: string };
    [ELfgResultKind.OWNERSHIP_TRANSFERRED]: {
        readonly userId: string;
        readonly targetId: string;
        readonly room: IRoom;
    };
    [ELfgResultKind.PLAYER_NOT_IN_ROOM]: {
        readonly ownerId: string;
        readonly targetId: string;
        readonly code: string;
    };
    [ELfgResultKind.PLAYER_KICKED]: {
        readonly userId: string;
        readonly targetId: string;
        readonly room: IRoom;
        readonly removalResult: TLfgPlayerRemovalResult;
    };
    [ELfgResultKind.ROOM_LEFT]: { readonly userId: string; readonly code: string } & TLfgPlayerRemovalResult;
    [ELfgResultKind.ROOM_DISBANDED]: { readonly userId: string; readonly code: string };
} & {
    [
        _ in
            | ELfgResultKind.INVALID_ROOM_CODE
            | ELfgResultKind.NOT_ROOM_OWNER
            | ELfgResultKind.CANNOT_KICK_YOURSELF
            | ELfgResultKind.NOT_IN_A_ROOM
    ]: never;
};

export type TLfgResultOfKind<Kind extends ELfgResultKind> =
    // https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
    Kind extends ELfgResultKind
        ? TLfgResultValueByKind[Kind] extends never
            ? { readonly kind: Kind }
            : { readonly kind: Kind; readonly value: TLfgResultValueByKind[Kind] }
        : never;

export type TLfgResult = {
    [Kind in ELfgResultKind]: TLfgResultOfKind<Kind>;
}[ELfgResultKind];

export type TLfgResultTypes = {
    status: TLfgResultOfKind<ELfgResultKind.ROOMS_LISTED>;
    create: TLfgResultOfKind<
        | ELfgResultKind.ROOM_CREATED
        | ELfgResultKind.INVALID_ROOM_CODE
        | ELfgResultKind.ALREADY_IN_A_ROOM
        | ELfgResultKind.ROOM_ALREADY_EXISTS
    >;
    changeOwnedRoomCode: TLfgResultOfKind<
        | ELfgResultKind.ROOM_CODE_CHANGED
        | ELfgResultKind.INVALID_ROOM_CODE
        | ELfgResultKind.ROOM_ALREADY_EXISTS
        | ELfgResultKind.NOT_ROOM_OWNER
        | ELfgResultKind.NOT_IN_A_ROOM
    >;
    changeRoomCode: TLfgResultOfKind<
        | ELfgResultKind.ROOM_CODE_CHANGED
        | ELfgResultKind.INVALID_ROOM_CODE
        | ELfgResultKind.ROOM_ALREADY_EXISTS
        | ELfgResultKind.ROOM_NOT_FOUND
    >;
    move: TLfgResultOfKind<
        | ELfgResultKind.ROOM_JOINED
        | ELfgResultKind.ROOM_NOT_FOUND
        | ELfgResultKind.ALREADY_IN_TARGET_ROOM
        | ELfgResultKind.ROOM_IS_FULL
    >;
    transfer: TLfgResultOfKind<
        | ELfgResultKind.OWNERSHIP_TRANSFERRED
        | ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
        | ELfgResultKind.ROOM_NOT_FOUND
    >;
    transferOwnedRoom: TLfgResultOfKind<
        | ELfgResultKind.OWNERSHIP_TRANSFERRED
        | ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
        | ELfgResultKind.NOT_ROOM_OWNER
        | ELfgResultKind.NOT_IN_A_ROOM
    >;
    kick: TLfgResultOfKind<
        ELfgResultKind.PLAYER_KICKED | ELfgResultKind.PLAYER_NOT_IN_ROOM | ELfgResultKind.ROOM_NOT_FOUND
    >;
    kickFromOwnedRoom: TLfgResultOfKind<
        | ELfgResultKind.PLAYER_KICKED
        | ELfgResultKind.CANNOT_KICK_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
        | ELfgResultKind.NOT_ROOM_OWNER
        | ELfgResultKind.NOT_IN_A_ROOM
    >;
    leave: TLfgResultOfKind<ELfgResultKind.ROOM_LEFT | ELfgResultKind.NOT_IN_A_ROOM>;
    disband: TLfgResultOfKind<ELfgResultKind.ROOM_DISBANDED | ELfgResultKind.ROOM_NOT_FOUND>;
    disbandOwnedRoom: TLfgResultOfKind<
        ELfgResultKind.ROOM_DISBANDED | ELfgResultKind.NOT_ROOM_OWNER | ELfgResultKind.NOT_IN_A_ROOM
    >;
};

export type TGetLfgStatusArg = { readonly guildId: string };
export type TCreateLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly code: string;
};
export type TChangeOwnedLfgRoomCodeArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly newCode: string;
};
export type TChangeLfgRoomCodeArg = {
    readonly guildId: string;
    readonly code: string;
    readonly newCode: string;
};
export type TMoveLfgUserArg = {
    readonly guildId: string;
    readonly user: IUser;
    readonly code: string;
};
export type TTransferLfgRoomArg = {
    readonly guildId: string;
    readonly code: string;
    readonly target: IUser;
};
export type TTransferOwnedLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly target: IUser;
};
export type TKickFromLfgRoomByCodeArg = {
    readonly guildId: string;
    readonly code: string;
    readonly target: IUser;
};
export type TKickFromOwnedLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly target: IUser;
};
export type TLeaveLfgRoomArg = { readonly guildId: string; readonly user: IUser };
export type TDisbandLfgRoomArg = { readonly guildId: string; readonly code: string };
export type TDisbandOwnedLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
};

export type TGetLfgStatus = (arg: TGetLfgStatusArg) => MaybePromise<TLfgResultTypes["status"]>;
export type TCreateLfgRoomUseCase = (arg: TCreateLfgRoomArg) => MaybePromise<TLfgResultTypes["create"]>;
export type TChangeOwnedLfgRoomCodeUseCase = (
    arg: TChangeOwnedLfgRoomCodeArg,
) => MaybePromise<TLfgResultTypes["changeOwnedRoomCode"]>;
export type TChangeLfgRoomCodeUseCase = (arg: TChangeLfgRoomCodeArg) => MaybePromise<TLfgResultTypes["changeRoomCode"]>;
export type TMoveLfgUser = (arg: TMoveLfgUserArg) => MaybePromise<TLfgResultTypes["move"]>;
export type TTransferLfgRoomUseCase = (arg: TTransferLfgRoomArg) => MaybePromise<TLfgResultTypes["transfer"]>;
export type TTransferOwnedLfgRoomUseCase = (
    arg: TTransferOwnedLfgRoomArg,
) => MaybePromise<TLfgResultTypes["transferOwnedRoom"]>;
export type TKickFromLfgRoomByCode = (arg: TKickFromLfgRoomByCodeArg) => MaybePromise<TLfgResultTypes["kick"]>;
export type TKickFromOwnedLfgRoomUseCase = (
    arg: TKickFromOwnedLfgRoomArg,
) => MaybePromise<TLfgResultTypes["kickFromOwnedRoom"]>;
export type TLeaveLfgRoom = (arg: TLeaveLfgRoomArg) => MaybePromise<TLfgResultTypes["leave"]>;
export type TDisbandLfgRoomUseCase = (arg: TDisbandLfgRoomArg) => MaybePromise<TLfgResultTypes["disband"]>;
export type TDisbandOwnedLfgRoomUseCase = (
    arg: TDisbandOwnedLfgRoomArg,
) => MaybePromise<TLfgResultTypes["disbandOwnedRoom"]>;

export type TLfgRoom = IRoom & {
    readonly id: string;
};

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

type TOwnedRoomFailure = TLfgResultOfKind<ELfgResultKind.NOT_IN_A_ROOM | ELfgResultKind.NOT_ROOM_OWNER>;

export type TGetOwnedLfgRoomResult =
    | {
          readonly success: true;
          readonly value: { readonly room: TLfgRoom };
      }
    | {
          readonly success: false;
          readonly value: TOwnedRoomFailure;
      };

export type TGetOwnedLfgRoom = (arg: {
    readonly guildId: string;
    readonly owner: IUser;
}) => MaybePromise<TGetOwnedLfgRoomResult>;

export type TChangeLfgRoomCodeInRoom = (arg: {
    readonly guildId: string;
    readonly room: TLfgRoom;
    readonly newCode: string;
}) => MaybePromise<
    TLfgResultOfKind<
        ELfgResultKind.ROOM_CODE_CHANGED | ELfgResultKind.INVALID_ROOM_CODE | ELfgResultKind.ROOM_ALREADY_EXISTS
    >
>;

export type TKickFromLfgRoom = (arg: {
    readonly guildId: string;
    readonly room: TLfgRoom;
    readonly target: IUser;
}) => MaybePromise<TLfgResultOfKind<ELfgResultKind.PLAYER_KICKED | ELfgResultKind.PLAYER_NOT_IN_ROOM>>;

export type TRemovePlayerFromLfgRoom = (arg: {
    readonly room: TLfgRoom;
    readonly userId: string;
}) => MaybePromise<TLfgPlayerRemovalResult>;

export type TTransferLfgRoom = (arg: {
    readonly guildId: string;
    readonly room: TLfgRoom;
    readonly target: IUser;
}) => MaybePromise<
    TLfgResultOfKind<
        | ELfgResultKind.OWNERSHIP_TRANSFERRED
        | ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
    >
>;

export type TLfgApplicationDependencies = TLfgPersistence & {
    readonly changeRoomCodeInRoom: TChangeLfgRoomCodeInRoom;
    readonly getOwnedRoom: TGetOwnedLfgRoom;
    readonly kickFromRoom: TKickFromLfgRoom;
    readonly removePlayerFromRoom: TRemovePlayerFromLfgRoom;
    readonly transferRoom: TTransferLfgRoom;
};

export type TLfgUseCase<Arg, Return> = (dependencies: TLfgApplicationDependencies, arg: Arg) => MaybePromise<Return>;
