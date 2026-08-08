import type { EntityManager } from "@mikro-orm/sqlite";
import { LfgRoom } from "../../lfg/models/room.ts";

export async function getRoomEntityById(
    { em }: { readonly em: EntityManager },
    { roomId }: { readonly roomId: string },
): Promise<LfgRoom> {
    const room = await em.findOne(LfgRoom, { id: roomId }, { populate: ["players"] });
    if (!room) {
        throw new Error(`LFG room not found: ${roomId}`);
    }
    return room;
}
