import { describe, expect, test } from "vitest";
import { getCommandRunHandler } from "../../../../../../src/presentation/discord/commands/handlers.ts";
import { commandHandlers, findRun, getMockChatInputInteraction, moveRun, rootRun } from "./fixtures.ts";

describe(getCommandRunHandler.name, () => {
    test.each([
        ["root command", { commandName: "search" }, rootRun],
        ["direct subcommand", { commandName: "rooms", subcommand: "find" }, findRun],
        ["grouped subcommand", { commandName: "rooms", subcommand: "move", subcommandGroup: "admin" }, moveRun],
        ["unknown route", { commandName: "rooms", subcommand: "unknown" }, undefined],
    ] as const)("%s", (_name, interactionOptions, expected) => {
        const interaction = getMockChatInputInteraction(interactionOptions);

        expect(getCommandRunHandler(commandHandlers)(interaction)).toBe(expected);
    });
});
