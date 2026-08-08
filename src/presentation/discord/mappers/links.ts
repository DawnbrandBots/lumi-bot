import { createNeutralMessage } from "../../../bot/message.ts";
import type { ILinksFeatureReturn } from "../../../links/types.ts";

export default function mapLinksFeatureReturnToMessage(result: ILinksFeatureReturn) {
    return createNeutralMessage({
        embed: result,
    });
}
