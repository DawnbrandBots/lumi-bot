import { lfgResponder } from "../responders/lfg.ts";
import type { TLfgFeatureCommand } from "./lfg/types.ts";
import { runLfgWithGuild } from "./runLfgWithGuild.ts";
import type { TCommandRunHandler } from "./types.ts";

export function runLfgFeatureCommand(command: TLfgFeatureCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runLfgWithGuild({
            interaction,
            run: async (guildInteraction) => {
                const configResult = await arg.useCases.admin.getGuildConfig({ guildId: guildInteraction.guildId });
                await lfgResponder({
                    guildConfig: configResult.value,
                    interaction: guildInteraction,
                    result: await command(arg, guildInteraction),
                });
            },
        });
}
