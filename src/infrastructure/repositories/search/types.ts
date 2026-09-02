import type { EntityManager } from "@mikro-orm/sqlite";
import type { TSearchKind } from "../../../domain/search/types.ts";
import type { Disciple } from "../../wrappers/orm/mikroOrm/models/game/disciple.ts";
import type { Music } from "../../wrappers/orm/mikroOrm/models/game/music.ts";
import type { Spell } from "../../wrappers/orm/mikroOrm/models/game/spell.ts";
import type { Weapon } from "../../wrappers/orm/mikroOrm/models/game/weapon.ts";
import type { WeaponSkill } from "../../wrappers/orm/mikroOrm/models/game/weaponSkill.ts";

export type TSearchableOrmEntity = Disciple | Weapon | WeaponSkill | Spell | Music;
export type TSearchOrmEntityMap = { [Entity in TSearchableOrmEntity as Entity["kind"]]: Entity };
export type TSearchOrmEntity<Kind extends TSearchKind> = TSearchOrmEntityMap[Kind];

export type TSearchPersistenceContext = {
    readonly em: EntityManager;
};

export type TSearchPersistenceFunction<Function extends (...args: never[]) => unknown> = (
    context: TSearchPersistenceContext,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;
