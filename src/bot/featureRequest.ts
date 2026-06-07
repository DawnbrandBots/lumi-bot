import helpFeature from "../help/feature.ts";
import mapHelpFeatureReturnToMessage from "../help/mapper.ts";
import type createSearchFeature from "../search/feature.ts";
import mapSearchFeatureReturnToMessage from "../search/mapper.ts";
import type { ISearchableEntity, ISearchHandlers } from "../search/types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./constants.ts";
import type { IInteractionHandlerReturnType } from "./types.ts";

export const enum EBotFeatureRequestKind {
    HELP = "HELP",
    SEARCH = "SEARCH",
}

export interface IHelpFeatureRequest {
    kind: EBotFeatureRequestKind.HELP;
}

export interface ISearchFeatureRequest {
    kind: EBotFeatureRequestKind.SEARCH;
    input: string;
}

export type TBotRequest = IHelpFeatureRequest | ISearchFeatureRequest;

export interface IBotFeatureRequestHandlerConfig<Items extends ISearchableEntity> {
    searchFeature: ReturnType<typeof createSearchFeature<Items>>;
    handlers: ISearchHandlers<Items>;
}

export function createBotFeatureRequestHandler<Items extends ISearchableEntity>({
    searchFeature,
    handlers,
}: IBotFeatureRequestHandlerConfig<Items>) {
    return async function handleBotFeatureRequest(request: TBotRequest): Promise<IInteractionHandlerReturnType> {
        switch (request.kind) {
            case EBotFeatureRequestKind.HELP:
                return mapHelpFeatureReturnToMessage(helpFeature());
            case EBotFeatureRequestKind.SEARCH: {
                const result = await searchFeature(request.input);
                return mapSearchFeatureReturnToMessage<Items>(result, handlers);
            }
        }
    };
}

export function getRequiredSearchInput(input: string | null) {
    if (!input) {
        throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
    }
    return input;
}
