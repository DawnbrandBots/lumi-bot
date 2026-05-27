import type { EntityManager } from "@mikro-orm/sqlite";
import { MessageFlags, userMention } from "discord.js";
import { randomUUID } from "node:crypto";
import { ErrorFeatureResponse, NeutralFeatureResponse, SuccessFeatureResponse } from "../bot/featureResponse.ts";
import {
    LFG_CREATE_SUBCOMMAND_DESCRIPTION,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_DESCRIPTION,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_DESCRIPTION,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_DESCRIPTION,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_DESCRIPTION,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_DESCRIPTION,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_LIST_SUBCOMMAND_DESCRIPTION,
    LFG_LIST_SUBCOMMAND_NAME,
    LFG_MAX_ROOM_CODE_LENGTH,
    LFG_MAX_ROOM_PLAYERS,
    LFG_MIN_ROOM_CODE_LENGTH,
    LFG_TRANSFER_SUBCOMMAND_DESCRIPTION,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";
import { Room } from "./models/room.ts";
import { RoomPlayer } from "./models/roomPlayer.ts";
import type { ILfgFeature, IUser } from "./types.ts";

type LfgFeatureCtorArg = {
    readonly em: EntityManager;
};

export class LfgFeature implements ILfgFeature {
    private readonly em: EntityManager;

    public constructor({ em }: LfgFeatureCtorArg) {
        this.em = em;
    }

    public async list(guildId: string) {
        return new NeutralFeatureResponse({
            embed: {
                title: "LFG Rooms",
                description: await this.formatList(guildId),
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    protected async formatList(guildId: string) {
        const rooms = await this.getRooms(guildId);
        if (rooms.length === 0) {
            return "No active rooms. :(";
        }
        return rooms.map((room) => `- \`${room.code}\`: ${this.formatRoomPlayers(room)}`).join("\n");
    }

    public help() {
        // TODO: this description must be generated from command info eventually
        const description = [
            `- \`/lfg ${LFG_CREATE_SUBCOMMAND_NAME}\`: ${LFG_CREATE_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_JOIN_SUBCOMMAND_NAME}\`: ${LFG_JOIN_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_TRANSFER_SUBCOMMAND_NAME}\`: ${LFG_TRANSFER_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_KICK_SUBCOMMAND_NAME}\`: ${LFG_KICK_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_LEAVE_SUBCOMMAND_NAME}\`: ${LFG_LEAVE_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_DISBAND_SUBCOMMAND_NAME}\`: ${LFG_DISBAND_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_LIST_SUBCOMMAND_NAME}\`: ${LFG_LIST_SUBCOMMAND_DESCRIPTION}`,
            `- \`/lfg ${LFG_HELP_SUBCOMMAND_NAME}\`: ${LFG_HELP_SUBCOMMAND_DESCRIPTION}`,
        ].join("\n");

        return new NeutralFeatureResponse({
            embed: {
                title: "LFG Commands",
                description: description,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    public async create(guildId: string, owner: IUser, code: string) {
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

        const room = this.em.create(Room, {
            id: randomUUID(),
            guildId,
            code,
            ownerId: owner.id,
        });
        const player = this.em.create(RoomPlayer, {
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

    public async join(guildId: string, user: IUser, code: string) {
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
        const player = this.em.create(RoomPlayer, {
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

    public async transfer(guildId: string, owner: IUser, target: IUser) {
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

    public async kick(guildId: string, owner: IUser, target: IUser) {
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

    public async leave(guildId: string, user: IUser) {
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

    public async disband(guildId: string, user: IUser) {
        const result = await this.getOwnedRoom(guildId, user);
        if (result instanceof ErrorFeatureResponse) {
            return result;
        }

        this.em.remove(result.players);
        this.em.remove(result);
        await this.em.flush();

        return new SuccessFeatureResponse({
            embed: {
                title: "Room disbanded",
                description: `Room \`${result.code}\` was deleted.`,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    protected async getOwnedRoom(guildId: string, owner: IUser): Promise<Room | ErrorFeatureResponse> {
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

    protected async getRoomByGuildAndCode(guildId: string, code: string): Promise<Room | null> {
        return this.em.findOne(Room, { guildId, code }, { populate: ["players"] });
    }

    protected async getRoomPlayerInGuild(guildId: string, userId: string): Promise<RoomPlayer | null> {
        return this.em.findOne(RoomPlayer, { userId, room: { guildId } }, { populate: ["room.players"] });
    }

    protected async getRooms(guildId: string): Promise<Room[]> {
        // TODO: good use case for query builder here?
        return this.em.find(Room, { guildId }, { orderBy: { createdAt: "asc" }, populate: ["players"] });
    }

    protected removePlayerFromRoom(room: Room, player: RoomPlayer): void {
        this.em.remove(player);
        const anotherPlayerInTheRoom = room.players.find((p) => p.userId !== player.userId);
        if (room.ownerId === player.userId && anotherPlayerInTheRoom) {
            room.ownerId = anotherPlayerInTheRoom.userId;
        }
    }

    protected formatRoom(room: Room): string {
        return `\`${room.code}\`: ${this.formatRoomPlayers(room)}`;
    }

    protected formatRoomPlayers(room: Room): string {
        return room.players
            .toArray()
            .toSorted((a, b) => (a.userId === room.ownerId ? -1 : b.userId === room.ownerId ? 1 : 0)) // owner first
            .map((player) => `${userMention(player.userId)}${player.userId === room.ownerId ? " (owner)" : ""}`)
            .join(", ");
    }
}
