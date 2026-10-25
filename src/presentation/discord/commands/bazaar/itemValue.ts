import type { TListableItemReference } from "../../../../application/bazaar/types.ts";
import { EWeaponVariant } from "../../../../domain/game/models/weaponVariant.types.ts";

const WEAPON_PREFIX = "w:";
const SOUL_PREFIX = "s:";

function isWeaponVariant(
    value: string,
): value is Extract<TListableItemReference, { readonly kind: "weapon" }>["variant"] {
    return Object.values(EWeaponVariant).some((variant) => variant === value);
}

export function formatListableItemValue(item: TListableItemReference): string {
    switch (item.kind) {
        case "weapon":
            return `${WEAPON_PREFIX}${item.weaponId}:${item.variant}`;
        case "soul":
            return `${SOUL_PREFIX}${item.discipleId}`;
    }
}

export function parseListableItemValue(value: string): TListableItemReference | null {
    if (value.startsWith(SOUL_PREFIX)) {
        const discipleId = value.slice(SOUL_PREFIX.length);
        return discipleId ? { kind: "soul", discipleId } : null;
    }
    if (!value.startsWith(WEAPON_PREFIX)) {
        return null;
    }
    const [weaponId, variant, ...extra] = value.slice(WEAPON_PREFIX.length).split(":");
    return weaponId && variant && extra.length === 0 && isWeaponVariant(variant)
        ? { kind: "weapon", weaponId, variant }
        : null;
}
