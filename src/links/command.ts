import { Command } from "../bot/command.ts";
import { linksCommandInfo } from "./commandInfo.ts";
import linksFeature from "./feature.ts";
import mapLinksFeatureReturnToMessage from "./mapper.ts";

export function getLinksCommand() {
    return new Command({
        info: linksCommandInfo,
        run: function (interaction) {
            return interaction.reply(mapLinksFeatureReturnToMessage(linksFeature()));
        },
    });
}
