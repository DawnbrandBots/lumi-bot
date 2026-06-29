import type {
    APIApplicationCommandOption,
    APIEmbed,
    ApplicationCommandOptionChoiceData,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    BaseMessageOptions,
    CacheType,
    ChatInputCommandInteraction,
    InteractionResponse,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SharedSlashCommand,
    SlashCommandBuilder,
} from "discord.js";
import type { MaybePromise } from "../utils/types.ts";

/**
 * Holds info about a command. Info may then be displayed while using the command or in help commands' output.
 */
export interface ICommandInfo {
    /**
     * Object with info about the command to be included in payload to register commands.
     */
    readonly registerCommandInfo: ReturnType<SharedSlashCommand["toJSON"]>;
    readonly name: string;
    /**
     * Briefly explains what the command does.
     */
    readonly description: string;
    /**
     * Additional info about the command to be registered.
     */
    readonly customInfo: (this: ICommandInfo, baseInfo: SlashCommandBuilder) => SharedSlashCommand;
    /**
     * Describes how to format a message pinging the bot to use the feature.
     */
    readonly pingEquivalent?: string;
}

/**
 * Executes a Discord chat-input command and replies to its interaction.
 */
export type TCommandRunHandler = (
    interaction: ChatInputCommandInteraction<CacheType>,
) => Promise<InteractionResponse<boolean>>;

/**
 * Produces choices for an option focused by a Discord autocomplete interaction.
 */
export type TCommandAutocompleteHandler = (
    interaction: AutocompleteInteraction<CacheType>,
) => MaybePromise<ApplicationCommandOptionChoiceData[] | null>;

/**
 * Represents a Discord slash command.
 */
export interface ICommand {
    readonly info: ICommandInfo;
    /**
     * What the command does. Must reply to the interaction.
     */
    readonly run: TCommandRunHandler;
    /**
     * Provides autocomplete suggestions for the command's options.
     */
    readonly autocomplete?: TCommandAutocompleteHandler;
}

/**
 * The Discord API representation of a chat-input command.
 *
 * Concrete command data should use `as const satisfies {@link TCommandData}` so command,
 * subcommand and option names remain available as literal types.
 */
export type TCommandData = RESTPostAPIChatInputApplicationCommandsJSONBody;

/**
 * Extracts the options declared directly on command data, a subcommand or a subcommand group.
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
type TBasicAutocompleteHandlers<Options extends readonly APIApplicationCommandOption[]> = {
    readonly [Option in TAutocompletableOption<Options> as Option["name"]]: TCommandAutocompleteHandler;
};

/**
 * Derives autocomplete handlers beneath one subcommand or subcommand group.
 */
type TAutocompleteHandlersForSubcommandRoute<Option extends TSubcommandRoute<readonly APIApplicationCommandOption[]>> =
    Option extends {
        readonly type: ApplicationCommandOptionType.SubcommandGroup;
    }
        ? TSubcommandAutocompleteHandlers<TOptionsOf<Option>>
        : TBasicAutocompleteHandlers<TOptionsOf<Option>>;

/**
 * Maps only subcommand routes containing autocomplete options to their nested handler maps.
 */
type TSubcommandAutocompleteHandlers<Options extends readonly APIApplicationCommandOption[]> = {
    readonly [Option in TSubcommandRoute<Options> as keyof TAutocompleteHandlersForSubcommandRoute<Option> extends never
        ? never
        : Option["name"]]: TAutocompleteHandlersForSubcommandRoute<Option>;
};

/**
 * Run handlers required by a command's executable routes.
 *
 * A command without subcommands resolves to one handler. Commands with
 * subcommands resolve to an object mirroring their subcommand-group structure.
 */
export type TCommandRunHandlers<Data extends TCommandData> = TRunHandlersForOptions<TOptionsOf<Data>>;

/**
 * Autocomplete handlers required by the options declaring `autocomplete: true`.
 */
export type TCommandAutocompleteHandlers<Data extends TCommandData> = [TSubcommandRoute<TOptionsOf<Data>>] extends [
    never,
]
    ? TBasicAutocompleteHandlers<TOptionsOf<Data>>
    : TSubcommandAutocompleteHandlers<TOptionsOf<Data>>;

/**
 * All handlers required to implement a command's static data.
 */
export type TCommandHandlers<Data extends TCommandData> = {
    readonly run: TCommandRunHandlers<Data>;
} & (keyof TCommandAutocompleteHandlers<Data> extends never
    ? { readonly autocomplete?: never }
    : { readonly autocomplete: TCommandAutocompleteHandlers<Data> });

export const enum EMessageKind {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE",
    NEUTRAL = "NEUTRAL",
    ERROR = "ERROR",
}

/**
 * Pre-made formatters should already have a color which shouldn't be overidden by the caller.
 */
export type IChildMessageArgCustomProps = {
    embed: Omit<APIEmbed, "color">;
};

export type IBaseMessageArgCustomProps = {
    kind: EMessageKind;
    embed: APIEmbed;
};

export type TMessageOptionsUnusedProperties = "embeds";

export type IBaseMessageArg<MessageOptions extends BaseMessageOptions = BaseMessageOptions> = Omit<
    MessageOptions,
    TMessageOptionsUnusedProperties
> &
    IBaseMessageArgCustomProps;

export type IChildMessageArg<MessageOptions extends BaseMessageOptions = BaseMessageOptions> = Omit<
    MessageOptions,
    TMessageOptionsUnusedProperties
> &
    IChildMessageArgCustomProps;
