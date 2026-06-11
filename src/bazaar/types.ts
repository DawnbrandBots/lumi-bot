import type { MaybePromise } from "../utils/types.ts";

export type TBazaarWeaponVariant = "ATK" | "NEUTRAL" | "HP";

export interface IUser {
    readonly id: string;
}

export interface IBazaarWeapon {
    readonly id: string;
    readonly name: string;
    readonly level: number;
}

export interface ISaleEntry {
    readonly id: string;
    readonly sellerId: string;
    readonly weaponId: string;
    readonly variant: TBazaarWeaponVariant;
    readonly quantity: number;
    readonly price: number | null;
    readonly createdAt: Date | string;
}

export interface ISaleListing extends ISaleEntry {
    readonly weaponName: string;
}

export const enum EBazaarFeatureReturnKind {
    SALES_LISTED = "SALES_LISTED",
    SALE_CREATED = "SALE_CREATED",
    DUPLICATE_SALE = "DUPLICATE_SALE",
    INVALID_ITEM = "INVALID_ITEM",
    INVALID_QUANTITY = "INVALID_QUANTITY",
    INVALID_PRICE = "INVALID_PRICE",
    INVALID_SUBCOMMAND = "INVALID_SUBCOMMAND",
}

type TBazaarFeatureReturnValueByKind = {
    [EBazaarFeatureReturnKind.SALES_LISTED]: { readonly sales: readonly ISaleListing[] };
    [EBazaarFeatureReturnKind.SALE_CREATED]: { readonly sale: ISaleListing };
} & {
    [_ in
    | EBazaarFeatureReturnKind.DUPLICATE_SALE
    | EBazaarFeatureReturnKind.INVALID_ITEM
    | EBazaarFeatureReturnKind.INVALID_QUANTITY
    | EBazaarFeatureReturnKind.INVALID_PRICE
    | EBazaarFeatureReturnKind.INVALID_SUBCOMMAND]: never;
};

// TODO: there is an opportunity for creating an utility type here since it's the same shape as in LFG types
export type TBazaarFeatureReturnOfKind<Kind extends EBazaarFeatureReturnKind> = Kind extends EBazaarFeatureReturnKind
    ? TBazaarFeatureReturnValueByKind[Kind] extends never
    ? { readonly kind: Kind }
    : { readonly kind: Kind; readonly value: TBazaarFeatureReturnValueByKind[Kind] }
    : never;

export type TBazaarFeatureReturn = {
    [Kind in EBazaarFeatureReturnKind]: TBazaarFeatureReturnOfKind<Kind>;
}[EBazaarFeatureReturnKind];

export type TBazaarFeatureReturnTypes = {
    list: TBazaarFeatureReturnOfKind<EBazaarFeatureReturnKind.SALES_LISTED>;
    sell: TBazaarFeatureReturnOfKind<
        | EBazaarFeatureReturnKind.SALE_CREATED
        | EBazaarFeatureReturnKind.DUPLICATE_SALE
        | EBazaarFeatureReturnKind.INVALID_ITEM
        | EBazaarFeatureReturnKind.INVALID_QUANTITY
        | EBazaarFeatureReturnKind.INVALID_PRICE
    >;
};

export interface IBazaarFeature {
    list(): MaybePromise<TBazaarFeatureReturnTypes["list"]>;
    sell(
        seller: IUser,
        weapon: IBazaarWeapon | null | undefined,
        variant: TBazaarWeaponVariant,
        quantity: number,
        price?: number | null,
    ): MaybePromise<TBazaarFeatureReturnTypes["sell"]>;
}
