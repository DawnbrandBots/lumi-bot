import type { ELfgResultKind, TLfgResult } from "../../../../application/lfg/types.ts";

/** TLfgResult without ROOM_LIST, as it is the only kind to not be used in LFG Discord mappers. */
export type TLfgPresentationResult = Exclude<TLfgResult, TLfgResult & { kind: ELfgResultKind.ROOM_LIST }>;
