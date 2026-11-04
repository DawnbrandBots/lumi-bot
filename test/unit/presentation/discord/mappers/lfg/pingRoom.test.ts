import { inlineCode } from "discord.js";
import { expect, test } from "vitest";
import { ELfgResultKind } from "../../../../../../src/application/lfg/types.ts";
import { DISCORD_MESSAGE_POSITIVE_COLOR } from "../../../../../../src/presentation/discord/constants.ts";
import { mapLfgResultToMessageBase } from "../../../../../../src/presentation/discord/mappers/lfg.ts";
import { EMessageKind } from "../../../../../../src/presentation/discord/message.types.ts";

const roomPingedResult = {
    kind: ELfgResultKind.ROOM_PINGED,
    value: { room: { id: "id", code: "room", ownerId: "owner", playerIds: ["owner", "player"] } },
} as const;

test.each([
    {
        input: {
            callerId: "admin",
            isPublic: true,
            result: roomPingedResult,
        },
        expected: {
            content: "<@admin> pinged room `room`: <@owner> <@player>.",
            allowedMentions: { parse: [], users: ["owner", "player"] },
        },
    },
    {
        input: {
            callerId: "admin",
            isPublic: false,
            result: roomPingedResult,
        },
        expected: {
            kind: EMessageKind.POSITIVE,
            embeds: [
                {
                    description: `Pinged ${inlineCode(roomPingedResult.value.room.code)} players.`,
                    color: DISCORD_MESSAGE_POSITIVE_COLOR,
                },
            ],
        },
    },
] as const)("room ping visibility: public=%s", ({ input, expected }) => {
    expect(mapLfgResultToMessageBase(input)).toMatchObject(expected);
});
