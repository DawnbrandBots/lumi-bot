import type { MaybePromise } from "../utils/types.ts";

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
    ROOM_LEFT_AND_DELETED = "ROOM_LEFT_AND_DELETED",
    NOT_IN_A_ROOM = "NOT_IN_A_ROOM",
    ROOM_DISBANDED = "ROOM_DISBANDED",
    INVALID_SUBCOMMAND = "INVALID_SUBCOMMAND",
}

type TLfgFeatureReturnWithoutValue = {
    readonly kind:
        | ELfgFeatureReturnKind.INVALID_ROOM_CODE
        | ELfgFeatureReturnKind.ALREADY_IN_A_ROOM
        | ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
        | ELfgFeatureReturnKind.INVALID_SUBCOMMAND;
};

type TLfgFeatureReturnWithDescription = {
    readonly kind: ELfgFeatureReturnKind.HELP;
    readonly value: { readonly description: string };
};

type TLfgFeatureReturnWithRooms = {
    readonly kind: ELfgFeatureReturnKind.ROOMS_LISTED;
    readonly value: { readonly rooms: readonly IRoom[] };
};

type TLfgFeatureReturnWithRoom = {
    readonly kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM;
    readonly value: { readonly room: IRoom };
};

type TLfgFeatureReturnWithUserAndRoom = {
    readonly kind: ELfgFeatureReturnKind.ROOM_CREATED | ELfgFeatureReturnKind.ROOM_LEFT;
    readonly value: { readonly userId: string; readonly room: IRoom };
};

type TLfgFeatureReturnWithJoinedRoom = {
    readonly kind: ELfgFeatureReturnKind.ROOM_JOINED;
    readonly value: { readonly userId: string; readonly room: IRoom; readonly leftRoomCode?: string };
};

type TLfgFeatureReturnWithUserTargetAndRoom = {
    readonly kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED | ELfgFeatureReturnKind.PLAYER_KICKED;
    readonly value: { readonly userId: string; readonly targetId: string; readonly room: IRoom };
};

type TLfgFeatureReturnWithCode = {
    readonly kind:
        | ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS
        | ELfgFeatureReturnKind.ROOM_NOT_FOUND
        | ELfgFeatureReturnKind.ROOM_IS_FULL;
    readonly value: { readonly code: string };
};

type TLfgFeatureReturnWithUserAndCode = {
    readonly kind: ELfgFeatureReturnKind.ROOM_LEFT_AND_DELETED | ELfgFeatureReturnKind.ROOM_DISBANDED;
    readonly value: { readonly userId: string; readonly code: string };
};

type TLfgFeatureReturnWithTarget = {
    readonly kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM;
    readonly value: { readonly targetId: string };
};

export type TLfgFeatureReturn =
    | TLfgFeatureReturnWithoutValue
    | TLfgFeatureReturnWithDescription
    | TLfgFeatureReturnWithRooms
    | TLfgFeatureReturnWithRoom
    | TLfgFeatureReturnWithUserAndRoom
    | TLfgFeatureReturnWithJoinedRoom
    | TLfgFeatureReturnWithUserTargetAndRoom
    | TLfgFeatureReturnWithCode
    | TLfgFeatureReturnWithUserAndCode
    | TLfgFeatureReturnWithTarget;

type TLfgFeatureReturnOfKind<Kind extends ELfgFeatureReturnKind> = TLfgFeatureReturn & { readonly kind: Kind };

export type TLfgFeatureReturnTypes = {
    list: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.ROOMS_LISTED>;
    help: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.HELP>;
    create: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_CREATED
        | ELfgFeatureReturnKind.INVALID_ROOM_CODE
        | ELfgFeatureReturnKind.ALREADY_IN_A_ROOM
        | ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS
    >;
    join: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_JOINED
        | ELfgFeatureReturnKind.ROOM_NOT_FOUND
        | ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM
        | ELfgFeatureReturnKind.ROOM_IS_FULL
    >;
    transfer: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED
        | ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
    kick: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.PLAYER_KICKED
        | ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF
        | ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
    leave: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_LEFT
        | ELfgFeatureReturnKind.ROOM_LEFT_AND_DELETED
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
    disband: TLfgFeatureReturnOfKind<
        | ELfgFeatureReturnKind.ROOM_DISBANDED
        | ELfgFeatureReturnKind.NOT_ROOM_OWNER
        | ELfgFeatureReturnKind.NOT_IN_A_ROOM
    >;
};

export interface ILfgFeature {
    list(guildId: string): MaybePromise<TLfgFeatureReturnTypes["list"]>;
    help(): MaybePromise<TLfgFeatureReturnTypes["help"]>;
    create(guildId: string, owner: IUser, code: string): MaybePromise<TLfgFeatureReturnTypes["create"]>;
    join(guildId: string, user: IUser, code: string): MaybePromise<TLfgFeatureReturnTypes["join"]>;
    transfer(guildId: string, owner: IUser, target: IUser): MaybePromise<TLfgFeatureReturnTypes["transfer"]>;
    kick(guildId: string, owner: IUser, target: IUser): MaybePromise<TLfgFeatureReturnTypes["kick"]>;
    leave(guildId: string, user: IUser): MaybePromise<TLfgFeatureReturnTypes["leave"]>;
    disband(guildId: string, user: IUser): MaybePromise<TLfgFeatureReturnTypes["disband"]>;
}
