import type { EntityManager } from "@mikro-orm/sqlite";
import type { TLfgUseCase, TWithLfgUnitOfWork } from "../../../application/lfg/types.ts";
import { changeRoomCodeInRoom } from "../../../application/lfg/services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "../../../application/lfg/services/getOwnedRoom.ts";
import { kickFromRoom } from "../../../application/lfg/services/kickFromRoom.ts";
import { removePlayerFromRoom } from "../../../application/lfg/services/removePlayerFromRoom.ts";
import { transferRoom } from "../../../application/lfg/services/transferRoom.ts";
import { getLfgPersistence } from "../../../infrastructure/database/mikroOrm/repositories/lfg/persistence.ts";

export function getWithLfgUnitOfWork(em: EntityManager): TWithLfgUnitOfWork {
    return <Arg, Return>(useCase: TLfgUseCase<Arg, Return>) =>
        async (arg: Arg): Promise<Return> =>
        em.transactional(async (transactionalEm) => {
            const persistence = getLfgPersistence({ em: transactionalEm });
            const result = await useCase(
                {
                    ...persistence,
                    changeRoomCodeInRoom: (serviceArg) => changeRoomCodeInRoom(persistence, serviceArg),
                    getOwnedRoom: (serviceArg) => getOwnedRoom(persistence, serviceArg),
                    kickFromRoom: (serviceArg) =>
                        kickFromRoom(
                            {
                                findRoomByUser: persistence.findRoomByUser,
                                removePlayerFromRoom: (removePlayerArg) =>
                                    removePlayerFromRoom(persistence, removePlayerArg),
                            },
                            serviceArg,
                        ),
                    removePlayerFromRoom: (serviceArg) => removePlayerFromRoom(persistence, serviceArg),
                    transferRoom: (serviceArg) => transferRoom(persistence, serviceArg),
                },
                arg,
            );
            await transactionalEm.flush();
            return result;
        });
}
