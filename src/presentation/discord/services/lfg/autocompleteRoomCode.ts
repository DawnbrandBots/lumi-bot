import { DISCORD_COMMAND_OPTION_AUTOCOMPLETE_MAX_CHOICE_COUNT } from "../../constants.ts";
import type { TServiceBase } from "../types.ts";

export const autocompleteRoomCode: TServiceBase<"autocompleteRoomCode", "useCases.lfg.getLfgStatus"> = async function (
    { useCases },
    interaction,
) {
    if (!interaction.guildId) {
        return [];
    }

    const focusedOption = interaction.options.getFocused(true);
    const status = await useCases.lfg.getLfgStatus({ guildId: interaction.guildId });
    return (
        status.value.rooms
            .filter((room) => room.code.includes(focusedOption.value))
            // TODO: handle max count at the db query level so it does not return more than 25 entries in the first place?
            .slice(0, DISCORD_COMMAND_OPTION_AUTOCOMPLETE_MAX_CHOICE_COUNT)
            .map((room) => ({ name: room.code, value: room.code }))
    );
};

export default autocompleteRoomCode;
