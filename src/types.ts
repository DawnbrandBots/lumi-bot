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
