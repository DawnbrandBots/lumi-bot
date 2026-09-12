import type { TListableItem } from "./listableItem.types.ts";

export const EListingSide = {
    PURCHASE: "PURCHASE",
    SALE: "SALE",
} as const;

export interface IListing {
    readonly guildId: string;
    readonly ownerId: string;
    readonly item: TListableItem;
    readonly side: (typeof EListingSide)[keyof typeof EListingSide];
    readonly unitPrice: number | null;
    readonly quantity: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
