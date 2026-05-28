import { BOT_NAME } from "../bot/constants.ts";
import { neutralFeatureResponse } from "../bot/featureResponse.ts";
import type helpFeature from "./feature.ts";

function mapHelpFeatureReturnToResponse(description: ReturnType<typeof helpFeature>) {
    return neutralFeatureResponse({
        embed: {
            title: BOT_NAME,
            description,
        },
    });
}

export default mapHelpFeatureReturnToResponse;
