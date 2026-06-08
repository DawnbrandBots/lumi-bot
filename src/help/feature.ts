import { DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT, DISCORD_BOT_INTRODUCTION } from "../bot/constants.ts";
import allCommandInfo from "../loaders/commandInfo.ts";

const commandsStr = allCommandInfo
    .map(
        (info) =>
            `- \`/${info.name}\`: ${info.description}${info.pingEquivalent ? ` (also try \`${info.pingEquivalent}\`)` : ""}`,
    )
    .join("\n");

const description = `### Lumi
${DISCORD_BOT_INTRODUCTION}

${DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT}
### Commands

${commandsStr}`;

function helpFeature() {
    return description;
}

export default helpFeature;
