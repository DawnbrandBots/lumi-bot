# Event Handling Pipeline

Lumi separates Discord event handling from feature execution. The Discord layer is responsible for adapting Discord objects into bot requests and sending bot responses back to Discord. Feature modules should not know whether the request came from a slash command or from a regular message mention.

## Layers

1. **Discord event adapter**

    `src/index.ts` subscribes to Discord events and keeps event-specific branching there:
    - `MessageCreate` handles regular messages that mention the bot.
    - `InteractionCreate` handles slash commands and autocomplete interactions.

2. **Request mapping**

    Request mappers translate Discord event data into app-level requests before any feature is called.
    - `src/bot/messageRequest.ts` maps mention messages to `help` or `search` requests.
    - Slash commands map command options to the same request types in their command `request` methods.

3. **Feature dispatch**

    Feature dependencies are bound during startup. `src/search/feature.ts` receives `em`, `searchEngine`, and `handlers` once and returns a search feature function that only takes search input. `src/bot/featureRequest.ts` receives that bound feature and calls the correct feature plus mapper for each app-level request:
    - `help` -> `HelpFeature` -> help message mapper.
    - `search` -> `SearchFeature` -> search message mapper.

    This is the boundary where the feature layer starts.

4. **Response post-processing**

    `src/bot/response.ts` applies bot-wide response rules, such as appending the default error follow-up for unexpected errors.

5. **Discord send adapter**

    `src/bot/response.ts` sends the response using the correct Discord primitive:
    - Regular messages use `message.reply(...)` for the main response and `message.channel.send(...)` for follow-ups.
    - Slash commands use `interaction.reply(...)` for the main response and `interaction.followUp(...)` for follow-ups.

## Response Shape

Feature mappers return an `IInteractionHandlerReturnType`:

```ts
{
    reply: BaseMessageOptions & { kind: EMessageKind };
    followUps?: BaseMessageOptions[];
}
```

`reply` is the main message. `followUps` contains additional messages that must be sent immediately after the main response. This is used for cases such as a search result embed followed by a URL-only message that Discord can unfurl.

## Rules

- Feature modules should return domain results, not Discord sends.
- Mappers turn feature results into response data, not side effects.
- Event handlers should not call `HelpFeature` or `SearchFeature` directly.
- Slash command definitions should map interactions to requests; they should not call features directly.
- Response sending belongs in the Discord send adapter.
- Slash commands must use `followUp` after the first `reply`.
- Regular message follow-ups should use `channel.send` when they should not visually reply to the original message again.
