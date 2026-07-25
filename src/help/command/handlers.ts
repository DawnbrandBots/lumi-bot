import type { TCommandHandlers } from "../../bot/commands/types.ts";
import helpFeature from "../feature.ts";
import mapHelpFeatureReturnToMessage from "../mapper.ts";
import type { helpCommandApiInfo } from "./apiInfo.ts";

export function getHelpCommand() {
    return {
        run: async function (interaction) {
            await interaction.reply(mapHelpFeatureReturnToMessage(helpFeature()));
        },
    } satisfies TCommandHandlers<typeof helpCommandApiInfo>;
}
