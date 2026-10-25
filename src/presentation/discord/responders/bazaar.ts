import { MessageFlags } from "discord.js";
import { EBazaarResultKind, type TBazaarResult } from "../../../application/bazaar/types.ts";
import type { TBazaarUseCaseArgs } from "../../../application/bazaar/useCases.types.ts";
import { SHOW_RESPONSE_OPTION_NAME } from "../commands/constants.ts";
import type { TGuildCommandInteraction } from "../commands/types.ts";
import { mapBazaarListResultToMessage, mapBazaarMutationResultToMessage } from "../mappers/bazaar.ts";

export async function bazaarResponder({
    filter,
    interaction,
    page = 0,
    result,
}: {
    readonly filter?: TBazaarUseCaseArgs["listListings"];
    readonly interaction: TGuildCommandInteraction;
    readonly page?: number;
    readonly result: TBazaarResult;
}): Promise<void> {
    if (result.kind === EBazaarResultKind.LISTINGS_LISTED && filter) {
        const message = mapBazaarListResultToMessage(result.value.listings, filter, page);
        const showResponse = interaction.options.getBoolean(SHOW_RESPONSE_OPTION_NAME, false) === true;
        await interaction.reply(showResponse ? message : { ...message, flags: [MessageFlags.Ephemeral] });
        return;
    }
    if (result.kind !== EBazaarResultKind.LISTINGS_LISTED) {
        await interaction.reply({ ...mapBazaarMutationResultToMessage(result), flags: [MessageFlags.Ephemeral] });
    }
}
