/**
 * @file
 * Disclaimer: Codex generated most of this file.
 * See ./types.test.ts to understand how.
 * Most importantly: see {@link TCommandHandlers}'s comment.
 */

import type {
    APIApplicationCommandOption,
    ApplicationCommandOptionChoiceData,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    CacheType,
    ChatInputCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import type { TApplicationUseCases } from "../../../application/useCases.types.ts";
import type { MaybePromise, ThisGuardType } from "../../../utils/types.ts";

export type TGuildCommandInteraction = ThisGuardType<ChatInputCommandInteraction["inGuild"]>;

export type TCommandArgs = {
    readonly useCases: TApplicationUseCases;
};

export type TCommandDependencies = TCommandArgs;

export type TCommandRunHandler = (
    dependencies: TCommandDependencies,
    interaction: ChatInputCommandInteraction<CacheType>,
) => MaybePromise<void>;

export type TBuiltCommandRunHandler = (interaction: ChatInputCommandInteraction<CacheType>) => MaybePromise<void>;
/**
 * Executes a Discord chat-input command, replies to its interaction and may run other Discrod-related actions like sending additional messages.
 */
/**
 * Produces choices for an option focused by a Discord autocomplete interaction.
 */
export type TCommandAutocompleteHandler<Dependencies = never> = (
    dependencies: Dependencies,
    interaction: AutocompleteInteraction<CacheType>,
) => MaybePromise<ApplicationCommandOptionChoiceData[]>;

export type TBuiltCommandAutocompleteHandler = (
    interaction: AutocompleteInteraction<CacheType>,
) => MaybePromise<ApplicationCommandOptionChoiceData[]>;

/**
 * The Discord API representation of a chat-input command.
 *
 * Concrete command registration data should use `as const satisfies {@link ICommandCommandRegistrationData}` so command,
 * subcommand and option names remain available as literal types.
 */
export type ICommandCommandRegistrationData = RESTPostAPIChatInputApplicationCommandsJSONBody;

/**
 * Combines a Discord command registration data with application-only help metadata.
 */
export type ICommandRuntimeInfo<CommandRegistrationData extends ICommandCommandRegistrationData> = {
    readonly commandRegistrationData: CommandRegistrationData;
    readonly pingEquivalent?: string;
};

/**
 * Extracts the options declared directly on command registration data, a subcommand or a subcommand group.
 */
type TOptionsOf<Parent> = Parent extends {
    readonly options: infer Options extends readonly APIApplicationCommandOption[];
}
    ? Options
    : readonly [];

/**
 * Extracts the subcommands and subcommand groups from an options tuple.
 */
type TSubcommandRoute<Options extends readonly APIApplicationCommandOption[]> = Extract<
    Options[number],
    {
        readonly type: ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup;
    }
>;

/**
 * Extracts the options that explicitly enable Discord autocomplete.
 */
type TAutocompletableOption<Options extends readonly APIApplicationCommandOption[]> = Extract<
    Options[number],
    { readonly autocomplete: true }
>;

/**
 * Derives either one root run handler or a nested map of handlers for every subcommand route.
 */
type TRunHandlersForOptions<Options extends readonly APIApplicationCommandOption[]> = [
    TSubcommandRoute<Options>,
] extends [never]
    ? TCommandRunHandler
    : {
          readonly [Option in TSubcommandRoute<Options> as Option["name"]]: Option extends {
              readonly type: ApplicationCommandOptionType.SubcommandGroup;
          }
              ? TRunHandlersForOptions<TOptionsOf<Option>>
              : TCommandRunHandler;
      };

/**
 * Maps each directly declared autocomplete option name to its handler.
 */
type TAutocompleteHandler = (...args: never[]) => unknown;

type TBasicAutocompleteHandlers<
    Options extends readonly APIApplicationCommandOption[],
    Handler extends TAutocompleteHandler,
> = {
    readonly [Option in TAutocompletableOption<Options> as Option["name"]]: Handler;
};

/**
 * Derives autocomplete handlers beneath one subcommand or subcommand group.
 */
type TAutocompleteHandlersForSubcommandRoute<
    Option extends TSubcommandRoute<readonly APIApplicationCommandOption[]>,
    Handler extends TAutocompleteHandler,
> = Option extends {
    readonly type: ApplicationCommandOptionType.SubcommandGroup;
}
    ? TSubcommandAutocompleteHandlers<TOptionsOf<Option>, Handler>
    : TBasicAutocompleteHandlers<TOptionsOf<Option>, Handler>;

/**
 * Maps only subcommand routes containing autocomplete options to their nested handler maps.
 */
type TSubcommandAutocompleteHandlers<
    Options extends readonly APIApplicationCommandOption[],
    Handler extends TAutocompleteHandler,
> = {
    readonly [
        Option in TSubcommandRoute<Options> as keyof TAutocompleteHandlersForSubcommandRoute<
            Option,
            Handler
        > extends never
            ? never
            : Option["name"]
    ]: TAutocompleteHandlersForSubcommandRoute<Option, Handler>;
};

/**
 * Run handlers required by a command's executable routes.
 *
 * A command without subcommands resolves to one handler. Commands with
 * subcommands resolve to an object mirroring their subcommand-group structure.
 */
export type TCommandRunHandlers<CommandRegistrationData extends ICommandCommandRegistrationData> =
    TRunHandlersForOptions<TOptionsOf<CommandRegistrationData>>;

/**
 * Turns command registration data into a command-name to raw run-handler map.
 */
export type TCommandRunRegistry<CommandCommandRegistrationData extends ICommandCommandRegistrationData> = {
    readonly [
        CommandRegistrationData in CommandCommandRegistrationData as CommandRegistrationData["name"]
    ]: TCommandRunHandlers<CommandRegistrationData>;
};

/**
 * Autocomplete handlers required by the options declaring `autocomplete: true`.
 */
export type TCommandAutocompleteHandlers<
    CommandRegistrationData extends ICommandCommandRegistrationData,
    Handler extends TAutocompleteHandler = TCommandAutocompleteHandler,
> = [TSubcommandRoute<TOptionsOf<CommandRegistrationData>>] extends [never]
    ? TBasicAutocompleteHandlers<TOptionsOf<CommandRegistrationData>, Handler>
    : TSubcommandAutocompleteHandlers<TOptionsOf<CommandRegistrationData>, Handler>;

/**
 * Turns command registration data into a command-name to autocomplete-handler map.
 */
export type TCommandAutocompleteRegistry<
    CommandCommandRegistrationData extends ICommandCommandRegistrationData,
    Handler extends TAutocompleteHandler = TCommandAutocompleteHandler,
> = {
    readonly [
        CommandRegistrationData in CommandCommandRegistrationData as CommandRegistrationData["name"]
    ]: TCommandAutocompleteHandlers<CommandRegistrationData, Handler>;
};

/**
 * Object with two trees `run` and `autocomplete` containing functions that will be executed for a specific command/command option when receiving a command/autocomplete interaction.
 *
 * Examples:
 *
 * ```
 * const searchCommandHandlers = {
 *   run: () => {},
 *   autocomplete: {
 *     query: () => {},
 *   },
 * }
 * const lfgCommandHandlers = {
 *   run: {
 *     create: () => {},
 *     join: () => {}
 *     // ...
 *   },
 *
 *   autocomplete: {
 *     create: {
 *       code: () => {},
 *     },
 *     join: {
 *       code: () => {},
 *     },
 *     // ...
 *   },
 * }
 * ```
 */
export type TCommandHandlers<CommandRegistrationData extends ICommandCommandRegistrationData> = {
    readonly run: TCommandRunHandlers<CommandRegistrationData>;
} & (keyof TCommandAutocompleteHandlers<CommandRegistrationData> extends never
    ? { readonly autocomplete?: never }
    : { readonly autocomplete: TCommandAutocompleteHandlers<CommandRegistrationData> });

/**
 * Turns a {@link ICommandCommandRegistrationData} union into a ({@link ICommandCommandRegistrationData.name} to {@link TCommandHandlers})-map.
 */
export type TCommandRegistry<CommandCommandRegistrationData extends ICommandCommandRegistrationData> = {
    readonly [
        CommandRegistrationData in CommandCommandRegistrationData as CommandRegistrationData["name"]
    ]: TCommandHandlers<CommandRegistrationData>;
};
