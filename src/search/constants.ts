import { subtext } from "discord.js";

export const SEARCH_AUTOCOMPLETE_RESULTS_LIMIT = 5;

export const SEARCH_TERMS_OPTION_NAME = "terms";
/**
 * Somewhat arbitrarily chosen character limit.
 * The point is to prevent giant strings from reaching the search engine.
 * Ensure that this number is longer than the longest search alias loaded into the engine.
 */
export const SEARCH_MAX_INPUT_LENGTH = 48;

export const SEARCH_INVALID_INPUT_TITLE = "Invalid input";
export const SEARCH_INPUT_TOO_LONG_DESCRIPTION = `Input too long. Maximum is ${SEARCH_MAX_INPUT_LENGTH} characters.`;
export const SEARCH_INPUT_TITLE = "Input";
export const SEARCH_YIELDED_NO_RESULT_DESCRIPTION = "Search yielded no result";
export const SEARCH_MISSING_DATABASE_RESULT_TITLE = "Result found in search engine but not in database";
export const SEARCH_ENTITY_KIND_FIELD_NAME = "Entity kind";
export const SEARCH_ID_FIELD_NAME = "Id";
export const SEARCH_ALIASES_FOOTER_PREFIX = "Search aliases:";

export const SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA = subtext("No known source media for this song :(");
