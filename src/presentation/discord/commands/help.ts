import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import helpFeature from "../../../help/feature.ts";
import mapHelpFeatureReturnToMessage from "../../../help/mapper.ts";
import type { helpCommandCommandRegistrationData } from "../commandRegistrationData/help.ts";

export function getHelpCommand() {
    return async function (interaction) {
        await interaction.reply(mapHelpFeatureReturnToMessage(helpFeature()));
    } satisfies TCommandRunHandlers<typeof helpCommandCommandRegistrationData>;
}
