import type { IUser } from "../../domain/lfg/models/user.types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TLfgResultTypes } from "./types.ts";

export type TLfgUseCaseArgs = {
    readonly changeRoomCode: {
        readonly guildId: string;
        readonly code: string;
        readonly newCode: string;
    };
    readonly changeOwnedRoomCode: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly newCode: string;
    };
    readonly createRoom: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly code: string;
    };
    readonly disbandRoom: {
        readonly guildId: string;
        readonly code: string;
    };
    readonly disbandOwnedRoom: {
        readonly guildId: string;
        readonly owner: IUser;
    };
    readonly getLfgStatus: {
        readonly guildId: string;
    };
    readonly kickPlayerFromRoom: {
        readonly guildId: string;
        readonly code: string;
        readonly target: IUser;
    };
    readonly kickPlayerFromOwnedRoom: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly target: IUser;
    };
    readonly leaveRoom: {
        readonly guildId: string;
        readonly user: IUser;
    };
    readonly movePlayerToRoom: {
        readonly guildId: string;
        readonly user: IUser;
        readonly code: string;
    };
    readonly transferRoomToPlayer: {
        readonly guildId: string;
        readonly code: string;
        readonly target: IUser;
    };
    readonly transferOwnedRoomToPlayer: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly target: IUser;
    };
};

export type TLfgUseCases = {
    readonly [Name in keyof TLfgUseCaseArgs]: (arg: TLfgUseCaseArgs[Name]) => MaybePromise<TLfgResultTypes[Name]>;
};

export default TLfgUseCases;
