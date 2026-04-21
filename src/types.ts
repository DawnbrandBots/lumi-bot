export interface IColor {
    readonly id: string;
    readonly name: string;
}

export interface IWeaponType {
    readonly id: string;
    readonly name: string;
    readonly color: IColor;
    readonly range: number;
}

export interface IWeapon {
    readonly id: string;
    readonly name: string;
    readonly type: IWeaponType;
    readonly level: number;
}
