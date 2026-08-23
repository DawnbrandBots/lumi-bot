import type { linksCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/links.ts";
import { getLinksCommand } from "../../../../presentation/discord/commands/links.ts";
import type { TCommandHandlers } from "../../../../presentation/discord/commands/types.ts";

export function composeLinksCommand() {
    return {
        run: getLinksCommand(),
    } satisfies TCommandHandlers<typeof linksCommandCommandRegistrationData>;
}
