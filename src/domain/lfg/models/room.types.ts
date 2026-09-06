export interface IRoom {
    readonly id: string;
    readonly code: string;
    readonly ownerId: string;
    readonly playerIds: readonly string[];
}
