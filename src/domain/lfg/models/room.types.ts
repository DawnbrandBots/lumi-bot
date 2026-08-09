export interface IRoom {
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
}
