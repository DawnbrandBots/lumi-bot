const DISCORD_TOKEN_KEY = "DISCORD_TOKEN";

const _MAYBE_DISCORD_TOKEN = process.env[DISCORD_TOKEN_KEY];
if (!_MAYBE_DISCORD_TOKEN) {
    throw new Error(`"${DISCORD_TOKEN_KEY}" environment variable required`);
}

export const DISCORD_TOKEN = _MAYBE_DISCORD_TOKEN;
