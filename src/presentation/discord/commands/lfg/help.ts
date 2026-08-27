import { ELfgResultKind } from "../../../../application/lfg/types.ts";
import type { TLfgCommandBase } from "./types.ts";

export const help: TLfgCommandBase<"useCases.admin.getGuildConfig"> = function () {
    return { kind: ELfgResultKind.HELP_REQUESTED };
};
