import { FRIEND_BATTLE_CODE_MAXIMUM_LENGTH, FRIEND_BATTLE_CODE_MINIMUM_LENGTH } from "../../../domain/game/constants.ts";

export function isInvalidRoomCode(code: string) {
    return code.length < FRIEND_BATTLE_CODE_MINIMUM_LENGTH || code.length > FRIEND_BATTLE_CODE_MAXIMUM_LENGTH;
}
