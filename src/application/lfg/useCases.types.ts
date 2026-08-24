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
    readonly create: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly code: string;
    };
    readonly disband: {
        readonly guildId: string;
        readonly code: string;
    };
    readonly disbandOwnedRoom: {
        readonly guildId: string;
        readonly owner: IUser;
    };
    readonly status: {
        readonly guildId: string;
    };
    readonly kick: {
        readonly guildId: string;
        readonly code: string;
        readonly target: IUser;
    };
    readonly kickFromOwnedRoom: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly target: IUser;
    };
    readonly leave: {
        readonly guildId: string;
        readonly user: IUser;
    };
    readonly move: {
        readonly guildId: string;
        readonly user: IUser;
        readonly code: string;
    };
    readonly transfer: {
        readonly guildId: string;
        readonly code: string;
        readonly target: IUser;
    };
    readonly transferOwnedRoom: {
        readonly guildId: string;
        readonly owner: IUser;
        readonly target: IUser;
    };
};

export type TLfgUseCases = {
    readonly [Name in keyof TLfgUseCaseArgs]: (arg: TLfgUseCaseArgs[Name]) => MaybePromise<TLfgResultTypes[Name]>;
};

export default TLfgUseCases;
