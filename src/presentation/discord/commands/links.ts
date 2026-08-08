import { heading, hyperlink, unorderedList } from "discord.js";
import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import { createNeutralMessage } from "../../../bot/message.ts";
import type { linksCommandCommandRegistrationData } from "../commandRegistrationData/links.ts";

const response = createNeutralMessage({
    embed: {
        description: [
            heading(hyperlink(`Official Website`, `https://shadows.nintendo.com/en-US/`), 3),
            unorderedList([
                hyperlink(`News`, `https://shadows.nintendo.com/en-US/topics/`),
                hyperlink(`Play guide`, `https://playguide.shadows.nintendo.com/hc/en-us`),
                hyperlink(`FAQ`, `https://faq.shadows.nintendo.com/hc/en-us`),
            ]),
            heading(
                hyperlink(
                    `Customer Support Desk`,
                    `https://faq.shadows.nintendo.com/hc/en-us/articles/47850440925465-Customer-Support-Desk`,
                ),
                3,
            ),
            unorderedList([
                hyperlink(
                    `Request for Bug Investigation`,
                    `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47168453156505`,
                ),
                hyperlink(
                    `Report other users`,
                    `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47168499131417`,
                ),
                hyperlink(`Feedback`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47168543624985`),
                hyperlink(`Inquiries`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47169222846745`),
                hyperlink(
                    `Reporting errors in text`,
                    `https://faq.shadows.nintendo.com/hc/en-us/requests/new?ticket_form_id=47168506399001`,
                ),
                hyperlink(
                    `Requesting a save data investigation`,
                    `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47602687764761`,
                ),
            ]),
            heading(`Socials`, 3),
            unorderedList([
                `x.com: ${hyperlink(`EN`, `https://x.com/FE_Shadows_EN`)}, ${hyperlink(`JP`, `https://x.com/FE_Shadows_JP`)}`,
                `Facebook: ${hyperlink(`EN`, `https://www.facebook.com/FEShadows`)}`,
            ]),
        ].join(`\n`),
    },
});

export function getLinksCommand() {
    return async function (interaction) {
        await interaction.reply(response);
    } satisfies TCommandRunHandlers<typeof linksCommandCommandRegistrationData>;
}
