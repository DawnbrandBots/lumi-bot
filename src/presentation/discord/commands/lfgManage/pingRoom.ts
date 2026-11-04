import { ELfgResultKind } from "../../../../application/lfg/types.ts";
import { LFG_CODE_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const pingRoom: TLfgManageCommandBase<"useCases.lfg.pingRoom" | "useCases.admin.getGuildConfig"> =
    async function (arg, interaction) {
        const config = await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId });
        if (!config.value?.lfgChannel) {
            return { kind: ELfgResultKind.LFG_CHANNEL_NOT_FOUND };
        }
        return arg.useCases.lfg.pingRoom({
            guildId: interaction.guildId,
            code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
        });
    };
