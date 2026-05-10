import { Type } from "@mikro-orm/core";
import type { ISpellEffectTarget, TSpellEffectTarget } from "../types.ts";

export class SpellEffectTarget implements ISpellEffectTarget {
    readonly kind: ISpellEffectTarget["kind"];
    readonly asString: ISpellEffectTarget["asString"];

    public constructor({
        kind,
        asString,
    }: {
        readonly kind: ISpellEffectTarget["kind"];
        readonly asString: ISpellEffectTarget["asString"];
    }) {
        this.kind = kind;
        this.asString = asString;
    }
}

const SPELL_EFFECT_TARGETS = {
    ANY: new SpellEffectTarget({ kind: "ANY", asString: "targets" }),
    SELF: new SpellEffectTarget({ kind: "SELF", asString: "user" }),
    DUAL: new SpellEffectTarget({ kind: "DUAL", asString: "user and targets" }),
} as const satisfies { [K in TSpellEffectTarget]: ISpellEffectTarget };

export class SpellEffectTargetType extends Type<SpellEffectTarget, string | null | undefined> {
    public convertToDatabaseValue(value: SpellEffectTarget | null | undefined): string | null | undefined {
        return value?.kind;
    }

    public convertToJSValue(value: string): SpellEffectTarget {
        if (value in SPELL_EFFECT_TARGETS) {
            return SPELL_EFFECT_TARGETS[value as keyof typeof SPELL_EFFECT_TARGETS];
        }
        throw new Error("Invalid spell effect target id");
    }
}
