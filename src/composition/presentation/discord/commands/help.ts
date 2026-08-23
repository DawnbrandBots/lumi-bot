import type { helpCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/help.ts";
import { getHelpCommand } from "../../../../presentation/discord/commands/help.ts";
import type { TCommandHandlers } from "../../../../presentation/discord/commands/types.ts";

export function composeHelpCommand() {
    return {
        run: getHelpCommand(),
    } satisfies TCommandHandlers<typeof helpCommandCommandRegistrationData>;
}
