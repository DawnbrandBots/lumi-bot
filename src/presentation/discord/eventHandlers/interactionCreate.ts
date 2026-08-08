import debug from "debug";
import { getCommandAutocompleteHandler, getCommandRunHandler } from "../../../bot/commands/handlers.ts";
import type { TCommandRegistry } from "../../../bot/commands/types.ts";
import type { TAllCommandApiInfo } from "../../../loaders/commandRuntimeInfo.ts";
import isKeyOfExactObject from "../../../utils/isKeyOfExactObject.ts";
import type { TInteractionCreateEventInteraction } from "./interactionCreate.types.ts";

const log = debug(handleInteractionCreate.name);

export async function handleInteractionCreate(arg: {
    interaction: TInteractionCreateEventInteraction;
    commands: TCommandRegistry<TAllCommandApiInfo>;
}) {
    log(arg.interaction);

    if (arg.interaction.isChatInputCommand()) {
        if (!isKeyOfExactObject(arg.commands, arg.interaction.commandName)) {
            // TODO: this should be reported in another PR
            return;
        }
        const command = arg.commands[arg.interaction.commandName];
        const run = getCommandRunHandler(command, arg.interaction);
        if (!run) {
            // TODO: this should be reported in another PR
            return;
        }
        await run(arg.interaction);
        return;
    } else if (arg.interaction.isAutocomplete()) {
        if (!isKeyOfExactObject(arg.commands, arg.interaction.commandName)) {
            // TODO: this should be reported in another PR
            return;
        }
        const command = arg.commands[arg.interaction.commandName];
        const autocomplete = getCommandAutocompleteHandler(command, arg.interaction);
        const choices = await autocomplete?.(arg.interaction);
        if (!choices) {
            // TODO: this should be reported in another PR
            await arg.interaction.respond([]);
            return;
        }
        await arg.interaction.respond(choices);
        return;
    }
}
