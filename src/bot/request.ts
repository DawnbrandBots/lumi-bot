import helpFeature from "../help/feature.ts";
import mapHelpFeatureReturnToMessage from "../help/mapper.ts";
import type createSearchFeature from "../search/feature.ts";
import mapSearchFeatureReturnToMessage from "../search/mapper.ts";
import type { ISearchableEntity, ISearchHandlers } from "../search/types.ts";
import type { MaybePromise } from "../utils/types.ts";
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

export type TBotRequestHandler<Request extends TBotRequest = TBotRequest> = (
    request: Request,
) => MaybePromise<IInteractionHandlerReturnType>;

export type TBotRequestHandlers = {
    [Kind in TBotRequest["kind"]]: TBotRequestHandler<TBotRequest & { kind: Kind }>;
};

export interface IBotRequestHandlerConfig<Items extends ISearchableEntity> {
    searchFeature: ReturnType<typeof createSearchFeature<Items>>;
    handlers: ISearchHandlers<Items>;
}

export const botRequestHandlerGetters = {
    [EBotRequestKind.HELP]: (): TBotRequestHandler<IHelpBotRequest> => () =>
        mapHelpFeatureReturnToMessage(helpFeature()),
    [EBotRequestKind.SEARCH]: <Items extends ISearchableEntity>({
        searchFeature,
        handlers,
    }: IBotRequestHandlerConfig<Items>): TBotRequestHandler<ISearchBotRequest> =>
        async function handleSearchBotRequest(request) {
            const result = await searchFeature(request.input);
            return mapSearchFeatureReturnToMessage<Items>(result, handlers);
        },
};

export function getBotRequestHandlerGetter<Kind extends EBotRequestKind>(kind: Kind) {
    return botRequestHandlerGetters[kind];
}

export function createBotRequestHandler(handlers: TBotRequestHandlers) {
    return async function handleBotRequest(request: TBotRequest): Promise<IInteractionHandlerReturnType> {
        const handler = handlers[request.kind] as TBotRequestHandler<typeof request>;
        return handler(request);
    };
}

export function getRequiredSearchInput(input: string | null) {
    if (!input) {
        throw new Error(`No value provided for "${SEARCH_TERMS_OPTION_NAME}" option.`);
    }
    return input;
}
