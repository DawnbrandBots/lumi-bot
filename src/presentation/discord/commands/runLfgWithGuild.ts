import { type TRunWithGuildArg, runWithGuild } from "../utils/runWithGuild.ts";

export function runLfgWithGuild(arg: Omit<TRunWithGuildArg, "notInGuildMessageEmbeddescription">) {
    return runWithGuild({ ...arg, notInGuildMessageEmbeddescription: "LFG is only available in servers." });
}
