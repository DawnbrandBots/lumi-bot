import type { EntityManager } from "@mikro-orm/sqlite";
import type { TLfgPersistence } from "../../../../../application/lfg/persistence.types.ts";
import type { LfgRoom } from "../../models/lfg/room.ts";

export type TLfgPersistenceContext = {
    readonly em: EntityManager;
};

export type TLfgPersistenceFunction<Function extends (...args: never[]) => unknown> = (
    context: TLfgPersistenceContext,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;

export type TLfgRoomEntity = LfgRoom;

export type TLfgPersistenceMap = {
    readonly [Key in keyof TLfgPersistence]: TLfgPersistenceFunction<TLfgPersistence[Key]>;
};
