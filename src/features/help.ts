import allCommandInfo from "../commandInfo/all.ts";
import { BOT_NAME } from "../models/discord/constants.ts";
import type { IFeatureResponse } from "./featureResponse.ts";
import { NeutralFeatureResponse } from "./featureResponse.ts";

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
