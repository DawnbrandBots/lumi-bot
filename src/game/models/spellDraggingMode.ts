import { Type } from "@mikro-orm/core";
import type { ISpellDraggingMode } from "../types.ts";
import { ESpellDraggingMode } from "../types.ts";

export class SpellDraggingMode implements ISpellDraggingMode {
    readonly kind: ISpellDraggingMode["kind"];
    readonly asString: ISpellDraggingMode["asString"];

    public constructor({
        kind,
        asString,
    }: {
        readonly kind: ISpellDraggingMode["kind"];
        readonly asString: ISpellDraggingMode["asString"];
    }) {
        this.kind = kind;
        this.asString = asString;
    }
}

export const SPELL_DRAGGING_MODE = {
    ANY: new SpellDraggingMode({ kind: ESpellDraggingMode.ANY, asString: "Any tile" }),
    SELF: new SpellDraggingMode({ kind: ESpellDraggingMode.SELF, asString: "User tile only" }),
} as const satisfies { [K in ESpellDraggingMode]: ISpellDraggingMode };

export class SpellDraggingModeType extends Type<SpellDraggingMode, string | null | undefined> {
    public convertToDatabaseValue(value: SpellDraggingMode | null | undefined): string | null | undefined {
        return value?.kind;
    }

    public convertToJSValue(value: string): SpellDraggingMode {
        if (value in SPELL_DRAGGING_MODE) {
            return SPELL_DRAGGING_MODE[value as keyof typeof SPELL_DRAGGING_MODE];
        }
        throw new Error("Invalid spell effect target id");
    }
}
