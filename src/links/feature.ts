import { LINKS_RESPONSE_DESCRIPTION } from "./constants.ts";
import type { ILinksFeatureReturn } from "./types.ts";

const response: ILinksFeatureReturn = {
    description: LINKS_RESPONSE_DESCRIPTION,
};

export default function linksFeature(): ILinksFeatureReturn {
    return response;
}
