import type { Paths, PickDeep } from "type-fest";
import type { IWeaponListableItem } from "../../domain/bazaar/models/listableItem.types.ts";
import type { IListing } from "../../domain/bazaar/models/listing.types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TBazaarQueries } from "./queries.types.ts";
import type { TBazaarRepository } from "./repositories.types.ts";
import type { TBazaarUseCaseArgs, TBazaarUseCases } from "./useCases.types.ts";

export type TListableItemReference =
    | {
          readonly kind: "weapon";
          readonly weaponId: string;
          readonly variant: IWeaponListableItem["variant"];
      }
    | {
          readonly kind: "soul";
          readonly discipleId: string;
      };

export const enum EBazaarResultKind {
    LISTING_CREATED = "LISTING_CREATED",
    LISTING_UPDATED = "LISTING_UPDATED",
    LISTING_UNCHANGED = "LISTING_UNCHANGED",
    LISTING_DELETED = "LISTING_DELETED",
    LISTING_NOT_FOUND = "LISTING_NOT_FOUND",
    LISTINGS_LISTED = "LISTINGS_LISTED",
    INVALID_ITEM = "INVALID_ITEM",
    INVALID_QUANTITY = "INVALID_QUANTITY",
    INVALID_PRICE = "INVALID_PRICE",
}

type TBazaarResultValueByKind = {
    [EBazaarResultKind.LISTING_CREATED]: { readonly listing: IListing };
    [EBazaarResultKind.LISTING_UPDATED]: { readonly listing: IListing };
    [EBazaarResultKind.LISTING_UNCHANGED]: { readonly listing: IListing };
    [EBazaarResultKind.LISTING_DELETED]: { readonly listing: IListing };
    [EBazaarResultKind.LISTINGS_LISTED]: { readonly listings: readonly IListing[] };
} & {
    [
        _ in
            | EBazaarResultKind.LISTING_NOT_FOUND
            | EBazaarResultKind.INVALID_ITEM
            | EBazaarResultKind.INVALID_QUANTITY
            | EBazaarResultKind.INVALID_PRICE
    ]: never;
};

export type TBazaarResultOfKind<Kind extends EBazaarResultKind> = Kind extends EBazaarResultKind
    ? TBazaarResultValueByKind[Kind] extends never
        ? { readonly kind: Kind }
        : { readonly kind: Kind; readonly value: TBazaarResultValueByKind[Kind] }
    : never;

export type TBazaarResult = {
    [Kind in EBazaarResultKind]: TBazaarResultOfKind<Kind>;
}[EBazaarResultKind];

export type TBazaarResultTypes = {
    readonly upsertListing: TBazaarResultOfKind<
        | EBazaarResultKind.LISTING_CREATED
        | EBazaarResultKind.LISTING_UPDATED
        | EBazaarResultKind.LISTING_UNCHANGED
        | EBazaarResultKind.INVALID_ITEM
        | EBazaarResultKind.INVALID_QUANTITY
        | EBazaarResultKind.INVALID_PRICE
    >;
    readonly deleteListing: TBazaarResultOfKind<
        EBazaarResultKind.LISTING_DELETED | EBazaarResultKind.LISTING_NOT_FOUND
    >;
    readonly listListings: TBazaarResultOfKind<EBazaarResultKind.LISTINGS_LISTED>;
};

export type TBazaarDependencies = {
    readonly queries: { readonly bazaar: TBazaarQueries };
    readonly repositories: { readonly bazaar: TBazaarRepository };
};

export type TBazaarUseCase<Arg, Return> = (dependencies: TBazaarDependencies, arg: Arg) => MaybePromise<Return>;

export type TBazaarUseCaseBase<
    Name extends keyof TBazaarUseCases,
    DependencyPaths extends Paths<TBazaarDependencies>,
> = (
    dependencies: PickDeep<TBazaarDependencies, DependencyPaths>,
    arg: TBazaarUseCaseArgs[Name],
) => ReturnType<TBazaarUseCases[Name]>;
