import type { TAutocompleteHandlerGetter } from "../../presentation/discord/commands/types.ts";
import getHandlerAtRoute, { type THandler, type THandlerTree } from "../utils/getHandlerAtRoute.ts";
import getSubcommandRoute from "./getSubcommandRoute.ts";

export default function getAutocompleteHandler<Handler extends THandler>(
    autocompleteHandlers: Record<string, THandlerTree<Handler>>,
): TAutocompleteHandlerGetter<Handler> {
    return (interaction) => {
        const focusedOption = interaction.options.getFocused();
        return getHandlerAtRoute(autocompleteHandlers, interaction.commandName, [
            ...getSubcommandRoute(interaction),
            focusedOption,
        ]);
    };
}
