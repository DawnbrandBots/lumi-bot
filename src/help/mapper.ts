import { BOT_NAME } from "../bot/constants.ts";
import { neutralMessage } from "../bot/message.ts";
import type helpFeature from "./feature.ts";

function mapHelpFeatureReturnToMessage(description: ReturnType<typeof helpFeature>) {
    return neutralMessage({
        embed: {
            title: BOT_NAME,
            description,
        },
    });
}

export default mapHelpFeatureReturnToMessage;
