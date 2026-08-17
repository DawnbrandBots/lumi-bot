import type { TSearchResult } from "./types.ts";

export type TResolveSearchInput = (input: string) => Promise<TSearchResult>;
