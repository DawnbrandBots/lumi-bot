import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    type APIApplicationCommandBasicOption,
} from "discord.js";
import { BAZAAR_LISTING_MAXIMUM_PRICE, BAZAAR_LISTING_MAXIMUM_QUANTITY } from "../../../domain/bazaar/rules/listing.ts";
import {
    BAZAAR_COMMAND_NAME,
    BAZAAR_DELETE_GROUP_NAME,
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_LIST_GROUP_NAME,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_PURCHASE_SUBCOMMAND_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
    BAZAAR_SALE_SUBCOMMAND_NAME,
    BAZAAR_UPSERT_GROUP_NAME,
    BAZAAR_USER_OPTION_NAME,
} from "../commands/bazaar/constants.ts";
import type { ICommandRegistrationData } from "../commands/types.ts";
import { SHOW_RESPONSE_OPTION } from "./shared.ts";

const itemOption = {
    type: ApplicationCommandOptionType.String,
    name: BAZAAR_ITEM_OPTION_NAME,
    description: "Weapon variant or soul.",
    required: true,
    autocomplete: true,
} as const;

const termsOptions = [
    {
        type: ApplicationCommandOptionType.Integer,
        name: BAZAAR_QUANTITY_OPTION_NAME,
        description: "Quantity, or 0 for flexible.",
        required: false,
        min_value: 0,
        max_value: BAZAAR_LISTING_MAXIMUM_QUANTITY,
    },
    {
        type: ApplicationCommandOptionType.Integer,
        name: BAZAAR_PRICE_OPTION_NAME,
        description: "Unit price, or 0 for negotiable.",
        required: false,
        min_value: 0,
        max_value: BAZAAR_LISTING_MAXIMUM_PRICE,
    },
] as const;

function sideSubcommands<const Options extends APIApplicationCommandBasicOption[]>(
    description: string,
    options: Options,
): [
    {
        type: ApplicationCommandOptionType.Subcommand;
        name: typeof BAZAAR_PURCHASE_SUBCOMMAND_NAME;
        description: string;
        options: Options;
    },
    {
        type: ApplicationCommandOptionType.Subcommand;
        name: typeof BAZAAR_SALE_SUBCOMMAND_NAME;
        description: string;
        options: Options;
    },
] {
    return [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: BAZAAR_PURCHASE_SUBCOMMAND_NAME,
            description: `${description} a purchase listing.`,
            options,
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: BAZAAR_SALE_SUBCOMMAND_NAME,
            description: `${description} a sale listing.`,
            options,
        },
    ];
}

export const bazaarCommandRegistrationData = {
    name: BAZAAR_COMMAND_NAME,
    description: "Create and browse Bazaar listings in this server.",
    contexts: [InteractionContextType.Guild],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    options: [
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: BAZAAR_UPSERT_GROUP_NAME,
            description: "Create or update one of your listings.",
            options: sideSubcommands("Create or update", [itemOption, ...termsOptions]),
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: BAZAAR_DELETE_GROUP_NAME,
            description: "Delete one of your listings.",
            options: sideSubcommands("Delete", [itemOption]),
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: BAZAAR_LIST_GROUP_NAME,
            description: "Browse listings.",
            options: sideSubcommands("Browse", [
                {
                    type: ApplicationCommandOptionType.User,
                    name: BAZAAR_USER_OPTION_NAME,
                    description: "Only show listings from this user.",
                    required: false,
                },
                { ...itemOption, required: false },
                SHOW_RESPONSE_OPTION,
            ]),
        },
    ],
} as const satisfies ICommandRegistrationData;
