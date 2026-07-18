import type { EntityManager } from "@mikro-orm/sqlite";
import { randomUUID } from "node:crypto";
import { LFG_MAX_ROOM_CODE_LENGTH, LFG_MAX_ROOM_PLAYERS, LFG_MIN_ROOM_CODE_LENGTH } from "./constants.ts";
import { LfgRoom } from "./models/room.ts";
import { LfgRoomPlayer } from "./models/roomPlayer.ts";
import type { TLfgPlayerRemovalResult } from "./types.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind, type ILfgFeature, type IRoom, type IUser } from "./types.ts";

type LfgFeatureCtorArg = {
    readonly em: EntityManager;
};

export class LfgFeature implements ILfgFeature {
    private readonly em: EntityManager;

    public constructor({ em }: LfgFeatureCtorArg) {
        this.em = em;
    }

    public async status(guildId: string) {
        return {
            kind: ELfgFeatureReturnKind.ROOMS_LISTED,
            value: { rooms: (await this.getRooms(guildId)).map((room) => this.toRoom(room)) },
        } as const;
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
        await this.em.flush();

        return {
            kind: ELfgFeatureReturnKind.ROOM_CREATED,
            value: { userId: owner.id, room: this.toRoom(room) },
        } as const;
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
        }
        const player = this.em.create(LfgRoomPlayer, {
            id: randomUUID(),
            userId: user.id,
            room,
        });
        room.players.add(player);
        await this.em.flush();

        return {
            kind: ELfgFeatureReturnKind.ROOM_JOINED,
            value: { userId: user.id, room: this.toRoom(room), leftRoomCode },
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
            value: { userId: owner.id, targetId: target.id, room: this.toRoom(result) },
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
        return {
            kind: ELfgFeatureReturnKind.PLAYER_KICKED,
            value: { userId: owner.id, targetId: target.id, room: this.toRoom(result) },
        } as const;
    }

    public async leave(guildId: string, user: IUser) {
        const player = await this.getRoomPlayerInGuild(guildId, user.id);
        if (!player) {
            return { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } as const;
        }

        const room = player.room;
        const code = room.code;
        const leaveResult = this.removePlayerFromRoom(room, player);
        await this.em.flush();
        return { kind: ELfgFeatureReturnKind.ROOM_LEFT, value: { ...leaveResult, userId: user.id, code } } as const;
    }

    public async disband(guildId: string, user: IUser) {
        const result = await this.getOwnedRoom(guildId, user);
        if ("kind" in result) {
            return result;
        }

        this.em.remove(result.players);
        this.em.remove(result);
        await this.em.flush();

        return { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: { userId: user.id, code: result.code } } as const;
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

    protected removePlayerFromRoom(room: LfgRoom, player: LfgRoomPlayer): TLfgPlayerRemovalResult {
        this.em.remove(player);
        const anotherPlayerInTheRoom = room.players.find((p) => p.userId !== player.userId);
        if (!anotherPlayerInTheRoom) {
            this.em.remove(room);
            return { kind: ELfgPlayerRemovalKind.ROOM_DELETED };
        }
        if (room.ownerId === player.userId && anotherPlayerInTheRoom) {
            room.ownerId = anotherPlayerInTheRoom.userId;
            return { kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED, newOwnerId: room.ownerId };
        }
        return { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY };
    }

    protected toRoom(room: LfgRoom): IRoom {
        return {
            code: room.code,
            ownerId: room.ownerId,
            playerIds: room.players.toArray().map((player) => player.userId),
        };
    }
}
