import type { AutocompleteInteraction } from "discord.js";
import { DISCORD_COMMAND_OPTION_AUTOCOMPLETE_MAX_CHOICE_COUNT } from "../../bot/constants.ts";
import { LFG_CODE_OPTION_NAME } from "../constants.ts";
import type { LfgFeature } from "../feature.ts";

const getRoomCodeAutocomplete = (arg: { lfgFeature: LfgFeature; ignoredSubCommands: string[] }) =>
    async function (interaction: AutocompleteInteraction) {
        if (!interaction.guildId) {
            return [];
        }
        // TODO: the following if branches show that autocomplete should probably be handled at the option level,
        // not at the root command level.

        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name !== LFG_CODE_OPTION_NAME) {
            return [];
        }

        const subcommand = interaction.options.getSubcommand(true);
        if (arg.ignoredSubCommands.includes(subcommand)) {
            return [];
        }

        const status = await arg.lfgFeature.status(interaction.guildId);
        return (
            status.value.rooms
                .filter((room) => room.code.includes(focusedOption.value))
                // TODO: handle max count at the db query level so it does not return more than 25 entries in the first place?
                .slice(0, DISCORD_COMMAND_OPTION_AUTOCOMPLETE_MAX_CHOICE_COUNT)
                .map((room) => ({ name: room.code, value: room.code }))
        );
    };

export default getRoomCodeAutocomplete;
