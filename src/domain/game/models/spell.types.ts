import type { TId } from "./base.types.ts";
import type { IDisciple } from "./disciple.types.ts";
import type { IMovementType } from "./movement.types.ts";
import type { TRootSpellEffect } from "./spellEffect.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

export const ESpellRole = {
    /**
     * Spell usable by one disciple only, no matter the side.
     */
    EX: "EX",
    /**
     * Spell usable when fighting for the Light.
     */
    LIGHT: "LIGHT",
    /**
     * Spell usable when fighting for the Shadow.
     */
    SHADOW: "SHADOW",
} as const;

/**
 * Role by which a spell can be used.
 */
export interface ISpellRole {
    readonly kind: keyof typeof ESpellRole;
    readonly name: string;
}

/**
 * Tiles that will be affected by a spell when dragged on the grid.
 */
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
    /**
     * Covers more than one tile.
     */
    readonly isAoe: boolean;
}

export const ESpellDraggingMode = {
    /**
     * Spell targets tile on which it was dragged.
     */
    ANY: "ANY",
    /**
     * Spell targets user no matter which tile it was dragged on.
     */
    SELF: "SELF",
} as const;

/**
 * Determines which units are targeted by a spell depending on where it was dragged on the grid.
 */
export interface ISpellDraggingMode {
    readonly kind: keyof typeof ESpellDraggingMode;
    readonly asString: string;
}

/**
 * Referred to as "magic skill" in Fire Emblem Shadows.
 */
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
    /**
     * Seconds between this spell is used and its effects are applied. Only concerns some Shadow spells.
     *
     * `null`ish means no countdown.
     */
    readonly countdown?: number | null;
    /**
     * Seconds the player must wait to use another spell after using this one.
     */
    readonly cooldown: number;
    /**
     * Effects created by the spell when dragged on the grid, in order of activation.
     */
    readonly effects: TRootSpellEffect[];
    readonly shape: ISpellShape;
    /**
     * Kind of units that this spell can only be used by.
     */
    readonly onlyFor?: IMovementType | IWeaponType | null;
    readonly draggingMode: keyof typeof ESpellDraggingMode;
}
