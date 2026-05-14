import { BOT_NAME } from "../bot/constants.ts";
import { NeutralFeatureResponse } from "../bot/featureResponse.ts";
import type { IFeatureResponse } from "../bot/types.ts";
import allCommandInfo from "../loaders/commandInfo.ts";

const commandsStr = allCommandInfo
    .map(
        (info) =>
            `- **${info.name}**: ${info.description}${info.pingEquivalent ? `\n  -# Also try \`${info.pingEquivalent}.` : ""}\``,
    )
    .join("\n");
const description = `### Commands\n${commandsStr}`;

const response = new NeutralFeatureResponse({
    embed: {
        title: BOT_NAME,
        description,
    },
});

function helpFeature(): IFeatureResponse {
    return response;
}

export default helpFeature;
