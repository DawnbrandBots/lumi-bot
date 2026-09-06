import type { CacheType, ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import type { TBuiltCommandRunHandlerGetter } from "../../commands/types.ts";

export type TCommandInteraction = ChatInputCommandInteraction<CacheType>;
export type THandleCommandInteraction = (interaction: CommandInteraction<CacheType>) => Promise<void>;

export async function handleCommandInteraction(arg: {
    interaction: CommandInteraction<CacheType>;
    getCommandRunHandler: TBuiltCommandRunHandlerGetter;
}) {
    if (!arg.interaction.isChatInputCommand()) {
        return;
    }

    const run = arg.getCommandRunHandler(arg.interaction);

    if (!run) {
        // TODO: this should be reported in another PR
        return;
    }

    await run(arg.interaction);
}
