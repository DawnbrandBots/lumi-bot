import type { TCommandHandlers } from "../bot/types.ts";
import type { helpCommandData } from "./commandInfo.ts";
import helpFeature from "./feature.ts";
import mapHelpFeatureReturnToMessage from "./mapper.ts";

export function getHelpCommand() {
    return {
        run: async function (interaction) {
            await interaction.reply(mapHelpFeatureReturnToMessage(helpFeature()));
        },
    } satisfies TCommandHandlers<typeof helpCommandData>;
}
