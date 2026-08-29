import type { adminCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/admin.ts";
import { getAdminCommand } from "../../../../presentation/discord/commands/admin.ts";
import type { TCommandHandlers } from "../../../../presentation/discord/commands/types.ts";
import type { TApplicationUseCases } from "../../../../application/useCases.types.ts";

export function composeAdminCommand(useCases: TApplicationUseCases) {
    return {
        run: getAdminCommand({ useCases }),
    } satisfies TCommandHandlers<typeof adminCommandCommandRegistrationData>;
}
