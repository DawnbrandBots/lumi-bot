import type { AutocompleteRoomCode } from "./autocompleteRoomCode/base.ts";
import autocompleteRoomCodeBase from "./autocompleteRoomCode/base.ts";

export const autocompleteRoomCode: AutocompleteRoomCode = (dependencies, interaction) =>
    autocompleteRoomCodeBase(dependencies, { interaction, omitFullRooms: false });

export default autocompleteRoomCode;
