import { bold } from "discord.js";
import type { IWeaponSkill } from "../../../../domain/game/models/weaponSkill.types.ts";
import type { IWeaponTypeWeaponSkill } from "../../../../domain/game/models/weaponTypeWeaponSkill.types.ts";

export function getWeaponTypeSkillRankString(rank: IWeaponTypeWeaponSkill["rank"], weaponTypeName: string): string {
    switch (rank) {
        case 1:
            return `level 3 ${weaponTypeName}s`;
        case 2:
            return `level 5 ${weaponTypeName}s`;
        case 3:
            return `level 6 to 8 ${weaponTypeName}s`;
    }
}

export default function mapWeaponSkillToMessage(weaponSkill: IWeaponSkill) {
    const description = [
        `${bold("Effect")}: ${weaponSkill.description}`,
        `${bold("Weapons")}: ${[
            ...Array.from(weaponSkill.uniqueSkillWeapons).map((weapon) => weapon.name),
            ...Array.from(weaponSkill.weaponTypeWeaponSkills).map((weaponTypeWeaponSkill) =>
                getWeaponTypeSkillRankString(weaponTypeWeaponSkill.rank, weaponTypeWeaponSkill.weaponType.name),
            ),
        ].join(", ")}.`,
    ].join("\n");

    return {
        reply: {
            embed: {
                title: weaponSkill.name,
                description: description,
            },
        },
    };
}
