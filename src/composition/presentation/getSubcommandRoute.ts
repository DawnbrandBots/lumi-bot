import type { CacheType, CommandInteractionOptionResolver } from "discord.js";

export default function getSubcommandRoute(interaction: {
    readonly options: Pick<CommandInteractionOptionResolver<CacheType>, "getSubcommand" | "getSubcommandGroup">;
}): string[] {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    return [subcommandGroup, subcommand].filter((part) => part !== null);
}
