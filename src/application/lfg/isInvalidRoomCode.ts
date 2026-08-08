import { LFG_MAX_ROOM_CODE_LENGTH, LFG_MIN_ROOM_CODE_LENGTH } from "../../lfg/constants.ts";

export function isInvalidRoomCode(code: string) {
    return code.length < LFG_MIN_ROOM_CODE_LENGTH || code.length > LFG_MAX_ROOM_CODE_LENGTH;
}
