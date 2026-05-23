import { MessageFlags, userMention } from "discord.js";
import { ErrorFeatureResponse, NeutralFeatureResponse, SuccessFeatureResponse } from "../bot/featureResponse.ts";
import type { IFeatureResponse } from "../bot/types.ts";
import { LFG_MAX_ROOM_CODE_LENGTH, LFG_MAX_ROOM_PLAYERS, LFG_MIN_ROOM_CODE_LENGTH } from "./constants.ts";
import type { LfgRoom, LfgUser } from "./types.ts";

type MutableLfgRoom = {
    -readonly [K in keyof LfgRoom]: LfgRoom[K] extends ReadonlyArray<infer U> ? U[] : LfgRoom[K];
};

type GuildLfgState = {
    roomsByCode: Map<string, MutableLfgRoom>;
    roomCodeByPlayerId: Map<string, string>;
};

export class LfgFeature {
    protected readonly statesByGuildId = new Map<string, GuildLfgState>();

    public list(guildId: string): IFeatureResponse {
        return new NeutralFeatureResponse({
            embed: {
                title: "LFG",
                description: this.formatList(guildId),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    protected formatList(guildId: string): string {
        const rooms = this.getRooms(guildId);
        const roomLines =
            rooms.length === 0
                ? ["No active rooms."]
                : rooms.map((room) => `- \`${room.code}\`: ${this.formatPlayers(room)}`);
        return `**Rooms:**\n\n${roomLines.join("\n")}`;
    }

    public help(): IFeatureResponse {
        // TODO: this description must be generated from command info eventually
        const description = [
            "**Commands:**",
            "",
            "- `/lfg create`: Create a room.",
            "- `/lfg join`: Join a room.",
            "- `/lfg transfer`: Transfer room ownership.",
            "- `/lfg kick`: Kick a player from your room.",
            "- `/lfg leave`: Leave your current room.",
            "- `/lfg list`: Display active rooms.",
            "- `/lfg help`: Display this command list.",
        ].join("\n");

        return new NeutralFeatureResponse({
            embed: {
                title: "LFG",
                description: description,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    public create(guildId: string, owner: LfgUser, code: string): IFeatureResponse {
        if (code.length < LFG_MIN_ROOM_CODE_LENGTH || code.length > LFG_MAX_ROOM_CODE_LENGTH) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Invalid room code",
                    description: `Room codes must be between ${LFG_MIN_ROOM_CODE_LENGTH} and ${LFG_MAX_ROOM_CODE_LENGTH} characters.`,
                },
            });
        }

        const state = this.getGuildState(guildId);
        if (state.roomCodeByPlayerId.has(owner.id)) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Already in a room",
                    description: "Leave your current room before creating a new one.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }
        if (state.roomsByCode.has(code)) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Room already exists",
                    description: `Room \`${code}\` already exists.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const room = { code, ownerId: owner.id, playerIds: [owner.id] };
        state.roomsByCode.set(code, room);
        state.roomCodeByPlayerId.set(owner.id, code);

        return new SuccessFeatureResponse({
            embed: {
                title: "Room created",
                description: this.formatRoom(room),
            },
        });
    }

    public join(guildId: string, user: LfgUser, code: string): IFeatureResponse {
        const state = this.getGuildState(guildId);
        const room = state.roomsByCode.get(code);
        if (!room) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Room not found",
                    description: `Room \`${code}\` does not exist.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const currentCode = state.roomCodeByPlayerId.get(user.id);
        if (currentCode === code) {
            return new NeutralFeatureResponse({
                embed: {
                    title: "Already in room",
                    description: this.formatRoom(room),
                },
                flags: [MessageFlags.Ephemeral],
            });
        }
        if (room.playerIds.length >= LFG_MAX_ROOM_PLAYERS) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Room is full",
                    description: `Room \`${code}\` already has ${LFG_MAX_ROOM_PLAYERS} players.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const leftRoomCode = currentCode;
        if (currentCode) {
            this.removePlayerFromCurrentRoom(state, user.id);
        }
        room.playerIds.push(user.id);
        state.roomCodeByPlayerId.set(user.id, code);

        return new SuccessFeatureResponse({
            embed: {
                title: "Room joined",
                description: `${leftRoomCode ? `Left room \`${leftRoomCode}\`.\n\n` : ""}${this.formatRoom(room)}`,
            },
        });
    }

    public transfer(guildId: string, owner: LfgUser, target: LfgUser): IFeatureResponse {
        // TODO: must replace instance of ErrorFeatureResponse with a discriminated union
        const result = this.getOwnedRoom(guildId, owner);
        if (result instanceof ErrorFeatureResponse) {
            return result;
        }
        if (owner.id === target.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Cannot transfer to yourself",
                    description: "Choose another player in your room.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }
        if (!result.room.playerIds.includes(target.id)) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Player not in room",
                    description: `${userMention(target.id)} is not in your room.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        result.room.ownerId = target.id;
        return new SuccessFeatureResponse({
            embed: {
                title: "Ownership transferred",
                description: this.formatRoom(result.room),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    public kick(guildId: string, owner: LfgUser, target: LfgUser): IFeatureResponse {
        const result = this.getOwnedRoom(guildId, owner);
        if (result instanceof ErrorFeatureResponse) {
            return result;
        }
        if (owner.id === target.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Cannot kick yourself",
                    description: "Use `/lfg leave` to leave your room.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }
        if (!result.room.playerIds.includes(target.id)) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Player not in room",
                    description: `${userMention(target.id)} is not in your room.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        this.removePlayerFromRoom(result.state, result.room, target.id);
        return new SuccessFeatureResponse({
            embed: {
                title: "Player kicked",
                description: this.formatRoom(result.room),
            },
        });
    }

    public leave(guildId: string, user: LfgUser): IFeatureResponse {
        const state = this.getGuildState(guildId);
        const room = this.getCurrentRoom(state, user.id);
        if (!room) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Not in a room",
                    description: "Join or create a room first.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const code = room.code;
        this.removePlayerFromRoom(state, room, user.id);

        const title = "Room left";
        if (room.playerIds.length === 0) {
            state.roomsByCode.delete(code);
            return new SuccessFeatureResponse({
                embed: {
                    title,
                    description: `Left room \`${code}\`. The room was deleted because it is empty.`,
                },
            });
        }

        return new SuccessFeatureResponse({
            embed: {
                title,
                description: this.formatRoom(room),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    public getRooms(guildId: string): readonly LfgRoom[] {
        return Array.from(this.getGuildState(guildId).roomsByCode.values());
    }

    protected getOwnedRoom(
        guildId: string,
        owner: LfgUser,
    ): { room: MutableLfgRoom; state: GuildLfgState } | ErrorFeatureResponse {
        const state = this.getGuildState(guildId);
        const room = this.getCurrentRoom(state, owner.id);
        if (!room) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Not in a room",
                    description: "Join or create a room first.",
                },
            });
        }
        if (room.ownerId !== owner.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Not room owner",
                    description: "Only the room owner can do that.",
                },
            });
        }
        return { room, state };
    }

    protected getGuildState(guildId: string): GuildLfgState {
        let state = this.statesByGuildId.get(guildId);
        if (!state) {
            state = { roomsByCode: new Map(), roomCodeByPlayerId: new Map() };
            this.statesByGuildId.set(guildId, state);
        }
        return state;
    }

    protected getCurrentRoom(state: GuildLfgState, userId: string): MutableLfgRoom | undefined {
        const code = state.roomCodeByPlayerId.get(userId);
        return code ? state.roomsByCode.get(code) : undefined;
    }

    protected removePlayerFromCurrentRoom(state: GuildLfgState, userId: string): void {
        const room = this.getCurrentRoom(state, userId);
        if (!room) {
            return;
        }
        this.removePlayerFromRoom(state, room, userId);
        if (room.playerIds.length === 0) {
            state.roomsByCode.delete(room.code);
        }
    }

    protected removePlayerFromRoom(state: GuildLfgState, room: MutableLfgRoom, userId: string): void {
        room.playerIds = room.playerIds.filter((playerId) => playerId !== userId);
        state.roomCodeByPlayerId.delete(userId);
        if (room.ownerId === userId && room.playerIds[0]) {
            room.ownerId = room.playerIds[0];
        }
    }

    protected formatRoom(room: MutableLfgRoom | LfgRoom): string {
        return `\`${room.code}\`: ${this.formatPlayers(room)}`;
    }

    protected formatPlayers(room: MutableLfgRoom | LfgRoom): string {
        return room.playerIds
            .toSorted((a, b) => (a === room.ownerId ? -1 : b === room.ownerId ? 1 : 0)) // owner first
            .map((playerId) => `${userMention(playerId)}${playerId === room.ownerId ? " (owner)" : ""}`)
            .join(", ");
    }
}
