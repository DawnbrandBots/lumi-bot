import type { TId } from "./base.types.ts";
import type { IDisciple } from "./disciple.types.ts";
import type { IMovementType } from "./movement.types.ts";
import type { TRootSpellEffect } from "./spellEffect.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

export const ESpellCastKind = {
    /** Spell properties are the same at all time during battle. */
    NORMAL: "NORMAL",
    /** Spell properties differ based on the caster's Light or Shadow form. */
    FORM_BASED: "FORM_BASED",
} as const;

export const ESpellRole = {
    /** Spell usable by one disciple only, no matter the side. */
    EX: "EX",
    /** Spell usable when fighting for the Light. */
    LIGHT: "LIGHT",
    /** Spell usable when fighting for the Shadow. */
    SHADOW: "SHADOW",
} as const;

/** Role by which a spell can be used. */
export interface ISpellRole {
    readonly kind: keyof typeof ESpellRole;
    readonly name: string;
}

/** Tiles that will be affected by a spell when dragged on the grid. */
export interface ISpellShape {
    readonly id: string;
    readonly name: string;
    /**
     * 25 characters representing tiles part of a shape.
     * - `X` for the tile in the shape that's dragged on the battle grid
     * - `O` for other tiles part of the shape
     * - `.` for tiles not part of the shape
     */
    readonly tiles: string;
    /** Covers more than one tile. */
    readonly isAoe: boolean;
}

export const ESpellDraggingModeKind = {
    /** Spell targets tile on which it was dragged. */
    ANY: "ANY",
    /** Spell targets user no matter which tile it was dragged on. */
    SELF: "SELF",
} as const;
export type TSpellDraggingModeKind = (typeof ESpellDraggingModeKind)[keyof typeof ESpellDraggingModeKind];

/** Determines which units are targeted by a spell depending on where it was dragged on the grid. */
export interface ISpellDraggingMode {
    readonly kind: keyof typeof ESpellDraggingModeKind;
    readonly asString: string;
}

/** Properties which may have different values for spells which cast.kind is ESpellCastKind.FORM_BASED. */
export interface ISpellCastProperties {
    /** Seconds between using the spell and applying its effects. Nullish means no countdown. */
    readonly countdown?: number | null;
    /** Seconds the player must wait to use another spell after using this one. */
    readonly cooldown: number;
    /** Effects created by the spell when dragged on the grid, in order of activation. */
    readonly effects: readonly TRootSpellEffect[];
    /** Locations of tiles affected by this spell's effects relatively to the tile the spell was dragged to. */
    readonly shape: ISpellShape;
    readonly draggingMode: TSpellDraggingModeKind;
}

export type TSpellCast<CastProperties = ISpellCastProperties> =
    | (CastProperties & { readonly kind: typeof ESpellCastKind.NORMAL })
    | {
          readonly kind: typeof ESpellCastKind.FORM_BASED;
          readonly light: CastProperties;
          readonly shadow: CastProperties;
      };

/** Referred to as "magic skill" in Fire Emblem Shadows. */
export interface ISpell {
    readonly kind: "spell";
    readonly id: TId;
    readonly name: string;
    /**
     * Disciple who provides the spell.
     *
     * Some spells, like "Minor" ones, don't have an associated disciple.
     */
    readonly disciple?: IDisciple | null;
    readonly role: keyof typeof ESpellRole;
    /**
     * Number of times this spell can be used.
     *
     * `null` means an infinite number of times.
     */
    // TODO: using Infinity might be a better fit?
    readonly uses: number | null | undefined;
    readonly cast: TSpellCast;
    /** Kind of units that this spell can only be used by. */
    readonly onlyFor?: IMovementType | IWeaponType | null;
}
