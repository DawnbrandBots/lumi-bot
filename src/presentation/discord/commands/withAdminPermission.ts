import { runWithAdminPermission } from "./admin/runWithAdminPermission.ts";
import type { TAdminCommand } from "./admin/types.ts";
import type { TCommandRunHandler } from "./types.ts";

export default function withAdminPermission(command: TAdminCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runWithAdminPermission(interaction, (guildInteraction) => command(arg, guildInteraction));
}
