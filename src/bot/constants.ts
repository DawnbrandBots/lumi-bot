import {
    Colors,
    formatEmoji,
    hyperlink,
    subtext,
    userMention
} from "discord.js";

export const DISCORD_BOT_NAME = "Lumi";

export const DISCORD_NOTABOT_ID = "1454944471358898209";
export const DISCORD_NOTABOT_MENTION = userMention(DISCORD_NOTABOT_ID);
export const DISCORD_KEVIN_LU_ID = "1266919844549234812";

export const DISCORD_BOT_INTRODUCTION = `I am Lumi! I provide commands to look up Fire Emblem Shadows data and organize Friend Battles (soon 🙃).`;
export const DISCORD_BOT_REPOSITORY_LINK = `https://github.com/DawnbrandBots/lumi-bot`;
export const DISCORD_BOT_LICENCE_LINK = `https://github.com/DawnbrandBots/lumi-bot/blob/master/COPYING`;
export const DISCORD_BOT_AUTHORS = [
    {
        name: "NotABot_FES",
        githubUrl: "https://github.com/NotABot-FES",
        discordId: DISCORD_NOTABOT_ID,
    },
    {
        name: "Kevin Lu",
        githubUrl: "https://github.com/kevinlul",
        discordId: DISCORD_KEVIN_LU_ID,
    },
] as const;

export const DISCORD_BOT_ABOUT_ME_DEVELOPMENT = (() => {
    const authors = DISCORD_BOT_AUTHORS.map((author) => `- ${author.name}: ${author.githubUrl}`).join("\n");
    return [
        `Developed on ${DISCORD_BOT_REPOSITORY_LINK}.`,
        `Licence: ${DISCORD_BOT_LICENCE_LINK}`,
        ``,
        `**Authors**`,
        `${authors}`,
    ].join("\n");
})();

export const DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT = (() => {
    const repository = hyperlink("GitHub", DISCORD_BOT_REPOSITORY_LINK);

    const mappedAuthors = DISCORD_BOT_AUTHORS.map(
        (author) => `${userMention(author.discordId)} (${hyperlink("GitHub", author.githubUrl)})`,
    );
    const authors =
        mappedAuthors.length > 1
            ? `${mappedAuthors.slice(0, -1).join(", ")} and ${mappedAuthors.at(-1)!}`
            : mappedAuthors[0];

    const licence = `(${hyperlink("licence", DISCORD_BOT_LICENCE_LINK)})`;

    return `Developed on ${repository} by ${authors}. ${licence}`;
})();

export const DISCORD_BOT_ACTIVITY = `Use /help to see what I can do!`;
export const DISCORD_BOT_ABOUT_ME = `${DISCORD_BOT_INTRODUCTION}

Use \`/help\` to see what I can do!

${DISCORD_BOT_ABOUT_ME_DEVELOPMENT}`;

export const DISCORD_MESSAGE_POSITIVE_COLOR = Colors.Green;
export const DISCORD_MESSAGE_NEUTRAL_COLOR = Colors.DarkGold;
export const DISCORD_MESSAGE_NEGATIVE_COLOR = Colors.Red;
export const DISCORD_MESSAGE_ERROR_COLOR = Colors.DarkRed;

export const DISCORD_RED_SQUARE_EMOJI_ID = "red_square";
export const DISCORD_RED_SQUARE_EMOJI_CALL = `:${DISCORD_RED_SQUARE_EMOJI_ID}:`;
export const DISCORD_BLUE_SQUARE_EMOJI_ID = "blue_square";
export const DISCORD_BLUE_SQUARE_EMOJI_CALL = `:${DISCORD_BLUE_SQUARE_EMOJI_ID}:`;
export const DISCORD_BLACK_SQUARE_EMOJI_ID = "black_large_square";
export const DISCORD_BLACK_SQUARE_EMOJI_CALL = `:${DISCORD_BLACK_SQUARE_EMOJI_ID}:`;
export const DISCORD_SAI_LAUGH_EMOJI_ID = "1474191899781758976";
export const DISCORD_SAI_LAUGH_EMOJI_CALL = formatEmoji(DISCORD_SAI_LAUGH_EMOJI_ID);

export const SEARCH_TERMS_OPTION_NAME = "terms";
/**
 * Somewhat arbitrarily chosen character limit.
 * The point is to prevent giant strings from reaching the search engine.
 * Ensure that this number is longer than the longest search alias loaded into the engine.
 */
export const SEARCH_MAX_INPUT_LENGTH = 48;

export const DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT = subtext(
    `Everyone point and laugh at ${DISCORD_NOTABOT_MENTION}! ${DISCORD_SAI_LAUGH_EMOJI_CALL}`,
);
