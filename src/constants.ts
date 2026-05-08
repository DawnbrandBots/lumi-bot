import { Colors } from "discord.js";

export const DISCIPLE_BASE_HP = 80
export const DISCIPLE_BASE_ATK = 36
export const DISCIPLE_MINIMUM_RELEVANT_LEVEL = 8;
export const DISCIPLE_MAXIXUM_LEVEL = 11;

export const WEAPON_MINIMUM_RELEVANT_LEVEL = 6;
export const WEAPON_VARIANTS_BONUSES = {
    "HP": { hp: 10, atk: 0 },
    "NEUTRAL": { hp: 5, atk: 10 },
    "ATK": { hp: 0, atk: 20 },
} as const

export const NOTABOT_DISCORD_ID = "1454944471358898209"
export const NOTABOT_DISCORD_MENTION = `<@${NOTABOT_DISCORD_ID}>`

export const DISCORD_MESSAGE_SUCCESS_COLOR = Colors.Green
export const DISCORD_MESSAGE_ERROR_COLOR = Colors.Red

export const DISCORD_RED_SQUARE_EMOJI_ID = "red_square"
export const DISCORD_RED_SQUARE_EMOJI_CALL = `:${DISCORD_RED_SQUARE_EMOJI_ID}:`
export const DISCORD_BLUE_SQUARE_EMOJI_ID = "blue_square"
export const DISCORD_BLUE_SQUARE_EMOJI_CALL = `:${DISCORD_BLUE_SQUARE_EMOJI_ID}:`
export const DISCORD_BLACK_SQUARE_EMOJI_ID = "black_large_square"
export const DISCORD_BLACK_SQUARE_EMOJI_CALL = `:${DISCORD_BLACK_SQUARE_EMOJI_ID}:`