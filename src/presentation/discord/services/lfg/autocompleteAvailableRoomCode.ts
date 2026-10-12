import type { AutocompleteRoomCode } from "./autocompleteRoomCode/base.ts";
import autocompleteRoomCodeBase from "./autocompleteRoomCode/base.ts";

export const autocompleteAvailableRoomCode: AutocompleteRoomCode = (dependencies, interaction) =>
    autocompleteRoomCodeBase(dependencies, { interaction, omitFullRooms: true });

export default autocompleteAvailableRoomCode;
