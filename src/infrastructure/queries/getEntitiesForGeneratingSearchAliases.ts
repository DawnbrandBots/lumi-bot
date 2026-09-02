import type { SqlEntityManager } from "@mikro-orm/sqlite";
import type { TSearchAliasEntities } from "../../application/search/searchAliases.types.ts";
import { Disciple } from "../wrappers/orm/mikroOrm/models/game/disciple.ts";
import { Music } from "../wrappers/orm/mikroOrm/models/game/music.ts";
import { Spell } from "../wrappers/orm/mikroOrm/models/game/spell.ts";
import { Weapon } from "../wrappers/orm/mikroOrm/models/game/weapon.ts";
import { WeaponSkill } from "../wrappers/orm/mikroOrm/models/game/weaponSkill.ts";

export async function getEntitiesForGeneratingSearchAliases({
    em,
}: {
    readonly em: SqlEntityManager;
}): Promise<TSearchAliasEntities> {
    // Fork EM to not preserve (even partially) loaded entities in memory.
    const localEm = em.fork();

    const weapons = await localEm.findAll(Weapon, { populate: ["prfDisciple"] });
    const disciples = await localEm.findAll(Disciple, { populate: ["prfWeapon", "spells"] });
    const weaponSkills = await localEm.findAll(WeaponSkill, { populate: ["uniqueSkillWeapons"] });
    const spells = await localEm.findAll(Spell, { populate: ["disciple"] });
    const music = await localEm.findAll(Music, {
        populate: ["shadowMusicFor", "shadowResultsScreenMusicFor"],
    });

    // TODO: can't we think of something simpler?
    return {
        disciple: disciples.map((disciple) => ({
            id: disciple.id,
            kind: disciple.kind,
            name: disciple.name,
            prfWeapon: disciple.prfWeapon && { name: disciple.prfWeapon.name },
            spells: [...disciple.spells].map((spell) => ({ name: spell.name })),
        })),
        music: music.map((musicItem) => ({
            id: musicItem.id,
            kind: musicItem.kind,
            name: musicItem.name,
            shadowMusicFor:
                musicItem.shadowMusicFor && [...musicItem.shadowMusicFor].map((disciple) => ({ name: disciple.name })),
            shadowResultsScreenMusicFor:
                musicItem.shadowResultsScreenMusicFor &&
                [...musicItem.shadowResultsScreenMusicFor].map((disciple) => ({ name: disciple.name })),
        })),
        spell: spells.map((spell) => ({
            id: spell.id,
            kind: spell.kind,
            name: spell.name,
            disciple: spell.disciple && { name: spell.disciple.name },
            role: spell.role,
        })),
        weapon: weapons.map((weapon) => ({
            id: weapon.id,
            kind: weapon.kind,
            name: weapon.name,
            prfDisciple: weapon.prfDisciple && { name: weapon.prfDisciple.name },
        })),
        weaponSkill: weaponSkills.map((weaponSkill) => ({
            id: weaponSkill.id,
            kind: weaponSkill.kind,
            name: weaponSkill.name,
            uniqueSkillWeapons: [...weaponSkill.uniqueSkillWeapons].map((weapon) => ({ name: weapon.name })),
        })),
    };
}
