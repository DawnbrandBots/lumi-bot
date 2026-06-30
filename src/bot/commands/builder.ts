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
import type { ICommandData } from "./types.ts";

type TNameAndDescriptionData = Pick<
    ICommandData,
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
 * Builds a {@link SlashCommandBuilder} instance from a {@link ICommandData}-shaped object.
 *
 * Unless the returned builder is updated, calling {@link SlashCommandBuilder.toJSON} should return an object equal to the one provided to {@link getSlashCommandBuilder}.
 */
export function getSlashCommandBuilder(data: ICommandData): SlashCommandBuilder {
    const builder = setNameAndDescription(new SlashCommandBuilder(), data);

    if (data.contexts !== undefined) {
        builder.setContexts(...data.contexts);
    }
    if (data.integration_types !== undefined) {
        builder.setIntegrationTypes(...data.integration_types);
    }
    if (data.default_permission !== undefined) {
        builder.setDefaultPermission(data.default_permission);
    }
    if (data.default_member_permissions !== undefined) {
        builder.setDefaultMemberPermissions(data.default_member_permissions);
    }
    if (data.dm_permission !== undefined) {
        builder.setDMPermission(data.dm_permission);
    }
    if (data.nsfw !== undefined) {
        builder.setNSFW(data.nsfw);
    }

    for (const option of data.options ?? []) {
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
