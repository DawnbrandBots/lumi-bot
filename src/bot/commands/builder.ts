/**
 * @file
 * Disclaimer: Codex generated this file.
 * It's imperfect in that it doesn't type-check that all properties of {@link RESTPostAPIChatInputApplicationCommandsJSONBody} are handled.
 * If properties are added or changed later, there won't be a type error reporting it.
 * I had Codex generate an improved version of this file that does type-check the above, but I ultimately found that it made the code way more complex, less readble.
 * The point is that currently this works for the latest Discord.js version at the time of writing. I am not expecting the API to change much in the near future.
 * Hopefully Discord.js will have its own constructor at some point so we can remove this.
 *
 * discord.js does not provide a way to create a {@link SlashCommandBuilder} from {@link RESTPostAPIChatInputApplicationCommandsJSONBody},
 * so a custom one had to be implemented... but I don't want to spend much time maintaining it VS working on the bot's actual own code.
 *
 * The most important part: ensuring that the one test in builder.test.ts on {@link getSlashCommandBuilder} when given items from {@link allCommandRuntimeInfo} passes.
 */

import type {
    APIApplicationCommandBasicOption,
    APIApplicationCommandChannelOption,
    APIApplicationCommandIntegerOption,
    APIApplicationCommandNumberOption,
    APIApplicationCommandStringOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionBase,
    SharedNameAndDescription,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { ApplicationCommandOptionType, SlashCommandBuilder } from "discord.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- referred to in file comment above
import type allCommandRuntimeInfo from "../../loaders/commandRuntimeInfo.ts";
import type { ICommandApiInfo } from "./types.ts";

type TNameAndDescriptionData = Pick<
    ICommandApiInfo,
    "name" | "name_localizations" | "description" | "description_localizations"
>;

function setNameAndDescription<Builder extends SharedNameAndDescription>(
    builder: Builder,
    data: TNameAndDescriptionData,
): Builder {
    builder.setName(data.name).setDescription(data.description);
    if (data.name_localizations !== undefined) {
        builder.setNameLocalizations(data.name_localizations);
    }
    if (data.description_localizations !== undefined) {
        builder.setDescriptionLocalizations(data.description_localizations);
    }
    return builder;
}

function setBasicOptionData<Builder extends ApplicationCommandOptionBase>(
    builder: Builder,
    data: APIApplicationCommandBasicOption,
): Builder {
    setNameAndDescription(builder, data);
    if (data.required !== undefined) {
        builder.setRequired(data.required);
    }
    return builder;
}

function setStringOptionData(builder: SlashCommandStringOption, data: APIApplicationCommandStringOption) {
    setBasicOptionData(builder, data);
    if (data.autocomplete !== undefined) {
        builder.setAutocomplete(data.autocomplete);
    }
    if (data.choices !== undefined) {
        builder.setChoices(...data.choices);
    }
    if (data.min_length !== undefined) {
        builder.setMinLength(data.min_length);
    }
    if (data.max_length !== undefined) {
        builder.setMaxLength(data.max_length);
    }
    return builder;
}

function setIntegerOptionData(builder: SlashCommandIntegerOption, data: APIApplicationCommandIntegerOption) {
    setBasicOptionData(builder, data);
    if (data.autocomplete !== undefined) {
        builder.setAutocomplete(data.autocomplete);
    }
    if (data.choices !== undefined) {
        builder.setChoices(...data.choices);
    }
    if (data.min_value !== undefined) {
        builder.setMinValue(data.min_value);
    }
    if (data.max_value !== undefined) {
        builder.setMaxValue(data.max_value);
    }
    return builder;
}

function setNumberOptionData(builder: SlashCommandNumberOption, data: APIApplicationCommandNumberOption) {
    setBasicOptionData(builder, data);
    if (data.autocomplete !== undefined) {
        builder.setAutocomplete(data.autocomplete);
    }
    if (data.choices !== undefined) {
        builder.setChoices(...data.choices);
    }
    if (data.min_value !== undefined) {
        builder.setMinValue(data.min_value);
    }
    if (data.max_value !== undefined) {
        builder.setMaxValue(data.max_value);
    }
    return builder;
}

function setChannelOptionData(builder: SlashCommandChannelOption, data: APIApplicationCommandChannelOption) {
    setBasicOptionData(builder, data);
    if (data.channel_types !== undefined) {
        builder.addChannelTypes(...data.channel_types);
    }
    return builder;
}

function addBasicOption(
    builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
    option: APIApplicationCommandBasicOption,
): void {
    switch (option.type) {
        case ApplicationCommandOptionType.Attachment:
            builder.addAttachmentOption((optionBuilder) => setBasicOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.Boolean:
            builder.addBooleanOption((optionBuilder) => setBasicOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.Channel:
            builder.addChannelOption((optionBuilder) => setChannelOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.Integer:
            builder.addIntegerOption((optionBuilder) => setIntegerOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.Mentionable:
            builder.addMentionableOption((optionBuilder) => setBasicOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.Number:
            builder.addNumberOption((optionBuilder) => setNumberOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.Role:
            builder.addRoleOption((optionBuilder) => setBasicOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.String:
            builder.addStringOption((optionBuilder) => setStringOptionData(optionBuilder, option));
            return;
        case ApplicationCommandOptionType.User:
            builder.addUserOption((optionBuilder) => setBasicOptionData(optionBuilder, option));
            return;
    }
}

function setSubcommandData(builder: SlashCommandSubcommandBuilder, data: APIApplicationCommandSubcommandOption) {
    setNameAndDescription(builder, data);
    for (const option of data.options ?? []) {
        addBasicOption(builder, option);
    }
    return builder;
}

function setSubcommandGroupData(
    builder: SlashCommandSubcommandGroupBuilder,
    data: APIApplicationCommandSubcommandGroupOption,
) {
    setNameAndDescription(builder, data);
    for (const subcommand of data.options ?? []) {
        builder.addSubcommand((subcommandBuilder) => setSubcommandData(subcommandBuilder, subcommand));
    }
    return builder;
}

/**
 * Builds a {@link SlashCommandBuilder} instance from a {@link ICommandApiInfo}-shaped object.
 *
 * Unless the returned builder is updated, calling {@link SlashCommandBuilder.toJSON} should return an object equal to the one provided to {@link getSlashCommandBuilder}.
 */
export function getSlashCommandBuilder(apiInfo: ICommandApiInfo): SlashCommandBuilder {
    const builder = setNameAndDescription(new SlashCommandBuilder(), apiInfo);

    if (apiInfo.contexts !== undefined) {
        builder.setContexts(...apiInfo.contexts);
    }
    if (apiInfo.integration_types !== undefined) {
        builder.setIntegrationTypes(...apiInfo.integration_types);
    }
    if (apiInfo.default_permission !== undefined) {
        builder.setDefaultPermission(apiInfo.default_permission);
    }
    if (apiInfo.default_member_permissions !== undefined) {
        builder.setDefaultMemberPermissions(apiInfo.default_member_permissions);
    }
    if (apiInfo.dm_permission !== undefined) {
        builder.setDMPermission(apiInfo.dm_permission);
    }
    if (apiInfo.nsfw !== undefined) {
        builder.setNSFW(apiInfo.nsfw);
    }

    for (const option of apiInfo.options ?? []) {
        switch (option.type) {
            case ApplicationCommandOptionType.Subcommand:
                builder.addSubcommand((subcommandBuilder) => setSubcommandData(subcommandBuilder, option));
                break;
            case ApplicationCommandOptionType.SubcommandGroup:
                builder.addSubcommandGroup((groupBuilder) => setSubcommandGroupData(groupBuilder, option));
                break;
            default:
                addBasicOption(builder, option);
        }
    }

    return builder;
}
