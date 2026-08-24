import type { adminCommandCommandRegistrationData } from "../../../../presentation/discord/commandRegistrationData/admin.ts";
import { getAdminCommand } from "../../../../presentation/discord/commands/admin.ts";
import type { TCommandHandlers } from "../../../../presentation/discord/commands/types.ts";
import type { TAdminUseCases } from "../../../../application/admin/useCases.types.ts";

export function composeAdminCommand(adminUseCases: TAdminUseCases) {
    return {
        run: getAdminCommand(adminUseCases),
    } satisfies TCommandHandlers<typeof adminCommandCommandRegistrationData>;
}
