import type { TSearchFeatureReturn } from "../../search/types.ts";

export type TResolveSearchInput = (input: string) => Promise<TSearchFeatureReturn>;
