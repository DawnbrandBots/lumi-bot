import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import { createNeutralMessage } from "../../../bot/message.ts";
import type { helpCommandCommandRegistrationData } from "../commandRegistrationData/help.ts";
import {
    DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT,
    DISCORD_BOT_INTRODUCTION,
    DISCORD_BOT_NAME,
} from "../constants.ts";
import allCommandRuntimeInfo from "../runtimeInfo.ts";

const commandsStr = allCommandRuntimeInfo
    .map((runtimeInfo) => {
        const pingEquivalent = "pingEquivalent" in runtimeInfo ? runtimeInfo.pingEquivalent : undefined;
        return `- \`/${runtimeInfo.commandRegistrationData.name}\`: ${runtimeInfo.commandRegistrationData.description}${pingEquivalent ? ` (also try \`${pingEquivalent}\`)` : ""}`;
    })
    .join("\n");

const description = `### ${DISCORD_BOT_NAME}
${DISCORD_BOT_INTRODUCTION}

${DISCORD_BOT_DEVELOPMENT_FULL_MARKDOWN_SUPPORT}
### Commands

${commandsStr}`;

export const helpMessage = createNeutralMessage({
    embed: {
        description,
    },
});

export function getHelpCommand() {
    return async function (interaction) {
        await interaction.reply(helpMessage);
    } satisfies TCommandRunHandlers<typeof helpCommandCommandRegistrationData>;
}
