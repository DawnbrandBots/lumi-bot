export const EDirection = {
    UP: "UP",
    DOWN: "DOWN",
} as const;

/** For movement spells. Eg. UP and DOWN. */
export interface IDirection {
    readonly id: keyof typeof EDirection;
    readonly noun: string;
}
