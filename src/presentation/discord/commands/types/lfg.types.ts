import type { ELfgResultKind, TLfgResult } from "../../../../application/lfg/types.ts";

export type TLfgPresentationResult = Exclude<TLfgResult, TLfgResult & { kind: ELfgResultKind.ROOM_LIST }>;
