import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ChannelType,
    InteractionContextType,
    Locale,
    SlashCommandBuilder,
} from "discord.js";
import { describe, expect, test } from "vitest";
import { getSlashCommandBuilder } from "../../../src/bot/commands/info.ts";
import type { TCommandData } from "../../../src/bot/commands/types.ts";
import allCommandInfo from "../../../src/loaders/commandInfo.ts";

const commandWithBasicOptions = {
    name: "configure",
    name_localizations: { [Locale.German]: "konfigurieren" },
    description: "Configures every option type.",
    description_localizations: { [Locale.German]: "Konfiguriert jeden Optionstyp." },
    contexts: [InteractionContextType.Guild],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    default_permission: true,
    default_member_permissions: "0",
    dm_permission: false,
    nsfw: true,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "text",
            name_localizations: { [Locale.German]: "text" },
            description: "Text option.",
            description_localizations: { [Locale.German]: "Textoption." },
            required: true,
            choices: [
                {
                    name: "First",
                    name_localizations: { [Locale.German]: "Erste" },
                    value: "first",
                },
            ],
            min_length: 1,
            max_length: 20,
        },
        {
            type: ApplicationCommandOptionType.Integer,
            name: "count",
            description: "Integer option.",
            autocomplete: true,
            min_value: 1,
            max_value: 10,
        },
        {
            type: ApplicationCommandOptionType.Boolean,
            name: "enabled",
            description: "Boolean option.",
        },
        {
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "User option.",
        },
        {
            type: ApplicationCommandOptionType.Channel,
            name: "channel",
            description: "Channel option.",
            channel_types: [ChannelType.GuildText, ChannelType.GuildVoice],
        },
        {
            type: ApplicationCommandOptionType.Role,
            name: "role",
            description: "Role option.",
        },
        {
            type: ApplicationCommandOptionType.Mentionable,
            name: "mentionable",
            description: "Mentionable option.",
        },
        {
            type: ApplicationCommandOptionType.Number,
            name: "ratio",
            description: "Number option.",
            choices: [{ name: "Half", value: 0.5 }],
            min_value: 0,
            max_value: 1,
        },
        {
            type: ApplicationCommandOptionType.Attachment,
            name: "file",
            description: "Attachment option.",
        },
    ],
} as const satisfies TCommandData;

const commandWithSubcommands = {
    name: "rooms",
    description: "Manages rooms.",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "find",
            description: "Finds a room.",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "query",
                    description: "Room to find.",
                    autocomplete: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "admin",
            description: "Admin actions.",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "remove",
                    description: "Removes a room.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.Integer,
                            name: "room",
                            description: "Room to remove.",
                            choices: [{ name: "First", value: 1 }],
                        },
                    ],
                },
            ],
        },
    ],
} as const satisfies TCommandData;

const tooManyOptions: TCommandData = {
    name: "options",
    description: "Has too many options.",
    options: Array.from({ length: 26 }, (_, index) => ({
        type: ApplicationCommandOptionType.String,
        name: `option-${index}`,
        description: `Option ${index}.`,
    })),
};

const invalidCommandName: TCommandData = {
    name: "INVALID",
    description: "Invalid name.",
};

const invalidOptionName: TCommandData = {
    name: "invalid-option",
    description: "Has an invalid option.",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "INVALID",
            description: "Invalid name.",
        },
    ],
};

const tooManyChoices: TCommandData = {
    name: "choices",
    description: "Has too many choices.",
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: "choice",
            description: "Option with choices.",
            choices: Array.from({ length: 26 }, (_, index) => ({
                name: `Choice ${index}`,
                value: `${index}`,
            })),
        },
    ],
};

describe(getSlashCommandBuilder.name, () => {
    test.each(allCommandInfo)("rebuilds /$data.name", ({ data }) => {
        expect(getSlashCommandBuilder(data).toJSON()).toMatchObject(data);
    });

    test.each([
        ["basic options", commandWithBasicOptions],
        ["subcommands", commandWithSubcommands],
    ] as const)("rebuilds command data with %s", (_name, commandData) => {
        const builder = getSlashCommandBuilder(commandData);

        expect(builder).toBeInstanceOf(SlashCommandBuilder);
        expect(builder.toJSON()).toMatchObject(commandData);
    });

    test.each([
        ["an invalid command name", invalidCommandName],
        ["an invalid option name", invalidOptionName],
        ["too many options", tooManyOptions],
        ["too many choices", tooManyChoices],
    ] as const)("applies builder validation for %s", (_name, commandData) => {
        expect(() => getSlashCommandBuilder(commandData).toJSON()).toThrow();
    });
});
