export interface IColor {
    readonly kind: "color";
    readonly id: string;
    readonly name: string;
}

export interface IWeaponType {
    readonly kind: "weaponType";
    readonly id: string;
    readonly name: string;
    readonly color: IColor;
    readonly range: number;
}

export interface IWeapon {
    readonly kind: "weapon";
    readonly id: string;
    readonly name: string;
    readonly type: IWeaponType;
    readonly level: number;
}

export interface IMovement {
    readonly kind: "movement";
    readonly id: string;
    readonly name: string;
    readonly distance: number;
}

export interface IDisciple {
    readonly kind: "disciple";
    readonly id: string;
    readonly name: string;
    readonly movement: IMovement;
    readonly weapon: IWeaponType;
    readonly prf: IWeapon;
}
