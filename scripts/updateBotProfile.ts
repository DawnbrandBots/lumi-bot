import { REST, Routes } from "discord.js";
import { DISCORD_BOT_ABOUT_ME } from "../src/bot/constants.ts";

const tokenKey = "DISCORD_TOKEN";
const token = process.env[tokenKey];
if (!token) {
    throw new Error(`"${tokenKey}" environment variable required`);
}

const api = new REST().setToken(token);
const body = await api.patch(Routes.currentApplication(), {
    body: { description: DISCORD_BOT_ABOUT_ME },
});

console.log(body);
