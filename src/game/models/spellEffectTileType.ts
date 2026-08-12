import { Type } from "@mikro-orm/sqlite";
import { ESpellEffectTileType, type ISpellEffectTileType } from "../types.ts";

export class SpellEffectTileType implements ISpellEffectTileType {
    readonly id: ISpellEffectTileType["id"];
    readonly name: ISpellEffectTileType["name"];

    public constructor({
        id,
        name,
    }: {
        readonly id: ISpellEffectTileType["id"];
        readonly name: ISpellEffectTileType["name"];
    }) {
        this.id = id;
        this.name = name;
    }
}

const SPELL_EFFECT_TILE_TYPES = {
    GROUND: new SpellEffectTileType({ id: ESpellEffectTileType.GROUND, name: "ground" }),
    WATER: new SpellEffectTileType({ id: ESpellEffectTileType.WATER, name: "water" }),
    WALL: new SpellEffectTileType({ id: ESpellEffectTileType.WALL, name: "wall" }),
} as const satisfies { [K in keyof typeof ESpellEffectTileType]: ISpellEffectTileType };

export class SpellEffectTileTypeType extends Type<SpellEffectTileType, string | null | undefined> {
    public convertToDatabaseValue(value: SpellEffectTileType | null | undefined): string | null | undefined {
        return value?.id;
    }

    public convertToJSValue(value: string): SpellEffectTileType {
        if (value in SPELL_EFFECT_TILE_TYPES) {
            return SPELL_EFFECT_TILE_TYPES[value as keyof typeof SPELL_EFFECT_TILE_TYPES];
        }
        throw new Error("Invalid spell effect tile type id");
    }
}
