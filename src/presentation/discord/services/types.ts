import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, CacheType } from "discord.js";
import type { Paths, PickDeep } from "type-fest";
import type { TApplicationUseCases } from "../../../application/useCases.types.ts";
import type { MaybePromise } from "../../../utils/types.ts";

// TODO: gotta check/enforce structure of type only files

type TServiceDependencies = {
    readonly useCases: TApplicationUseCases;
};

type TService = (
    dependencies: TServiceDependencies,
    interaction: AutocompleteInteraction<CacheType>,
) => MaybePromise<ApplicationCommandOptionChoiceData[]>;

export type TServices = {
    readonly autocompleteRoomCode: TService;
    readonly autocompleteSearchTerms: TService;
};

export type TServiceBase<Name extends keyof TServices, DependencyPaths extends Paths<TServiceDependencies>> = (
    dependencies: PickDeep<TServiceDependencies, DependencyPaths>,
    interaction: Parameters<TServices[Name]>[1],
) => ReturnType<TServices[Name]>;
