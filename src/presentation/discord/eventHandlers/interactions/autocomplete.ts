import { getCommandAutocompleteHandler } from "../../../../bot/commands/handlers.ts";
import type { TCommandRegistry } from "../../../../bot/commands/types.ts";
import isKeyOfExactObject from "../../../../utils/isKeyOfExactObject.ts";
import type { TAllCommandRegistrationData } from "../../commandRegistrationData.ts";
import type { TAutocompleteInteraction } from "./autocomplete.types.ts";

export async function handleAutocompleteInteraction(arg: {
    interaction: TAutocompleteInteraction;
    commands: TCommandRegistry<TAllCommandRegistrationData>;
}) {
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
}
