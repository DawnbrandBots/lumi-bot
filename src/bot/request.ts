import helpFeature from "../help/feature.ts";
import mapHelpFeatureReturnToMessage from "../help/mapper.ts";
import type createSearchFeature from "../search/feature.ts";
import mapSearchFeatureReturnToMessage from "../search/mapper.ts";
import type { ISearchableEntity, ISearchHandlers } from "../search/types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "./constants.ts";
import type { IInteractionHandlerReturnType } from "./types.ts";

export const enum EBotRequestKind {
    HELP = "HELP",
    SEARCH = "SEARCH",
}

export interface IHelpBotRequest {
    kind: EBotRequestKind.HELP;
}

export interface ISearchBotRequest {
    kind: EBotRequestKind.SEARCH;
    input: string;
}

export type TBotRequest = IHelpBotRequest | ISearchBotRequest;

export interface IbotRequestHandlerConfig<Items extends ISearchableEntity> {
    searchFeature: ReturnType<typeof createSearchFeature<Items>>;
    handlers: ISearchHandlers<Items>;
}

export function createBotRequestHandler<Items extends ISearchableEntity>({
    searchFeature,
    handlers,
}: IbotRequestHandlerConfig<Items>) {
    return async function handleBotRequest(request: TBotRequest): Promise<IInteractionHandlerReturnType> {
        switch (request.kind) {
            case EBotRequestKind.HELP:
                return mapHelpFeatureReturnToMessage(helpFeature());
            case EBotRequestKind.SEARCH: {
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
