import type { IListing } from "../../domain/bazaar/models/listing.types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TBazaarResultTypes, TListableItemReference } from "./types.ts";

export type TBazaarUseCaseArgs = {
    readonly upsertListing: {
        readonly guildId: string;
        readonly ownerId: string;
        readonly side: IListing["side"];
        readonly item: TListableItemReference;
        readonly quantity?: number | null;
        readonly unitPrice?: number | null;
    };
    readonly deleteListing: {
        readonly guildId: string;
        readonly ownerId: string;
        readonly side: IListing["side"];
        readonly item: TListableItemReference;
    };
    readonly listListings: {
        readonly guildId: string;
        readonly side: IListing["side"];
        readonly ownerId?: string;
        readonly item?: TListableItemReference;
    };
};

export type TBazaarUseCases = {
    readonly [Name in keyof TBazaarUseCaseArgs]: (
        arg: TBazaarUseCaseArgs[Name],
    ) => MaybePromise<TBazaarResultTypes[Name]>;
};
