import { Type } from "@mikro-orm/core";
import { ESpellRole, ISpellRole } from "../types.ts";

export class SpellRole implements ISpellRole {
    readonly kind: ISpellRole["kind"];
    readonly name: ISpellRole["name"];

    public constructor({ kind, name }: { readonly kind: ISpellRole["kind"]; readonly name: ISpellRole["name"] }) {
        this.kind = kind;
        this.name = name;
    }
}

const SPELL_EFFECT_ROLES = {
    EX: new SpellRole({ kind: ESpellRole.EX, name: "EX" }),
    LIGHT: new SpellRole({ kind: ESpellRole.LIGHT, name: "Light" }),
    SHADOW: new SpellRole({ kind: ESpellRole.SHADOW, name: "Shadow" }),
} as const satisfies { [K in ESpellRole]: ISpellRole };

export class SpellRoleType extends Type<SpellRole, string | null | undefined> {
    public convertToDatabaseValue(value: SpellRole | null | undefined): string | null | undefined {
        return value?.kind;
    }

    public convertToJSValue(value: string): SpellRole {
        if (value in SPELL_EFFECT_ROLES) {
            return SPELL_EFFECT_ROLES[value as keyof typeof SPELL_EFFECT_ROLES];
        }
        throw new Error("Invalid spell effect target id");
    }
}
