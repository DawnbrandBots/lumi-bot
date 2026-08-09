import type { MaybePromise } from "@mikro-orm/core";
import type { TSearchEntity, TSearchKind } from "../domain/search/types.ts";

export type TGetEntityByKindAndId = <Kind extends TSearchKind>(arg: {
    kind: Kind;
    id: string;
}) => MaybePromise<TSearchEntity<Kind> | null>;
