import type { EntityManager, FilterQuery } from "@mikro-orm/sqlite";
import type { TSearchKind } from "../../domain/search/types.ts";
import { Disciple } from "../game/models/disciple.ts";
import { Music } from "../game/models/music.ts";
import { Spell } from "../game/models/spell.ts";
import { Weapon } from "../game/models/weapon.ts";
import { WeaponSkill } from "../game/models/weaponSkill.ts";
import type { ISearchConfig, ISearchConfigs } from "./getGameDataEntityForSearchResult.types.ts";
import type { TSearchOrmEntity } from "./types.ts";

const spellPopulate = ["*"] as const;
const weaponPopulate = ["weaponType", "weaponType.weaponSkills.effect", "uniqueSkill.effect", "prfDisciple"] as const;

const disciple: ISearchConfig<Disciple> = { class: Disciple } as const;
const music: ISearchConfig<Music> = { class: Music } as const;
const spell: ISearchConfig<Spell, (typeof spellPopulate)[number]> = { class: Spell, populate: spellPopulate } as const;
const weapon: ISearchConfig<Weapon, (typeof weaponPopulate)[number]> = {
    class: Weapon,
    populate: weaponPopulate,
} as const;
const weaponSkill: ISearchConfig<WeaponSkill> = { class: WeaponSkill } as const;

const SEARCH_CONFIGS = {
    disciple,
    music,
    spell,
    weapon,
    weaponSkill,
} as const satisfies ISearchConfigs;

function getFromEntityManager<Kind extends TSearchKind>(arg: {
    em: EntityManager;
    config: ISearchConfigs[Kind];
    query: FilterQuery<TSearchOrmEntity<Kind>>;
}): Promise<TSearchOrmEntity<Kind> | null> {
    return arg.em.findOne(arg.config.class, arg.query, {
        populate: (arg.config.populate ?? ["*"]) as never,
    });
}

export async function getGameDataEntityForSearchResult<Kind extends TSearchKind>(
    { em }: { em: EntityManager },
    searchItem: { kind: Kind; id: string },
) {
    // TODO: figure out the correct types here
    const config = SEARCH_CONFIGS[searchItem.kind];
    const query = { id: searchItem.id } as FilterQuery<TSearchOrmEntity<Kind>>;
    return getFromEntityManager({ em, config, query });
}
