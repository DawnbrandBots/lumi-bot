import type { TLfgManageFeatureCommand } from "./lfgManage/types.ts";
import { runLfgManageWithGuild } from "./runLfgManageWithGuild.ts";
import { runLfgSubcommand } from "./runLfgSubcommand.ts";
import type { TCommandRunHandler } from "./types.ts";

export function runLfgManageFeatureCommand(command: TLfgManageFeatureCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runLfgManageWithGuild({
            interaction,
            run: async (guildInteraction) => {
                const configResult = await arg.useCases.admin.getGuildConfig({ guildId: guildInteraction.guildId });
                await runLfgSubcommand({
                    guildConfig: configResult.value,
                    interaction: guildInteraction,
                    result: await command(arg, guildInteraction),
                });
            },
        });
}
