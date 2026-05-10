import { APIEmbed } from "discord.js";
import allCommandInfo from "../commandInfo/all.ts";
import { BOT_NAME, DISCORD_MESSAGE_NEUTRAL_COLOR } from "../models/discord/constants.ts";

const commandsStr = allCommandInfo.map((info) => `- **${info.name}**: ${info.description}`).join("\n");
const description = `### Commands\n${commandsStr}`;

function helpFeature(): APIEmbed {
    return {
        title: BOT_NAME,
        color: DISCORD_MESSAGE_NEUTRAL_COLOR,
        description,
    };
}

export default helpFeature;
