import { DISCORD_BOT_ABOUT_ME } from "../src/bot/constants.ts";

const tokenKey = "DISCORD_TOKEN";
const token = process.env[tokenKey];
if (!token) {
    throw new Error(`"${tokenKey}" environment variable required`);
}

const response = await fetch("https://discord.com/api/applications/@me", {
    method: "PATCH",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ description: DISCORD_BOT_ABOUT_ME }),
});
const body = await response.text();

console.log(body);
