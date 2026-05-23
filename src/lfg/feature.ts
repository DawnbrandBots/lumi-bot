import type { EntityManager } from "@mikro-orm/sqlite";
import { MessageFlags, userMention } from "discord.js";
import { randomUUID } from "node:crypto";
import { ErrorFeatureResponse, NeutralFeatureResponse, SuccessFeatureResponse } from "../bot/featureResponse.ts";
import type { IFeatureResponse } from "../bot/types.ts";
import { LFG_MAX_ROOM_CODE_LENGTH, LFG_MAX_ROOM_PLAYERS, LFG_MIN_ROOM_CODE_LENGTH } from "./constants.ts";
import { LfgRoom } from "./models/room.ts";
import { LfgRoomPlayer } from "./models/roomPlayer.ts";
import type { LfgUser } from "./types.ts";

type LfgFeatureCtorArg = {
    readonly em: EntityManager;
};

export class LfgFeature {
    private readonly em: EntityManager;

    public constructor({ em }: LfgFeatureCtorArg) {
        this.em = em;
    }

    public async list(guildId: string): Promise<IFeatureResponse> {
        return new NeutralFeatureResponse({
            embed: {
                title: "LFG",
                description: await this.formatList(guildId),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    protected async formatList(guildId: string): Promise<string> {
        const rooms = await this.getRooms(guildId);
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

    public async create(guildId: string, owner: LfgUser, code: string): Promise<IFeatureResponse> {
        if (code.length < LFG_MIN_ROOM_CODE_LENGTH || code.length > LFG_MAX_ROOM_CODE_LENGTH) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Invalid room code",
                    description: `Room codes must be between ${LFG_MIN_ROOM_CODE_LENGTH} and ${LFG_MAX_ROOM_CODE_LENGTH} characters.`,
                },
            });
        }

        const currentPlayer = await this.getRoomPlayerInGuild(guildId, owner.id);
        if (currentPlayer) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Already in a room",
                    description: "Leave your current room before creating a new one.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }
        const existingRoom = await this.getRoomByGuildAndCode(guildId, code);
        if (existingRoom) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Room already exists",
                    description: `Room \`${code}\` already exists.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const room = this.em.create(LfgRoom, {
            id: randomUUID(),
            guildId,
            code,
            ownerId: owner.id,
        });
        const player = this.em.create(LfgRoomPlayer, {
            id: randomUUID(),
            userId: owner.id,
            room,
        });
        room.players.add(player);
        this.em.persist([room, player]);
        await this.em.flush();

        return new SuccessFeatureResponse({
            embed: {
                title: "Room created",
                description: this.formatRoom(room),
            },
        });
    }

    public async join(guildId: string, user: LfgUser, code: string): Promise<IFeatureResponse> {
        const room = await this.getRoomByGuildAndCode(guildId, code);
        if (!room) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Room not found",
                    description: `Room \`${code}\` does not exist.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const currentPlayer = await this.getRoomPlayerInGuild(guildId, user.id);
        if (currentPlayer?.room.id === room.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Already in room",
                    description: this.formatRoom(room),
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        if (room.players.count() >= LFG_MAX_ROOM_PLAYERS) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Room is full",
                    description: `Room \`${code}\` already has ${LFG_MAX_ROOM_PLAYERS} players.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const leftRoomCode = currentPlayer?.room.code;
        if (currentPlayer) {
            this.removePlayerFromRoom(currentPlayer.room, currentPlayer);
            if (currentPlayer.room.players.count() === 0) {
                this.em.remove(currentPlayer.room);
            }
        }
        const player = this.em.create(LfgRoomPlayer, {
            id: randomUUID(),
            userId: user.id,
            room,
        });
        room.players.add(player);
        this.em.persist(player);
        await this.em.flush();

        return new SuccessFeatureResponse({
            embed: {
                title: "Room joined",
                description: `${leftRoomCode ? `Left room \`${leftRoomCode}\`.\n\n` : ""}${this.formatRoom(room)}`,
            },
        });
    }

    public async transfer(guildId: string, owner: LfgUser, target: LfgUser): Promise<IFeatureResponse> {
        // TODO: must replace instance of ErrorFeatureResponse with a discriminated union
        const result = await this.getOwnedRoom(guildId, owner);
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

        const targetPlayer = await this.getRoomPlayerInGuild(guildId, target.id);
        if (targetPlayer?.room.id !== result.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Player not in room",
                    description: `${userMention(target.id)} is not in your room.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        result.ownerId = target.id;
        await this.em.flush();
        return new SuccessFeatureResponse({
            embed: {
                title: "Ownership transferred",
                description: this.formatRoom(result),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    public async kick(guildId: string, owner: LfgUser, target: LfgUser): Promise<IFeatureResponse> {
        const result = await this.getOwnedRoom(guildId, owner);
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

        const targetPlayer = await this.getRoomPlayerInGuild(guildId, target.id);
        if (targetPlayer?.room.id !== result.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Player not in room",
                    description: `${userMention(target.id)} is not in your room.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        this.removePlayerFromRoom(result, targetPlayer);
        await this.em.flush();
        return new SuccessFeatureResponse({
            embed: {
                title: "Player kicked",
                description: this.formatRoom(result),
            },
        });
    }

    public async leave(guildId: string, user: LfgUser): Promise<IFeatureResponse> {
        const player = await this.getRoomPlayerInGuild(guildId, user.id);
        if (!player) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Not in a room",
                    description: "Join or create a room first.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const room = player.room;
        const code = room.code;
        this.removePlayerFromRoom(room, player);

        const title = "Room left";
        if (room.players.count() === 0) {
            this.em.remove(room);
            await this.em.flush();
            return new SuccessFeatureResponse({
                embed: {
                    title,
                    description: `Left room \`${code}\`. The room was deleted because it is empty.`,
                },
            });
        }

        await this.em.flush();
        return new SuccessFeatureResponse({
            embed: {
                title,
                description: this.formatRoom(room),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    protected async getOwnedRoom(guildId: string, owner: LfgUser): Promise<LfgRoom | ErrorFeatureResponse> {
        const player = await this.getRoomPlayerInGuild(guildId, owner.id);
        if (!player) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Not in a room",
                    description: "Join or create a room first.",
                },
            });
        }
        if (player.room.ownerId !== owner.id) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Not room owner",
                    description: "Only the room owner can do that.",
                },
            });
        }
        return player.room;
    }

    protected async getRoomByGuildAndCode(guildId: string, code: string): Promise<LfgRoom | null> {
        return this.em.findOne(LfgRoom, { guildId, code }, { populate: ["players"] });
    }

    protected async getRoomPlayerInGuild(guildId: string, userId: string): Promise<LfgRoomPlayer | null> {
        return this.em.findOne(LfgRoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    }

    protected async getRooms(guildId: string): Promise<LfgRoom[]> {
        // TODO: good use case for query builder here?
        return this.em.find(LfgRoom, { guildId }, { orderBy: { createdAt: "asc" }, populate: ["players"] });
    }

    protected removePlayerFromRoom(room: LfgRoom, player: LfgRoomPlayer): void {
        this.em.remove(player);
        room.players.remove(player);
        const remainingPlayers = room.players;
        if (room.ownerId === player.userId && remainingPlayers[0]) {
            room.ownerId = remainingPlayers[0].userId;
        }
    }

    protected formatRoom(room: LfgRoom): string {
        return `\`${room.code}\`: ${this.formatPlayers(room)}`;
    }

    protected formatPlayers(room: LfgRoom): string {
        return room.players
            .toArray()
            .toSorted((a, b) => (a.userId === room.ownerId ? -1 : b.userId === room.ownerId ? 1 : 0)) // owner first
            .map((player) => `${userMention(player.userId)}${player.userId === room.ownerId ? " (owner)" : ""}`)
            .join(", ");
    }
}
