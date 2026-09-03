import { type TRunWithGuildArg, runWithGuild } from "../utils/runWithGuild.ts";

export function runLfgManageWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG management is only available in servers." });
}
