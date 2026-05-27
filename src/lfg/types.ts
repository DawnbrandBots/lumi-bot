import type { IFeatureResponse } from "../bot/types.ts";
import type { MaybePromise } from "../utils/types.ts";

export interface IUser {
    readonly id: string;
}

export interface IRoom {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
}

export interface ILfgFeature {
    list(guildId: string): MaybePromise<IFeatureResponse>;
    help(): MaybePromise<IFeatureResponse>;
    create(guildId: string, owner: IUser, code: string): MaybePromise<IFeatureResponse>;
    join(guildId: string, user: IUser, code: string): MaybePromise<IFeatureResponse>;
    transfer(guildId: string, owner: IUser, target: IUser): MaybePromise<IFeatureResponse>;
    kick(guildId: string, owner: IUser, target: IUser): MaybePromise<IFeatureResponse>;
    leave(guildId: string, user: IUser): MaybePromise<IFeatureResponse>;
    disband(guildId: string, user: IUser): MaybePromise<IFeatureResponse>;
}
