import type { TBuiltCommandRunHandlerGetter } from "../../commands/handlers.ts";
import type { TCommandInteraction } from "./command.types.ts";

export async function handleCommandInteraction(arg: {
    interaction: TCommandInteraction;
    getCommandRunHandler: TBuiltCommandRunHandlerGetter;
}) {
    const run = arg.getCommandRunHandler(arg.interaction);

    if (!run) {
        // TODO: this should be reported in another PR
        return;
    }

    await run(arg.interaction);
}
