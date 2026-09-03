import type { TCommandRunHandler, TCommandRunHandlerGetter } from "../../presentation/discord/commands/types.ts";
import getHandlerAtRoute, { type THandlerTree } from "../utils/getHandlerAtRoute.ts";
import getCommandRoute from "./getCommandRoute.ts";

/** Creates a getter for the raw run handler matching an interaction's command and subcommand route. */
export default function getCommandRunHandler(
    commands: Record<string, THandlerTree<TCommandRunHandler>>,
): TCommandRunHandlerGetter {
    return (interaction) => getHandlerAtRoute(commands, getCommandRoute(interaction));
}
