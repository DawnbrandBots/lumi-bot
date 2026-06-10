import { LINKS_RESPONSE_DESCRIPTION, LINKS_RESPONSE_TITLE } from "./constants.ts";
import type { ILinksFeatureReturn } from "./types.ts";

const response: ILinksFeatureReturn = {
    title: LINKS_RESPONSE_TITLE,
    description: LINKS_RESPONSE_DESCRIPTION,
};

export default function linksFeature(): ILinksFeatureReturn {
    return response;
}
