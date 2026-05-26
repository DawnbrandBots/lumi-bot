import type { IFeatureResponse } from "../bot/types.ts";
import type { MaybePromise } from "../utils/types.ts";

export type LfgUser = {
    readonly id: string;
};

export type LfgRoom = {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
};

export interface ILfgFeature {
    list(guildId: string): MaybePromise<IFeatureResponse>;
    help(): MaybePromise<IFeatureResponse>;
    create(guildId: string, owner: LfgUser, code: string): MaybePromise<IFeatureResponse>;
    join(guildId: string, user: LfgUser, code: string): MaybePromise<IFeatureResponse>;
    transfer(guildId: string, owner: LfgUser, target: LfgUser): MaybePromise<IFeatureResponse>;
    kick(guildId: string, owner: LfgUser, target: LfgUser): MaybePromise<IFeatureResponse>;
    leave(guildId: string, user: LfgUser): MaybePromise<IFeatureResponse>;
    disband(guildId: string, user: LfgUser): MaybePromise<IFeatureResponse>;
}
