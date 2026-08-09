import type { TId } from "../../domain/game/models/base.types.ts";
import type { TSearchEntity, TSearchIndexEntry, TSearchKind } from "../../domain/search/types.ts";

export const enum ESearchFeatureReturnKind {
    SUCCESS = "SUCCESS",
    INPUT_TOO_LONG = "INPUT_TOO_LONG",
    NO_RESULT = "NO_RESULT",
    FOUND_BY_ENGINE_BUT_NOT_BY_DB = "FOUND_BY_ENGINE_BUT_NOT_BY_DB",
}

export type TSearchFeatureSuccessValue<Kind extends TSearchKind> = {
    readonly kind: Kind;
    readonly entity: TSearchEntity<Kind>;
    readonly searchItem: TSearchIndexEntry<Kind>;
};

export type TSearchFeatureSuccess<Kind extends TSearchKind = TSearchKind> = {
    readonly kind: ESearchFeatureReturnKind.SUCCESS;
    readonly value: TSearchFeatureSuccessValue<Kind>;
};

export type TSearchFeatureReturn<Kind extends TSearchKind = TSearchKind> =
    | TSearchFeatureSuccess<Kind>
    | { readonly kind: ESearchFeatureReturnKind.INPUT_TOO_LONG }
    | { readonly kind: ESearchFeatureReturnKind.NO_RESULT }
    | {
          readonly kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB;
          readonly value: {
              readonly kind: Kind;
              readonly id: TId;
          };
      };
