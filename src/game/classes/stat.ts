import { Type } from "@mikro-orm/core";
import type { IStat } from "../types.ts";
import { EStat } from "../types.ts";

export class Stat implements IStat {
    readonly id: IStat["id"];
    readonly name: IStat["name"];

    public constructor({ id, name }: { readonly id: IStat["id"]; readonly name: IStat["name"] }) {
        this.id = id;
        this.name = name;
    }
}

const STATS = {
    HP: new Stat({ id: EStat.HP, name: "HP" }),
    ATK: new Stat({ id: EStat.ATK, name: "Atk" }),
    RECEIVED_WEAPON_DAMAGE: new Stat({ id: EStat.RECEIVED_WEAPON_DAMAGE, name: "Received Weapon Damage" }),
    RECEIVED_SPELL_DAMAGE: new Stat({ id: EStat.RECEIVED_SPELL_DAMAGE, name: "Received Spell Damage" }),
    MOVEMENT: new Stat({ id: EStat.MOVEMENT, name: "Movement" }),
    COLOR_AFFINITY: new Stat({ id: EStat.COLOR_AFFINITY, name: "Color Affinity" }),
} as const satisfies { [K in EStat]: IStat };

export class StatType extends Type<Stat, string | null | undefined> {
    public convertToDatabaseValue(value: Stat | null | undefined): string | null | undefined {
        return value?.id;
    }

    public convertToJSValue(value: string): Stat {
        if (value in STATS) {
            return STATS[value as keyof typeof STATS];
        }
        throw new Error("Invalid stat id");
    }
}
