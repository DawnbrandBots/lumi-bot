import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    PermissionFlagsBits,
} from "discord.js";
import { BAZAAR_LISTING_MAXIMUM_PRICE, BAZAAR_LISTING_MAXIMUM_QUANTITY } from "../../../domain/bazaar/rules/listing.ts";
import {
    BAZAAR_DELETE_GROUP_NAME,
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_MANAGE_COMMAND_NAME,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_PURCHASE_SUBCOMMAND_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
    BAZAAR_SALE_SUBCOMMAND_NAME,
    BAZAAR_UPSERT_GROUP_NAME,
    BAZAAR_USER_OPTION_NAME,
} from "../commands/bazaar/constants.ts";
import type { ICommandRegistrationData } from "../commands/types.ts";

const userOption = {
    type: ApplicationCommandOptionType.User,
    name: BAZAAR_USER_OPTION_NAME,
    description: "Listing owner.",
    required: true,
} as const;

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

export const bazaarManageCommandRegistrationData = {
    name: BAZAAR_MANAGE_COMMAND_NAME,
    description: "Manage Bazaar listings for server members.",
    contexts: [InteractionContextType.Guild],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    options: [
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: BAZAAR_UPSERT_GROUP_NAME,
            description: "Create or update a member's listing.",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: BAZAAR_PURCHASE_SUBCOMMAND_NAME,
                    description: "Create or update a purchase listing.",
                    options: [userOption, itemOption, ...termsOptions],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: BAZAAR_SALE_SUBCOMMAND_NAME,
                    description: "Create or update a sale listing.",
                    options: [userOption, itemOption, ...termsOptions],
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: BAZAAR_DELETE_GROUP_NAME,
            description: "Delete a member's listing.",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: BAZAAR_PURCHASE_SUBCOMMAND_NAME,
                    description: "Delete a purchase listing.",
                    options: [userOption, itemOption],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: BAZAAR_SALE_SUBCOMMAND_NAME,
                    description: "Delete a sale listing.",
                    options: [userOption, itemOption],
                },
            ],
        },
    ],
} as const satisfies ICommandRegistrationData;
