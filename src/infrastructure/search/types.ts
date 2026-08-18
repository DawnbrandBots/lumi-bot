import type { TSearchKind } from "../../domain/search/types.ts";
import type { Disciple } from "../game/models/disciple.ts";
import type { Music } from "../game/models/music.ts";
import type { Spell } from "../game/models/spell.ts";
import type { Weapon } from "../game/models/weapon.ts";
import type { WeaponSkill } from "../game/models/weaponSkill.ts";

export type TSearchableOrmEntity = Disciple | Weapon | WeaponSkill | Spell | Music;
export type TSearchOrmEntityMap = { [Entity in TSearchableOrmEntity as Entity["kind"]]: Entity };
export type TSearchOrmEntity<Kind extends TSearchKind> = TSearchOrmEntityMap[Kind];
