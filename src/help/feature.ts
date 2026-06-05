import allCommandInfo from "../loaders/commandInfo.ts";
import { HELP_SHADOWS_RESPONSE_DESCRIPTION } from "./constants.ts";

const commandsStr = allCommandInfo
    .map(
        (info) =>
            `- **${info.name}**: ${info.description}${info.pingEquivalent ? `\n  -# Also try \`${info.pingEquivalent}.` : ""}\``,
    )
    .join("\n");
const description = `### Commands\n${commandsStr}`;

class HelpFeature {
    public get bot() {
        return description;
    }

    public get shadows() {
        return HELP_SHADOWS_RESPONSE_DESCRIPTION;
    }
}

export default HelpFeature;
