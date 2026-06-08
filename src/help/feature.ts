import { DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT, DISCORD_BOT_INTRODUCTION } from "../bot/constants.ts";
import { NeutralFeatureResponse } from "../bot/featureResponse.ts";
import type { IFeatureResponse } from "../bot/types.ts";
import allCommandInfo from "../loaders/commandInfo.ts";

const commandsStr = allCommandInfo
    .map(
        (info) =>
            `- **${info.name}**: ${info.description}${info.pingEquivalent ? `\n  -# Also try \`${info.pingEquivalent}.` : ""}`,
    )
    .join("\n");

const description = `### Lumi
${DISCORD_BOT_INTRODUCTION}

${DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT}
### Commands

${commandsStr}`;

const response = new NeutralFeatureResponse({
    embed: {
        description,
    },
});

function helpFeature(): IFeatureResponse {
    return response;
}

export default helpFeature;
