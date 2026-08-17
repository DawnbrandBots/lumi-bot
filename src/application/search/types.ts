import type { TId } from "../../domain/game/models/base.types.ts";
import type { TSearchEntity, TSearchIndexEntry, TSearchKind } from "../../domain/search/types.ts";

export const enum ESearchResultKind {
    SUCCESS = "SUCCESS",
    INPUT_TOO_LONG = "INPUT_TOO_LONG",
    NO_RESULT = "NO_RESULT",
    FOUND_BY_ENGINE_BUT_NOT_BY_DB = "FOUND_BY_ENGINE_BUT_NOT_BY_DB",
}

export type TSearchSuccessValue<Kind extends TSearchKind> = {
    readonly kind: Kind;
    readonly entity: TSearchEntity<Kind>;
    readonly searchItem: TSearchIndexEntry<Kind>;
};

export type TSearchSuccess<Kind extends TSearchKind = TSearchKind> = {
    readonly kind: ESearchResultKind.SUCCESS;
    readonly value: TSearchSuccessValue<Kind>;
};

export type TSearchResult<Kind extends TSearchKind = TSearchKind> =
    | TSearchSuccess<Kind>
    | { readonly kind: ESearchResultKind.INPUT_TOO_LONG }
    | { readonly kind: ESearchResultKind.NO_RESULT }
    | {
          readonly kind: ESearchResultKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB;
          readonly value: {
              readonly kind: Kind;
              readonly id: TId;
          };
      };
