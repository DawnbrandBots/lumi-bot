import type { IUnit } from "./unit.types.ts";

export const EUnitSelectorProperty = {
    KIND: "kind",
    ROLE: "role",
    MOVEMENT_TYPE: "movementType",
    WEAPON_TYPE: "weaponType",
    WEAPON_RANGE: "weaponType.range",
} as const;

type TUnitSelectorValueByProperty = {
    [EUnitSelectorProperty.KIND]: IUnit["kind"];
    [EUnitSelectorProperty.ROLE]: IUnit["role"];
    [EUnitSelectorProperty.MOVEMENT_TYPE]: IUnit["movementType"];
    [EUnitSelectorProperty.WEAPON_TYPE]: IUnit["weaponType"];
    [EUnitSelectorProperty.WEAPON_RANGE]: IUnit["weaponType"]["range"];
};

/** Selects units whose property equals the expected value. */
export type TUnitSelector = {
    [Property in keyof TUnitSelectorValueByProperty]: {
        readonly property: Property;
        readonly value: TUnitSelectorValueByProperty[Property];
    };
}[keyof TUnitSelectorValueByProperty];
