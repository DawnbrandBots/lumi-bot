import { ApplicationsAPI } from "@discordjs/core/http-only";
import { REST } from "discord.js";
import { DISCORD_TOKEN } from "../src/env.ts";
import { DISCORD_BOT_ABOUT_ME } from "../src/presentation/discord/constants.ts";

const rest = new REST().setToken(DISCORD_TOKEN);
const api = new ApplicationsAPI(rest);
const reply = await api.editCurrent({ description: DISCORD_BOT_ABOUT_ME });

console.log(reply);
