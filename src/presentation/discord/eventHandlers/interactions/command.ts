import { getCommandRunHandler } from "../../commands/handlers.ts";
import type { TCommandRegistry } from "../../commands/types.ts";
import isKeyOfExactObject from "../../../../utils/isKeyOfExactObject.ts";
import type { TAllCommandRegistrationData } from "../../commandRegistrationData.ts";
import type { TCommandInteraction } from "./command.types.ts";

export async function handleCommandInteraction(arg: {
    interaction: TCommandInteraction;
    commands: TCommandRegistry<TAllCommandRegistrationData>;
}) {
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
}
