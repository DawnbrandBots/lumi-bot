import { createNeutralMessage } from "../../../bot/message.ts";
import type helpFeature from "../../../help/feature.ts";

function mapHelpFeatureReturnToMessage(description: ReturnType<typeof helpFeature>) {
    return createNeutralMessage({
        embed: {
            description,
        },
    });
}

export default mapHelpFeatureReturnToMessage;
