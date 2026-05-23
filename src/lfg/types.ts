export type LfgUser = {
    readonly id: string;
};

export type LfgRoom = {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
};
