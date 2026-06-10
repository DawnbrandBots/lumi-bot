import allCommandInfo from "../loaders/commandInfo.ts";

const commandsStr = allCommandInfo
    .map(
        (info) =>
            `- **${info.name}**: ${info.description}${info.pingEquivalent ? `\n  -# Also try \`${info.pingEquivalent}.` : ""}\``,
    )
    .join("\n");
const description = `### Commands\n${commandsStr}`;

function helpFeature() {
    return description;
}

export default helpFeature;
