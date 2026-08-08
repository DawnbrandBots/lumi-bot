import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import linksFeature from "../../../links/feature.ts";
import mapLinksFeatureReturnToMessage from "../../../links/mapper.ts";
import type { linksCommandCommandRegistrationData } from "../commandRegistrationData/links.ts";

export function getLinksCommand() {
    return async function (interaction) {
        await interaction.reply(mapLinksFeatureReturnToMessage(linksFeature()));
    } satisfies TCommandRunHandlers<typeof linksCommandCommandRegistrationData>;
}
