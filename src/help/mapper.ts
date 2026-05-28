import { BOT_NAME } from "../bot/constants.ts";
import { NeutralFeatureResponse } from "../bot/featureResponse.ts";
import type { IFeatureResponse } from "../bot/types.ts";
import type helpFeature from "./feature.ts";

function mapHelpFeatureReturnToResponse(description: ReturnType<typeof helpFeature>): IFeatureResponse {
    return new NeutralFeatureResponse({
        embed: {
            title: BOT_NAME,
            description,
        },
    });
}

export default mapHelpFeatureReturnToResponse;
