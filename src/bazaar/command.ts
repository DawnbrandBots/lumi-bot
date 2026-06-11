import type { EntityManager } from "@mikro-orm/sqlite";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../bot/command.ts";
import type { ISearchEngine, ISearchItem } from "../search/types.ts";
import {
    BAZAAR_AUTOCOMPLETE_RESULTS_LIMIT,
    BAZAAR_ITEM_OPTION_NAME,
    BAZAAR_LIST_SUBCOMMAND_NAME,
    BAZAAR_MIN_QUANTITY,
    BAZAAR_PRICE_OPTION_NAME,
    BAZAAR_QUANTITY_OPTION_NAME,
    BAZAAR_SELL_SUBCOMMAND_NAME,
    BAZAAR_VARIANT_OPTION_NAME,
} from "./constants.ts";
import { bazaarCommandInfo } from "./commandInfo.ts";
import type { BazaarFeature } from "./feature.ts";
import mapBazaarFeatureReturnToMessage from "./mapper.ts";
import { EBazaarFeatureReturnKind, type IBazaarWeapon, type TBazaarWeaponVariant } from "./types.ts";
import { Weapon } from "../game/models/weapon.ts";

type BazaarSearchItem = ISearchItem & { readonly kind: "weapon" };

export function getBazaarCommand({
    bazaarFeature,
    gameEm,
    weaponSearchEngine,
}: {
    readonly bazaarFeature: BazaarFeature;
    readonly gameEm: EntityManager;
    readonly weaponSearchEngine: ISearchEngine<BazaarSearchItem>;
}) {
    async function runSubcommand(interaction: ChatInputCommandInteraction<CacheType>, subcommand: string | null) {
        switch (subcommand) {
            case BAZAAR_SELL_SUBCOMMAND_NAME: {
                const weaponSearchItem = weaponSearchEngine.searchOne(
                    interaction.options.getString(BAZAAR_ITEM_OPTION_NAME, true),
                );
                const weapon = weaponSearchItem ? await gameEm.findOne(Weapon, { id: weaponSearchItem.id }) : null;
                return bazaarFeature.sell(
                    interaction.user,
                    weapon && toBazaarWeapon(weapon),
                    interaction.options.getString(BAZAAR_VARIANT_OPTION_NAME, true) as TBazaarWeaponVariant,
                    interaction.options.getInteger(BAZAAR_QUANTITY_OPTION_NAME) ?? BAZAAR_MIN_QUANTITY,
                    interaction.options.getInteger(BAZAAR_PRICE_OPTION_NAME),
                );
            }
            case BAZAAR_LIST_SUBCOMMAND_NAME:
                return bazaarFeature.list();
            default:
                return { kind: EBazaarFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
    }

    return new Command({
        info: bazaarCommandInfo,
        run: async function (interaction) {
            const result = await runSubcommand(interaction, interaction.options.getSubcommand(false));
            return interaction.reply({ ...mapBazaarFeatureReturnToMessage(result), flags: MessageFlags.Ephemeral });
        },
        autocomplete: (interaction) => {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name !== BAZAAR_ITEM_OPTION_NAME) {
                return null;
            }
            return weaponSearchEngine
                .search(focusedOption.value, BAZAAR_AUTOCOMPLETE_RESULTS_LIMIT)
                .map((item) => ({ name: item.name, value: item.name }));
        },
    });
}

function toBazaarWeapon(weapon: Weapon): IBazaarWeapon {
    return {
        id: weapon.id,
        name: weapon.name,
        level: weapon.level,
    };
}
