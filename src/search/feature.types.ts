import type { MaybePromise } from "@mikro-orm/core";
import type { TSearchItem } from "./types.ts";

export type TSearchOne = (input: string) => MaybePromise<TSearchItem | null>;
export type TSearch = (arg: { input: string; limit?: number }) => MaybePromise<TSearchItem[]>;
