import type { EntityManager } from "@mikro-orm/sqlite";
import { randomUUID } from "node:crypto";
import {
    LFG_COMMAND_NAME,
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
import { ELfgFeatureReturnKind, type ILfgFeature, type IRoom, type IUser } from "./types.ts";

type LfgFeatureCtorArg = {
    readonly em: EntityManager;
};

export class LfgFeature implements ILfgFeature {
    private readonly em: EntityManager;

    public constructor({ em }: LfgFeatureCtorArg) {
        this.em = em;
    }

    public async list(guildId: string) {
        return {
            kind: ELfgFeatureReturnKind.ROOMS_LISTED,
            value: { rooms: (await this.getRooms(guildId)).map((room) => this.toRoom(room)) },
        } as const;
    }

    public help() {
        // TODO: this description must be generated from command info eventually (https://github.com/DawnbrandBots/lumi-bot/issues/37)
        const description = [
            `- \`/${LFG_COMMAND_NAME} ${LFG_CREATE_SUBCOMMAND_NAME}\`: ${LFG_CREATE_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_JOIN_SUBCOMMAND_NAME}\`: ${LFG_JOIN_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_TRANSFER_SUBCOMMAND_NAME}\`: ${LFG_TRANSFER_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_KICK_SUBCOMMAND_NAME}\`: ${LFG_KICK_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_LEAVE_SUBCOMMAND_NAME}\`: ${LFG_LEAVE_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_DISBAND_SUBCOMMAND_NAME}\`: ${LFG_DISBAND_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_LIST_SUBCOMMAND_NAME}\`: ${LFG_LIST_SUBCOMMAND_DESCRIPTION}`,
            `- \`/${LFG_COMMAND_NAME} ${LFG_HELP_SUBCOMMAND_NAME}\`: ${LFG_HELP_SUBCOMMAND_DESCRIPTION}`,
        ].join("\n");

        return { kind: ELfgFeatureReturnKind.HELP, value: { description } } as const;
    }

    public async create(guildId: string, owner: IUser, code: string) {
        if (code.length < LFG_MIN_ROOM_CODE_LENGTH || code.length > LFG_MAX_ROOM_CODE_LENGTH) {
            return { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE } as const;
        }

        const currentPlayer = await this.getRoomPlayerInGuild(guildId, owner.id);
        if (currentPlayer) {
            return { kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM } as const;
        }
        const existingRoom = await this.getRoomByGuildAndCode(guildId, code);
        if (existingRoom) {
            return { kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS, value: { code } } as const;
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
        await this.em.flush();

        return { kind: ELfgFeatureReturnKind.ROOM_CREATED, value: { room: this.toRoom(room) } } as const;
    }

    public async join(guildId: string, user: IUser, code: string) {
        const room = await this.getRoomByGuildAndCode(guildId, code);
        if (!room) {
            return { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code } } as const;
        }

        const currentPlayer = await this.getRoomPlayerInGuild(guildId, user.id);
        if (currentPlayer?.room.id === room.id) {
            return {
                kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM,
                value: { room: this.toRoom(room) },
            } as const;
        }

        if (room.players.count() >= LFG_MAX_ROOM_PLAYERS) {
            return { kind: ELfgFeatureReturnKind.ROOM_IS_FULL, value: { code } } as const;
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
        await this.em.flush();

        return {
            kind: ELfgFeatureReturnKind.ROOM_JOINED,
            value: { room: this.toRoom(room), leftRoomCode },
        } as const;
    }

    public async transfer(guildId: string, owner: IUser, target: IUser) {
        const result = await this.getOwnedRoom(guildId, owner);
        if ("kind" in result) {
            return result;
        }
        if (owner.id === target.id) {
            return { kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF } as const;
        }

        const targetPlayer = await this.getRoomPlayerInGuild(guildId, target.id);
        if (targetPlayer?.room.id !== result.id) {
            return { kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM, value: { targetId: target.id } } as const;
        }

        result.ownerId = target.id;
        await this.em.flush();
        return {
            kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED,
            value: { room: this.toRoom(result) },
        } as const;
    }

    public async kick(guildId: string, owner: IUser, target: IUser) {
        const result = await this.getOwnedRoom(guildId, owner);
        if ("kind" in result) {
            return result;
        }
        if (owner.id === target.id) {
            return { kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF } as const;
        }

        const targetPlayer = await this.getRoomPlayerInGuild(guildId, target.id);
        if (targetPlayer?.room.id !== result.id) {
            return { kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM, value: { targetId: target.id } } as const;
        }

        this.removePlayerFromRoom(result, targetPlayer);
        await this.em.flush();
        return { kind: ELfgFeatureReturnKind.PLAYER_KICKED, value: { room: this.toRoom(result) } } as const;
    }

    public async leave(guildId: string, user: IUser) {
        const player = await this.getRoomPlayerInGuild(guildId, user.id);
        if (!player) {
            return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } as const;
        }

        const room = player.room;
        const code = room.code;
        this.removePlayerFromRoom(room, player);

        if (room.players.count() === 0) {
            this.em.remove(room);
            await this.em.flush();
            return { kind: ELfgFeatureReturnKind.ROOM_LEFT_AND_DELETED, value: { code } } as const;
        }

        await this.em.flush();
        return { kind: ELfgFeatureReturnKind.ROOM_LEFT, value: { room: this.toRoom(room) } } as const;
    }

    public async disband(guildId: string, user: IUser) {
        const result = await this.getOwnedRoom(guildId, user);
        if ("kind" in result) {
            return result;
        }

        this.em.remove(result.players);
        this.em.remove(result);
        await this.em.flush();

        return { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: { code: result.code } } as const;
    }

    protected async getOwnedRoom(guildId: string, owner: IUser) {
        const player = await this.getRoomPlayerInGuild(guildId, owner.id);
        if (!player) {
            return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } as const;
        }
        if (player.room.ownerId !== owner.id) {
            return { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER } as const;
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

    protected toRoom(room: Room): IRoom {
        return {
            code: room.code,
            ownerId: room.ownerId,
            playerIds: room.players.toArray().map((player) => player.userId),
        };
    }
}
