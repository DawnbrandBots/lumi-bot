export interface IRoom {
    // TODO: Guild ID?
    readonly id: string;
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
}
