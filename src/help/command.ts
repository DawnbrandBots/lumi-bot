import type { TCommandHandlers } from "../bot/commands/types.ts";
import type { helpCommandApiInfo } from "./commandInfo.ts";
import helpFeature from "./feature.ts";
import mapHelpFeatureReturnToMessage from "./mapper.ts";

export function getHelpCommand() {
    return {
        run: async function (interaction) {
            await interaction.reply(mapHelpFeatureReturnToMessage(helpFeature()));
        },
    } satisfies TCommandHandlers<typeof helpCommandApiInfo>;
}
