import { hyperlink } from "discord.js";

export const LINKS_COMMAND_NAME = `links`;

export const LINKS_RESPONSE_DESCRIPTION = [
    `### ${hyperlink(`Official Website`, `https://shadows.nintendo.com/en-US/`)}`,
    `- ${hyperlink(`News`, `https://shadows.nintendo.com/en-US/topics/`)}`,
    `- ${hyperlink(`Play guide`, `https://playguide.shadows.nintendo.com/hc/en-us`)}`,
    `- ${hyperlink(`FAQ`, `https://faq.shadows.nintendo.com/hc/en-us`)}`,
    `### ${hyperlink(`Customer Support Desk`, `https://faq.shadows.nintendo.com/hc/en-us/articles/47850440925465-Customer-Support-Desk`)}`,
    `- ${hyperlink(`Request for Bug Investigation`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47168453156505`)}`,
    `- ${hyperlink(`Report other users`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47168499131417`)}`,
    `- ${hyperlink(`Feedback`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47168543624985`)}`,
    `- ${hyperlink(`Inquiries`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47169222846745`)}`,
    `- ${hyperlink(`Reporting errors in text`, `https://faq.shadows.nintendo.com/hc/en-us/requests/new?ticket_form_id=47168506399001`)}`,
    `- ${hyperlink(`Requesting a save data investigation`, `https://faq.shadows.nintendo.com/hc/requests/new?ticket_form_id=47602687764761`)}`,
    `### Socials`,
    `- x.com: ${hyperlink(`EN`, `https://x.com/FE_Shadows_EN`)}, ${hyperlink(`JP`, `https://x.com/FE_Shadows_JP`)}`,
    `- Facebook: ${hyperlink(`EN`, `https://www.facebook.com/FEShadows`)}`,
].join(`\n`);
