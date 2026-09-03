import type { AutocompleteInteraction, CacheType } from "discord.js";

export type TAutocompleteInteraction = AutocompleteInteraction<CacheType>;
export type THandleAutocompleteInteraction = (interaction: TAutocompleteInteraction) => Promise<void>;
