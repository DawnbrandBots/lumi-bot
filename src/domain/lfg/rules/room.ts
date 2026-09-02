import { FRIEND_BATTLE_CODE_MAXIMUM_LENGTH, FRIEND_BATTLE_CODE_MINIMUM_LENGTH } from "../../game/constants.ts";

export function isValidRoomCode(code: string) {
    return code.length >= FRIEND_BATTLE_CODE_MINIMUM_LENGTH && code.length <= FRIEND_BATTLE_CODE_MAXIMUM_LENGTH;
}
