import { lfgResponder } from "../responders/lfg.ts";
import type { TLfgManageFeatureCommand } from "./lfgManage/types.ts";
import { runLfgManageWithGuild } from "./runLfgManageWithGuild.ts";
import type { TCommandRunHandler } from "./types.ts";

export function runLfgManageFeatureCommand(command: TLfgManageFeatureCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runLfgManageWithGuild({
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
