import type { MikroORM } from "@mikro-orm/sqlite";
import type { BaseMessageOptions } from "discord.js";
import { type APIEmbed, channelMention } from "discord.js";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import recreateDb from "../../scripts/utils/recreateDb.ts";
import { AdminFeature } from "../../src/admin/feature.ts";
import { GuildConfig } from "../../src/admin/models/config.ts";
import { EMessageKind } from "../../src/bot/types.ts";
import getOrm from "../../src/loaders/orm.ts";
import { configsById } from "../mikro-orm.test.config.ts";

const GUILD_ID = "guild-1";
const CHANNEL_ID = "channel-1";

let orm: MikroORM;
let feature: AdminFeature;

// TODO: not exact argument type
function description(response: BaseMessageOptions): string {
    return (response.embeds?.[0] as APIEmbed | undefined)?.description ?? "";
}

async function getConfig(): Promise<GuildConfig | null> {
    return orm.em.fork().findOne(GuildConfig, { guild: GUILD_ID });
}

describe(AdminFeature.name, () => {
    beforeEach(async () => {
        await recreateDb(configsById.lumi);
        orm = await getOrm(configsById.lumi);
        feature = new AdminFeature({ em: orm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
    });

    test("creates default config on read", async () => {
        const response = await feature.lfgShow(GUILD_ID);

        expect(response.kind).toBe(EMessageKind.NEUTRAL);
        expect((await getConfig())?.lfgChannel).toBeNull();
        expect(response.embeds?.[0]).toMatchObject({
            fields: [{ name: "Channel", value: "No channel set" }],
        });
    });

    test("returns existing config on read", async () => {
        await feature.lfgChannel(GUILD_ID, "set", CHANNEL_ID);

        const response = await feature.lfgShow(GUILD_ID);

        expect(response.embeds?.[0]).toMatchObject({
            fields: [{ name: "Channel", value: channelMention(CHANNEL_ID) }],
        });
    });

    test("sets channel", async () => {
        const response = await feature.lfgChannel(GUILD_ID, "set", CHANNEL_ID);

        expect(response.kind).toBe(EMessageKind.POSITIVE);
        expect((await getConfig())?.lfgChannel).toBe(CHANNEL_ID);
    });

    test("clears channel", async () => {
        await feature.lfgChannel(GUILD_ID, "set", CHANNEL_ID);

        const response = await feature.lfgChannel(GUILD_ID, "clear", null);

        expect(response.kind).toBe(EMessageKind.POSITIVE);
        expect((await getConfig())?.lfgChannel).toBeNull();
    });

    test("channel command without options explains the setting and shows current value", async () => {
        const response = await feature.lfgChannel(GUILD_ID, null, null);

        expect(response.kind).toBe(EMessageKind.NEUTRAL);
        expect(description(response)).toContain("Valid combinations");
        expect(description(response)).toContain("No channel set");
    });

    test("rejects set without channel", async () => {
        const response = await feature.lfgChannel(GUILD_ID, "set", null);

        expect(response.kind).toBe(EMessageKind.ERROR);
        expect(response.embeds?.[0]).toMatchObject({ title: "Invalid options combination" });
    });

    test("rejects clear with channel", async () => {
        const response = await feature.lfgChannel(GUILD_ID, "clear", CHANNEL_ID);

        expect(response.kind).toBe(EMessageKind.ERROR);
        expect(response.embeds?.[0]).toMatchObject({ title: "Invalid options combination" });
    });

    test("rejects channel without set action", async () => {
        const response = await feature.lfgChannel(GUILD_ID, null, CHANNEL_ID);

        expect(response.kind).toBe(EMessageKind.ERROR);
        expect(response.embeds?.[0]).toMatchObject({ title: "Invalid options combination" });
    });
});
