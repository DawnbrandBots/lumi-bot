import { describe, expect, test } from "vitest";
import { getCommandRunHandler } from "../../../../../../src/presentation/discord/commands/handlers.ts";
import { commandHandlers, findRun, getMockChatInputInteraction, moveRun, rootRun } from "./fixtures.ts";

describe(getCommandRunHandler.name, () => {
    test.each([
        ["root command", commandHandlers.search, { commandName: "search" }, rootRun],
        ["direct subcommand", commandHandlers.rooms, { commandName: "rooms", subcommand: "find" }, findRun],
        [
            "grouped subcommand",
            commandHandlers.rooms,
            { commandName: "rooms", subcommand: "move", subcommandGroup: "admin" },
            moveRun,
        ],
        ["unknown route", commandHandlers.rooms, { commandName: "rooms", subcommand: "unknown" }, undefined],
    ] as const)("%s", (_name, command, interactionOptions, expected) => {
        const interaction = getMockChatInputInteraction(interactionOptions);

        expect(getCommandRunHandler(command, interaction)).toBe(expected);
    });
});
