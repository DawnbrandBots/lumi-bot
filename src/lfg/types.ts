import type { MaybePromise } from "../utils/types.ts";

// TODO: these types are not implemented by corredsponding classes in their original PR.
// Also, properly document them.

export interface IUser {
    readonly id: string;
}

export interface IRoom {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
}

export const enum ELfgFeatureReturnKind {
    ROOMS_LISTED = "ROOMS_LISTED",
    HELP = "HELP",
    ROOM_CREATED = "ROOM_CREATED",
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

export const enum ELfgPlayerRemovalKind {
    LEFT_ROOM_NORMALLY = "LEFT_ROOM_NORMALLY",
    OWNERSHIP_TRANSFERRED = "OWNERSHIP_TRANSFERRED",
    ROOM_DELETED = "ROOM_DELETED",
}

export type TLfgPlayerRemovalResult =
    | {
        readonly kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY | ELfgPlayerRemovalKind.ROOM_DELETED;
    }
    | {
        readonly kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED;
        readonly newOwnerId: string;
    };

type TLfgFeatureReturnValueByKind = {
    [ELfgFeatureReturnKind.ROOMS_LISTED]: { readonly rooms: readonly IRoom[] };
    [ELfgFeatureReturnKind.ROOM_CREATED]: { readonly userId: string; readonly room: IRoom };
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
    [_ in
    | ELfgFeatureReturnKind.HELP
    | ELfgFeatureReturnKind.INVALID_ROOM_CODE
    | ELfgFeatureReturnKind.NOT_ROOM_OWNER
    | ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF
    | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    | ELfgFeatureReturnKind.INVALID_SUBCOMMAND]: never;
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

export interface ILfgFeature {
    status(guildId: string): MaybePromise<TLfgFeatureReturnTypes["status"]>;
    help(): MaybePromise<TLfgFeatureReturnTypes["help"]>;
    create(guildId: string, owner: IUser, code: string): MaybePromise<TLfgFeatureReturnTypes["create"]>;
    move(guildId: string, user: IUser, code: string): MaybePromise<TLfgFeatureReturnTypes["move"]>;
    transfer(guildId: string, code: string, target: IUser): MaybePromise<TLfgFeatureReturnTypes["transfer"]>;
    transferOwnedRoom(
        guildId: string,
        owner: IUser,
        target: IUser,
    ): MaybePromise<TLfgFeatureReturnTypes["transferOwnedRoom"]>;
    kick(guildId: string, code: string, target: IUser): MaybePromise<TLfgFeatureReturnTypes["kick"]>;
    kickFromOwnedRoom(
        guildId: string,
        owner: IUser,
        target: IUser,
    ): MaybePromise<TLfgFeatureReturnTypes["kickFromOwnedRoom"]>;
    leave(guildId: string, user: IUser): MaybePromise<TLfgFeatureReturnTypes["leave"]>;
    disband(guildId: string, code: string): MaybePromise<TLfgFeatureReturnTypes["disband"]>;
    disbandOwnedRoom(guildId: string, owner: IUser): MaybePromise<TLfgFeatureReturnTypes["disbandOwnedRoom"]>;
}
