import type { TCommandHandlers } from "../bot/types.ts";
import type { linksCommandData } from "./commandInfo.ts";
import linksFeature from "./feature.ts";
import mapLinksFeatureReturnToMessage from "./mapper.ts";

export function getLinksCommand() {
    return {
        run: function (interaction) {
            return interaction.reply(mapLinksFeatureReturnToMessage(linksFeature()));
        },
    } satisfies TCommandHandlers<typeof linksCommandData>;
}
