import { Colors, formatEmoji, userMention } from "discord.js";

export const DISCORD_BOT_NAME = "Lumi";

export const DISCORD_NOTABOT_ID = "1454944471358898209";
export const DISCORD_NOTABOT_MENTION = userMention(DISCORD_NOTABOT_ID);
export const DISCORD_BOT_ACTIVITY = `Use /help to see what I can do!`;

export const DISCORD_MESSAGE_SUCCESS_COLOR = Colors.Green;
export const DISCORD_MESSAGE_ERROR_COLOR = Colors.Red;
export const DISCORD_MESSAGE_NEUTRAL_COLOR = Colors.DarkGold;

export const DISCORD_RED_SQUARE_EMOJI_ID = "red_square";
export const DISCORD_RED_SQUARE_EMOJI_CALL = `:${DISCORD_RED_SQUARE_EMOJI_ID}:`;
export const DISCORD_BLUE_SQUARE_EMOJI_ID = "blue_square";
export const DISCORD_BLUE_SQUARE_EMOJI_CALL = `:${DISCORD_BLUE_SQUARE_EMOJI_ID}:`;
export const DISCORD_BLACK_SQUARE_EMOJI_ID = "black_large_square";
export const DISCORD_BLACK_SQUARE_EMOJI_CALL = `:${DISCORD_BLACK_SQUARE_EMOJI_ID}:`;
export const DISCORD_SAI_LAUGH_EMOJI_ID = "1474191899781758976";
export const DISCORD_SAI_LAUGH_EMOJI_CALL = formatEmoji(DISCORD_SAI_LAUGH_EMOJI_ID);

export const SEARCH_TERMS_OPTION_NAME = "terms";
export const SEARCH_MAX_INPUT_LENGTH = 32;
