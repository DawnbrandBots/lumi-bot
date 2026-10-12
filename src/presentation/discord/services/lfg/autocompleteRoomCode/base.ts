import { DISCORD_COMMAND_OPTION_AUTOCOMPLETE_MAX_CHOICE_COUNT } from "../../../constants.ts";
import type { TServiceBase } from "../../types.ts";

export type AutocompleteRoomCode = TServiceBase<"autocompleteRoomCode", "useCases.lfg.getRoomList">;

export const autocompleteRoomCodeBase: (
    dependencies: Parameters<AutocompleteRoomCode>[0],
    input: { omitFullRooms: boolean; interaction: Parameters<AutocompleteRoomCode>[1] },
) => ReturnType<AutocompleteRoomCode> = async function ({ useCases }, { interaction, omitFullRooms }) {
    if (!interaction.guildId) {
        return [];
    }

    const focusedOption = interaction.options.getFocused(true);
    const { value: rooms } = await useCases.lfg.getRoomList({ guildId: interaction.guildId, omitFullRooms });
    return (
        rooms
            .filter((room) => room.code.includes(focusedOption.value))
            // TODO: handle max count at the db query level so it does not return more than 25 entries in the first place?
            .slice(0, DISCORD_COMMAND_OPTION_AUTOCOMPLETE_MAX_CHOICE_COUNT)
            .map((room) => ({ name: room.code, value: room.code }))
    );
};

export default autocompleteRoomCodeBase;
