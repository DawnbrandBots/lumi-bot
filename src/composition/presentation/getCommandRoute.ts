import type { CacheType, CommandInteractionOptionResolver } from "discord.js";

export default function getCommandRoute(interaction: {
    readonly commandName: string;
    readonly options: Pick<CommandInteractionOptionResolver<CacheType>, "getSubcommand" | "getSubcommandGroup">;
}): string[] {
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    return [interaction.commandName, subcommandGroup, subcommand].filter((part) => part !== null);
}
