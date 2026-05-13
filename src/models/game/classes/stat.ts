import { Type } from "@mikro-orm/core";
import type { IStat, TStat } from "../types.ts";

export class Stat implements IStat {
    readonly id: IStat["id"];
    readonly name: IStat["name"];

    public constructor({ id, name }: { readonly id: IStat["id"]; readonly name: IStat["name"] }) {
        this.id = id;
        this.name = name;
    }
}

const STATS = {
    HP: new Stat({ id: "HP", name: "HP" }),
    ATK: new Stat({ id: "ATK", name: "Atk" }),
    RECEIVED_WEAPON_DAMAGE: new Stat({ id: "RECEIVED_WEAPON_DAMAGE", name: "Received Weapon Damage" }),
    RECEIVED_SPELL_DAMAGE: new Stat({ id: "RECEIVED_SPELL_DAMAGE", name: "Received Spell Damage" }),
    MOVEMENT: new Stat({ id: "MOVEMENT", name: "Movement" }),
    COLOR_AFFINITY: new Stat({ id: "COLOR_AFFINITY", name: "Color Affinity" }),
} as const satisfies { [K in TStat]: IStat };

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
