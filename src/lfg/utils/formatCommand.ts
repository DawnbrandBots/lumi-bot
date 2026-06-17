import { inlineCode } from "discord.js";

type CommandParts = readonly [string] | readonly [string, string] | readonly [string, string, string];

function formatCommand<const T extends readonly [string]>(parts: T): `/${T[0]}`;
function formatCommand<const T extends readonly [string, string]>(parts: T): `/${T[0]} ${T[1]}`;
function formatCommand<const T extends readonly [string, string, string]>(parts: T): `/${T[0]} ${T[1]} ${T[2]}`;
function formatCommand(parts: CommandParts): string {
    return inlineCode(`/${parts.join(" ")}`);
}

export default formatCommand;
