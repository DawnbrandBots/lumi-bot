export const enum ELfgPlayerRemovalKind {
    LEFT_ROOM_NORMALLY = "LEFT_ROOM_NORMALLY",
    OWNERSHIP_TRANSFERRED = "OWNERSHIP_TRANSFERRED",
    ROOM_DELETED = "ROOM_DELETED",
}

export type TLfgPlayerRemovalResult =
    | {
          readonly kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY | ELfgPlayerRemovalKind.ROOM_DELETED;
      }
    | {
          readonly kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED;
          readonly newOwnerId: string;
      };
