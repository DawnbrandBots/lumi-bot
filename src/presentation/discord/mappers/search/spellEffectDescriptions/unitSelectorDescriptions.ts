import type { IMovementType } from "../../../../../domain/game/models/movement.types.ts";
import { type IUnit } from "../../../../../domain/game/models/unit.types.ts";
import { EUnitSelectorProperty } from "../../../../../domain/game/models/unitSelector.types.ts";
import type { IWeaponType } from "../../../../../domain/game/models/weaponType.types.ts";

type TUnitSelectorDescriptionValueByProperty = {
    [EUnitSelectorProperty.KIND]: IUnit["kind"];
    [EUnitSelectorProperty.ROLE]: IUnit["role"];
    [EUnitSelectorProperty.MOVEMENT_TYPE]: Pick<IMovementType, "name">;
    [EUnitSelectorProperty.WEAPON_TYPE]: Pick<IWeaponType, "name">;
    [EUnitSelectorProperty.WEAPON_RANGE]: IUnit["weaponType"]["range"];
};

export type TUnitSelectorDescriptionInput = {
    [Property in keyof TUnitSelectorDescriptionValueByProperty]: {
        readonly property: Property;
        readonly value: TUnitSelectorDescriptionValueByProperty[Property];
    };
}[keyof TUnitSelectorDescriptionValueByProperty];

const unitKindStrs = {
    DISCIPLE: "disciples",
    MINION: "minions",
} as const;

const unitRoleStrs = {
    LIGHT: "Light units",
    SHADOW: "Shadow units",
} as const;

export function describeUnitSelector(selector: TUnitSelectorDescriptionInput): string {
    switch (selector.property) {
        case EUnitSelectorProperty.KIND:
            return unitKindStrs[selector.value];
        case EUnitSelectorProperty.ROLE:
            return unitRoleStrs[selector.value];
        case EUnitSelectorProperty.MOVEMENT_TYPE:
        case EUnitSelectorProperty.WEAPON_TYPE:
            return `${selector.value.name} units`;
        case EUnitSelectorProperty.WEAPON_RANGE:
            return `units with a range of ${selector.value}`;
    }
}
