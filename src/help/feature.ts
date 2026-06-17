import {
    DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT,
    DISCORD_BOT_INTRODUCTION,
    DISCORD_BOT_NAME,
    DISCORD_KURTSUS_EMOJI_CALL,
} from "../bot/constants.ts";
import allCommandInfo from "../loaders/commandInfo.ts";

const commandsStr = allCommandInfo
    .map(
        (info) =>
            `- \`/${info.name}\`: ${info.description}${info.pingEquivalent ? ` (also try \`${info.pingEquivalent}\`)` : ""}`,
    )
    .join("\n");

const description = `### ${DISCORD_BOT_NAME}
${DISCORD_BOT_INTRODUCTION}

I grant you all access to features that Lumi does not have yet, but they may change or break at any time without notice. Not my problem though. ${DISCORD_KURTSUS_EMOJI_CALL}

${DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT}
### Commands

${commandsStr}`;

function helpFeature() {
    return description;
}

export default helpFeature;
