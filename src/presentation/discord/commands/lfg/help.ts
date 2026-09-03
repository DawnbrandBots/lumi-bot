import { ELfgResultKind } from "../../../../application/lfg/types.ts";
import type { TLfgCommandBase } from "./types.ts";

// TODO: omit type argument when nothing is needed?
export const help: TLfgCommandBase<"useCases"> = function () {
    return { kind: ELfgResultKind.HELP };
};
