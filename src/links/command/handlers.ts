import type { TCommandHandlers } from "../../bot/commands/types.ts";
import linksFeature from "../feature.ts";
import mapLinksFeatureReturnToMessage from "../mapper.ts";
import type { linksCommandApiInfo } from "./apiInfo.ts";

export function getLinksCommand() {
    return {
        run: async function (interaction) {
            await interaction.reply(mapLinksFeatureReturnToMessage(linksFeature()));
        },
    } satisfies TCommandHandlers<typeof linksCommandApiInfo>;
}
