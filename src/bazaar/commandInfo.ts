import { ApplicationIntegrationType, InteractionContextType, type SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";
import {
    BAZAAR_COMMAND_NAME,
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_LIST_SUBCOMMAND_DESCRIPTION,
    BAZAAR_LIST_SUBCOMMAND_NAME,
    BAZAAR_MAX_PRICE,
    BAZAAR_MIN_PRICE,
    BAZAAR_MIN_QUANTITY,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
    BAZAAR_SELL_SUBCOMMAND_DESCRIPTION,
    BAZAAR_SELL_SUBCOMMAND_NAME,
    BAZAAR_VARIANT_OPTION_NAME,
} from "./constants.ts";
import { formatVariant } from "./mapper.ts";
import type { TBazaarWeaponVariant } from "./types.ts";

const VARIANT_CHOICES: readonly { readonly name: string; readonly value: TBazaarWeaponVariant }[] = [
    { name: formatVariant("ATK"), value: "ATK" },
    { name: formatVariant("NEUTRAL"), value: "NEUTRAL" },
    { name: formatVariant("HP"), value: "HP" },
];

export const bazaarCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(BAZAAR_SELL_SUBCOMMAND_NAME)
                    .setDescription(BAZAAR_SELL_SUBCOMMAND_DESCRIPTION)
                    .addStringOption((option) =>
                        option
                            .setName(BAZAAR_ITEM_OPTION_NAME)
                            .setDescription("Weapon to list.")
                            .setRequired(true)
                            .setAutocomplete(true),
                    )
                    .addStringOption((option) =>
                        option
                            .setName(BAZAAR_VARIANT_OPTION_NAME)
                            .setDescription("Weapon variant.")
                            .setRequired(true)
                            .addChoices(...VARIANT_CHOICES),
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName(BAZAAR_QUANTITY_OPTION_NAME)
                            .setDescription("Quantity to list.")
                            .setMinValue(BAZAAR_MIN_QUANTITY),
                    )
                    .addIntegerOption((option) =>
                        option
                            .setName(BAZAAR_PRICE_OPTION_NAME)
                            .setDescription("Optional price.")
                            .setMinValue(BAZAAR_MIN_PRICE)
                            .setMaxValue(BAZAAR_MAX_PRICE),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(BAZAAR_LIST_SUBCOMMAND_NAME).setDescription(BAZAAR_LIST_SUBCOMMAND_DESCRIPTION),
            );
    },
    name: BAZAAR_COMMAND_NAME,
    description: "List and browse player weapon sale posts.",
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
    integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
});
