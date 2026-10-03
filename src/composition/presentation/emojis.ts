import type { ApplicationsAPI } from "@discordjs/core/http-only";
import { createGetEmoji, type TGetEmoji } from "../../presentation/discord/emojis.ts";

export async function composeGetEmoji(arg: { readonly applicationsApi: ApplicationsAPI }): Promise<TGetEmoji> {
    const application = await arg.applicationsApi.getCurrent();
    const { items: emojis } = await arg.applicationsApi.getEmojis(application.id);

    return createGetEmoji(emojis);
}
