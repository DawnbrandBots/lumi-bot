import type { Paths, PickDeep } from "type-fest";
import type { TLfgPlayerRemovalResult } from "../../domain/lfg/models/playerRemoval.types.ts";
import type { IRoom } from "../../domain/lfg/models/room.types.ts";
import type { IUser } from "../../domain/lfg/models/user.types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TApplicationRepositories } from "../repositories.types.ts";
import type { TLfgUseCaseArgs, TLfgUseCases } from "./useCases.types.ts";

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
    // TODO: one one hand, HELP_REQUESTED could be removed
    // on the other, maybe this is a sign some kinds (or all?)
    // actually belong at the presentation level rather than application
    HELP_REQUESTED = "HELP_REQUESTED",
    LFG_CHANNEL_NOT_FOUND = "LFG_CHANNEL_NOT_FOUND",
    LFG_ROLE_CANNOT_BE_EVERYONE = "LFG_ROLE_CANNOT_BE_EVERYONE",
    LFG_ROLE_NOT_CONFIGURED = "LFG_ROLE_NOT_CONFIGURED",
    LFG_ROLE_NOT_FOUND = "LFG_ROLE_NOT_FOUND",
    LFG_ROLE_ON_COOLDOWN = "LFG_ROLE_ON_COOLDOWN",
    LFG_ROLE_PINGED = "LFG_ROLE_PINGED",
}

type TLfgResultValueByKind = {
    [ELfgResultKind.ROOMS_LISTED]: {
        readonly guildConfig: TLfgStatusGuildConfig | null;
        readonly rooms: readonly IRoom[];
    };
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
    [ELfgResultKind.LFG_ROLE_ON_COOLDOWN]: { readonly roleId: string; readonly nextPingAt: Date };
    [ELfgResultKind.LFG_ROLE_PINGED]: {
        readonly channelId: string;
        readonly roleId: string;
        readonly userId: string;
    };
} & {
    [
        _ in
            | ELfgResultKind.INVALID_ROOM_CODE
            | ELfgResultKind.NOT_ROOM_OWNER
            | ELfgResultKind.CANNOT_KICK_YOURSELF
            | ELfgResultKind.NOT_IN_A_ROOM
            | ELfgResultKind.HELP_REQUESTED
            | ELfgResultKind.LFG_CHANNEL_NOT_FOUND
            | ELfgResultKind.LFG_ROLE_CANNOT_BE_EVERYONE
            | ELfgResultKind.LFG_ROLE_NOT_CONFIGURED
            | ELfgResultKind.LFG_ROLE_NOT_FOUND
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
    getLfgStatus: TLfgResultOfKind<ELfgResultKind.ROOMS_LISTED>;
    createRoom: TLfgResultOfKind<
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
    movePlayerToRoom: TLfgResultOfKind<
        | ELfgResultKind.ROOM_JOINED
        | ELfgResultKind.ROOM_NOT_FOUND
        | ELfgResultKind.ALREADY_IN_TARGET_ROOM
        | ELfgResultKind.ROOM_IS_FULL
    >;
    transferRoomToPlayer: TLfgResultOfKind<
        | ELfgResultKind.OWNERSHIP_TRANSFERRED
        | ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
        | ELfgResultKind.ROOM_NOT_FOUND
    >;
    transferOwnedRoomToPlayer: TLfgResultOfKind<
        | ELfgResultKind.OWNERSHIP_TRANSFERRED
        | ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
        | ELfgResultKind.NOT_ROOM_OWNER
        | ELfgResultKind.NOT_IN_A_ROOM
    >;
    kickPlayerFromRoom: TLfgResultOfKind<
        ELfgResultKind.PLAYER_KICKED | ELfgResultKind.PLAYER_NOT_IN_ROOM | ELfgResultKind.ROOM_NOT_FOUND
    >;
    kickPlayerFromOwnedRoom: TLfgResultOfKind<
        | ELfgResultKind.PLAYER_KICKED
        | ELfgResultKind.CANNOT_KICK_YOURSELF
        | ELfgResultKind.PLAYER_NOT_IN_ROOM
        | ELfgResultKind.NOT_ROOM_OWNER
        | ELfgResultKind.NOT_IN_A_ROOM
    >;
    leaveRoom: TLfgResultOfKind<ELfgResultKind.ROOM_LEFT | ELfgResultKind.NOT_IN_A_ROOM>;
    disbandRoom: TLfgResultOfKind<ELfgResultKind.ROOM_DISBANDED | ELfgResultKind.ROOM_NOT_FOUND>;
    disbandOwnedRoom: TLfgResultOfKind<
        ELfgResultKind.ROOM_DISBANDED | ELfgResultKind.NOT_ROOM_OWNER | ELfgResultKind.NOT_IN_A_ROOM
    >;
};

export type TLfgRoom = IRoom & {
    readonly id: string;
};

export type TLfgStatusGuildConfig = {
    readonly lfgChannel: string | null;
    readonly lfgRolePingCooldownMinutes: number | null;
    readonly lfgRoles: readonly {
        readonly lastPingedAt: Date | string | null;
        readonly role: string;
    }[];
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

export type TLfgServices = {
    readonly changeRoomCodeInRoom: (arg: {
        readonly guildId: string;
        readonly room: TLfgRoom;
        readonly newCode: string;
    }) => MaybePromise<
        TLfgResultOfKind<
            ELfgResultKind.ROOM_CODE_CHANGED | ELfgResultKind.INVALID_ROOM_CODE | ELfgResultKind.ROOM_ALREADY_EXISTS
        >
    >;
    readonly getOwnedRoom: (arg: {
        readonly guildId: string;
        readonly owner: IUser;
    }) => MaybePromise<TGetOwnedLfgRoomResult>;
    readonly kickFromRoom: (arg: {
        readonly guildId: string;
        readonly room: TLfgRoom;
        readonly target: IUser;
    }) => MaybePromise<TLfgResultOfKind<ELfgResultKind.PLAYER_KICKED | ELfgResultKind.PLAYER_NOT_IN_ROOM>>;
    readonly removePlayerFromRoom: (arg: {
        readonly room: TLfgRoom;
        readonly userId: string;
    }) => MaybePromise<TLfgPlayerRemovalResult>;
    readonly transferRoom: (arg: {
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
};

export type TLfgDependencies = {
    readonly repositories: TApplicationRepositories;
    readonly services: TLfgServices;
};

export type TLfgUseCaseDependencies = TLfgDependencies;

export type TLfgUseCase<Arg, Return> = (dependencies: TLfgUseCaseDependencies, arg: Arg) => MaybePromise<Return>;

export type TLfgUseCaseBase<Name extends keyof TLfgUseCases, DependencyPaths extends Paths<TLfgDependencies>> = (
    dependencies: PickDeep<TLfgDependencies, DependencyPaths>,
    arg: TLfgUseCaseArgs[Name],
) => ReturnType<TLfgUseCases[Name]>;

export type TLfgServiceBase<Name extends keyof TLfgServices, DependencyPaths extends Paths<TLfgDependencies>> = (
    dependencies: PickDeep<TLfgDependencies, DependencyPaths>,
    arg: Parameters<TLfgServices[Name]>[0],
) => ReturnType<TLfgServices[Name]>;
