import type { IDisciple } from "../../domain/game/models/disciple.types.ts";
import type { IWeapon } from "../../domain/game/models/weapon.types.ts";
import type { MaybePromise } from "../../utils/types.ts";

export type TBazaarQueries = {
    readonly findDiscipleById: (arg: {
        readonly discipleId: string;
    }) => MaybePromise<Pick<IDisciple, "id" | "isBattlePassDisciple" | "name"> | null>;
    readonly findWeaponById: (arg: {
        readonly weaponId: string;
    }) => MaybePromise<Pick<IWeapon, "id" | "level" | "name"> | null>;
};
