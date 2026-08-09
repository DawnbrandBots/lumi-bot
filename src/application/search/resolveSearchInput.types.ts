import type { TSearchFeatureReturn } from "./types.ts";

export type TResolveSearchInput = (input: string) => Promise<TSearchFeatureReturn>;
