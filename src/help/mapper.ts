import { createNeutralMessage } from "../bot/message.ts";

function mapHelpFeatureReturnToMessage(description: string) {
    return createNeutralMessage({
        embed: {
            description,
        },
    });
}

export default mapHelpFeatureReturnToMessage;
