import type { TListableItem } from "../../domain/bazaar/models/listableItem.types.ts";
import type { IListing } from "../../domain/bazaar/models/listing.types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TListableItemReference } from "./types.ts";

export type TBazaarListingIdentity = {
    readonly guildId: string;
    readonly ownerId: string;
    readonly side: IListing["side"];
    readonly item: TListableItemReference;
};

export type TBazaarRepository = {
    /**
     * Atomically creates or updates a listing.
     *
     * For a missing listing, omitted terms are stored as null. For an existing listing, omitted
     * terms retain their current values. The implementation must not update timestamps when the
     * resulting terms equal the existing terms.
     */
    readonly upsertListing: (arg: {
        readonly identity: Omit<TBazaarListingIdentity, "item">;
        readonly item: TListableItem;
        readonly quantity?: number | null;
        readonly unitPrice?: number | null;
    }) => MaybePromise<{
        readonly previous: IListing | null;
        readonly current: IListing;
    }>;
    /** Atomically deletes and returns the matching listing, or returns null when none exists. */
    readonly deleteListing: (identity: TBazaarListingIdentity) => MaybePromise<IListing | null>;
    readonly listListings: (filter: {
        readonly guildId: string;
        readonly side: IListing["side"];
        readonly ownerId?: string;
        readonly item?: TListableItemReference;
    }) => MaybePromise<readonly IListing[]>;
};
