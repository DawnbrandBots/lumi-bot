import {
    DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT,
    DISCORD_BOT_INTRODUCTION,
    DISCORD_BOT_NAME,
} from "../bot/constants.ts";
import allCommandRuntimeInfo from "../loaders/commandRuntimeInfo.ts";

const commandsStr = allCommandRuntimeInfo
    .map((runtimeInfo) => {
        const pingEquivalent = "pingEquivalent" in runtimeInfo ? runtimeInfo.pingEquivalent : undefined;
        return `- \`/${runtimeInfo.apiInfo.name}\`: ${runtimeInfo.apiInfo.description}${pingEquivalent ? ` (also try \`${pingEquivalent}\`)` : ""}`;
    })
    .join("\n");

const description = `### ${DISCORD_BOT_NAME}
${DISCORD_BOT_INTRODUCTION}

${DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT}
### Commands

${commandsStr}`;

function helpFeature() {
    return description;
}

export default helpFeature;
