import { ELfgResultKind } from "../../../../application/lfg/types.ts";
import type { TLfgCommandBase } from "./types.ts";

export const pingRoom: TLfgCommandBase<"useCases.lfg.pingOwnedRoom" | "useCases.admin.getGuildConfig"> =
    async function (arg, interaction) {
        const config = await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId });
        if (!config.value?.lfgChannel) {
            return { kind: ELfgResultKind.LFG_CHANNEL_NOT_FOUND };
        }
        return arg.useCases.lfg.pingOwnedRoom({ guildId: interaction.guildId, owner: interaction.user });
    };
