import type { MaybePromise } from "../../utils/types.ts";
import type { IRoom } from "../../domain/lfg/models/room.types.ts";
import type { IUser } from "../../domain/lfg/models/user.types.ts";
import type { TLfgPlayerRemovalResult } from "../../domain/lfg/models/playerRemoval.types.ts";

export const enum ELfgFeatureReturnKind {
    ROOMS_LISTED = "ROOMS_LISTED",
    HELP = "HELP",
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
    INVALID_SUBCOMMAND = "INVALID_SUBCOMMAND",
}

type TLfgFeatureReturnValueByKind = {
    [ELfgFeatureReturnKind.ROOMS_LISTED]: { readonly rooms: readonly IRoom[] };
    [ELfgFeatureReturnKind.ROOM_CREATED]: { readonly userId: string; readonly room: IRoom };
    [ELfgFeatureReturnKind.ROOM_CODE_CHANGED]: { readonly oldCode: string; readonly newCode: string };
    [ELfgFeatureReturnKind.ALREADY_IN_A_ROOM]: { readonly userId: string };
    [ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS]: { readonly code: string };
    [ELfgFeatureReturnKind.ROOM_JOINED]: {
        readonly userId: string;
        readonly room: IRoom;
        readonly leftRoomCode?: string;
        readonly removalResult?: TLfgPlayerRemovalResult;
    };
    [ELfgFeatureReturnKind.ROOM_NOT_FOUND]: { readonly code: string };
    [ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM]: { readonly userId: string; readonly room: IRoom };
    [ELfgFeatureReturnKind.ROOM_IS_FULL]: { readonly code: string };
    [ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF]: { readonly userId: string; readonly code: string };
    [ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED]: {
        readonly userId: string;
        readonly targetId: string;
        readonly room: IRoom;
    };
    [ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM]: {
        readonly ownerId: string;
        readonly targetId: string;
        readonly code: string;
    };
    [ELfgFeatureReturnKind.PLAYER_KICKED]: {
        readonly userId: string;
        readonly targetId: string;
        readonly room: IRoom;
        readonly removalResult: TLfgPlayerRemovalResult;
    };
    [ELfgFeatureReturnKind.ROOM_LEFT]: { readonly userId: string; readonly code: string } & TLfgPlayerRemovalResult;
    [ELfgFeatureReturnKind.ROOM_DISBANDED]: { readonly userId: string; readonly code: string };
} & {
    [
        _ in
            | ELfgFeatureReturnKind.HELP
            | ELfgFeatureReturnKind.INVALID_ROOM_CODE
            | ELfgFeatureReturnKind.NOT_ROOM_OWNER
            | ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF
            | ELfgFeatureReturnKind.NOT_IN_A_ROOM
            | ELfgFeatureReturnKind.INVALID_SUBCOMMAND
    ]: never;
};

export type TLfgFeatureReturnOfKind<Kind extends ELfgFeatureReturnKind> =
    // https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
    Kind extends ELfgFeatureReturnKind
        ? TLfgFeatureReturnValueByKind[Kind] extends never
            ? { readonly kind: Kind }
            : { readonly kind: Kind; readonly value: TLfgFeatureReturnValueByKind[Kind] }
        : never;

export type TLfgFeatureReturn = {
    [Kind in ELfgFeatureReturnKind]: TLfgFeatureReturnOfKind<Kind>;
}[ELfgFeatureReturnKind];

export type TLfgFeatureReturnTypes = {
    status: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.ROOMS_LISTED>;
    help: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.HELP>;
    create: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_CREATED
        | ELfgFeatureReturnKind.INVALID_ROOM_CODE
        | ELfgFeatureReturnKind.ALREADY_IN_A_ROOM
        | ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS
    >;
    changeOwnedRoomCode: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_CODE_CHANGED
        | ELfgFeatureReturnKind.INVALID_ROOM_CODE
        | ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
    changeRoomCode: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_CODE_CHANGED
        | ELfgFeatureReturnKind.INVALID_ROOM_CODE
        | ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS
        | ELfgFeatureReturnKind.ROOM_NOT_FOUND
    >;
    move: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_JOINED
        | ELfgFeatureReturnKind.ROOM_NOT_FOUND
        | ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM
        | ELfgFeatureReturnKind.ROOM_IS_FULL
    >;
    transfer: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED
        | ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
        | ELfgFeatureReturnKind.ROOM_NOT_FOUND
    >;
    transferOwnedRoom: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED
        | ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
    kick: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.PLAYER_KICKED
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
        | ELfgFeatureReturnKind.ROOM_NOT_FOUND
    >;
    kickFromOwnedRoom: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.PLAYER_KICKED
        | ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
    leave: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.ROOM_LEFT | ELfgFeatureReturnKind.NOT_IN_A_ROOM>;
    disband: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.ROOM_DISBANDED | ELfgFeatureReturnKind.ROOM_NOT_FOUND>;
    disbandOwnedRoom: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_DISBANDED
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
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

export type TGetLfgStatus = (arg: TGetLfgStatusArg) => MaybePromise<TLfgFeatureReturnTypes["status"]>;
export type TCreateLfgRoomUseCase = (arg: TCreateLfgRoomArg) => MaybePromise<TLfgFeatureReturnTypes["create"]>;
export type TChangeOwnedLfgRoomCodeUseCase = (
    arg: TChangeOwnedLfgRoomCodeArg,
) => MaybePromise<TLfgFeatureReturnTypes["changeOwnedRoomCode"]>;
export type TChangeLfgRoomCodeUseCase = (
    arg: TChangeLfgRoomCodeArg,
) => MaybePromise<TLfgFeatureReturnTypes["changeRoomCode"]>;
export type TMoveLfgUser = (arg: TMoveLfgUserArg) => MaybePromise<TLfgFeatureReturnTypes["move"]>;
export type TTransferLfgRoomUseCase = (arg: TTransferLfgRoomArg) => MaybePromise<TLfgFeatureReturnTypes["transfer"]>;
export type TTransferOwnedLfgRoomUseCase = (
    arg: TTransferOwnedLfgRoomArg,
) => MaybePromise<TLfgFeatureReturnTypes["transferOwnedRoom"]>;
export type TKickFromLfgRoomByCode = (arg: TKickFromLfgRoomByCodeArg) => MaybePromise<TLfgFeatureReturnTypes["kick"]>;
export type TKickFromOwnedLfgRoomUseCase = (
    arg: TKickFromOwnedLfgRoomArg,
) => MaybePromise<TLfgFeatureReturnTypes["kickFromOwnedRoom"]>;
export type TLeaveLfgRoom = (arg: TLeaveLfgRoomArg) => MaybePromise<TLfgFeatureReturnTypes["leave"]>;
export type TDisbandLfgRoomUseCase = (arg: TDisbandLfgRoomArg) => MaybePromise<TLfgFeatureReturnTypes["disband"]>;
export type TDisbandOwnedLfgRoomUseCase = (
    arg: TDisbandOwnedLfgRoomArg,
) => MaybePromise<TLfgFeatureReturnTypes["disbandOwnedRoom"]>;

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

type TOwnedRoomFailure = TLfgFeatureReturnOfKind<
    ELfgFeatureReturnKind.NOT_IN_A_ROOM | ELfgFeatureReturnKind.NOT_ROOM_OWNER
>;

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
    TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_CODE_CHANGED
        | ELfgFeatureReturnKind.INVALID_ROOM_CODE
        | ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS
    >
>;

export type TKickFromLfgRoom = (arg: {
    readonly guildId: string;
    readonly room: TLfgRoom;
    readonly target: IUser;
}) => MaybePromise<
    TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.PLAYER_KICKED | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM>
>;

export type TRemovePlayerFromLfgRoom = (arg: {
    readonly room: TLfgRoom;
    readonly userId: string;
}) => MaybePromise<TLfgPlayerRemovalResult>;

export type TTransferLfgRoom = (arg: {
    readonly guildId: string;
    readonly room: TLfgRoom;
    readonly target: IUser;
}) => MaybePromise<
    TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED
        | ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
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

export type TWithLfgUnitOfWork = <Arg, Return>(useCase: TLfgUseCase<Arg, Return>) => (arg: Arg) => Promise<Return>;
