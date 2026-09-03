import { heading, inlineCode, unorderedList } from "discord.js";
import type { TCommandRunHandler } from "../commands/types.ts";
import {
    DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT,
    DISCORD_BOT_INTRODUCTION,
    DISCORD_BOT_NAME,
} from "../constants.ts";
import { createNeutralMessage } from "../message.ts";
import allCommandRuntimeInfo from "../runtimeInfo.ts";

const commandsStr = unorderedList(
    allCommandRuntimeInfo.map((runtimeInfo) => {
        const pingEquivalent = "pingEquivalent" in runtimeInfo ? runtimeInfo.pingEquivalent : undefined;
        return `${inlineCode(`/${runtimeInfo.commandRegistrationData.name}`)}: ${runtimeInfo.commandRegistrationData.description}${pingEquivalent ? ` (also try ${inlineCode(pingEquivalent)})` : ""}`;
    }),
);

const description = [
    heading(DISCORD_BOT_NAME, 3),
    DISCORD_BOT_INTRODUCTION,
    "",
    DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT,
    heading("Commands", 3),
    commandsStr,
].join("\n");

export const helpMessage = createNeutralMessage({
    embed: {
        description,
    },
});

export const help: TCommandRunHandler = async function (_dependencies, interaction) {
    await interaction.reply(helpMessage);
};
