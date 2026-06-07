import debug from "debug";
import type { Interaction } from "discord.js";
import type { TBotRequest } from "../../bot/featureRequest.ts";
import { addDefaultFollowUps, sendInteractionResponse } from "../../bot/response.ts";
import type { ICommand, IInteractionHandlerReturnType } from "../../bot/types.ts";

const log = debug("bot");

export default function getInteractionCreateEventHandler({
    commands,
    fallbackCommand,
    handleBotFeatureRequest,
}: {
    commands: Record<string, ICommand>;
    fallbackCommand: ICommand;
    handleBotFeatureRequest: (request: TBotRequest) => Promise<IInteractionHandlerReturnType>;
}) {
    return async function handleInteractionCreate(interaction: Interaction) {
        log(interaction);

        if (interaction.isChatInputCommand()) {
            const command = commands[interaction.commandName] || fallbackCommand;
            const request = await command.request(interaction);
            const baseResponse = await handleBotFeatureRequest(request);
            await sendInteractionResponse(interaction, addDefaultFollowUps(baseResponse));
            return;
        }

        if (interaction.isAutocomplete()) {
            const command = commands[interaction.commandName];
            if (!command) {
                return;
            }
            const choices = await command.autocomplete?.(interaction);
            if (!choices) {
                return;
            }
            await interaction.respond(choices);
        }
    };
}
