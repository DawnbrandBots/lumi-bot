import { Type } from "@mikro-orm/sqlite";
import { EDirection, type IDirection } from "../types.ts";

export class Direction implements IDirection {
    readonly id: IDirection["id"];
    readonly noun: IDirection["noun"];

    public constructor({ id, noun }: { readonly id: IDirection["id"]; readonly noun: IDirection["noun"] }) {
        this.id = id;
        this.noun = noun;
    }
}

const DIRECTIONS = {
    UP: new Direction({ id: EDirection.UP, noun: "up" }),
    DOWN: new Direction({ id: EDirection.DOWN, noun: "down" }),
} as const satisfies { [K in EDirection]: IDirection };

export class DirectionType extends Type<Direction, string | null | undefined> {
    public convertToDatabaseValue(value: Direction | null | undefined): string | null | undefined {
        return value?.id;
    }

    public convertToJSValue(value: string): Direction {
        if (value in DIRECTIONS) {
            return DIRECTIONS[value as keyof typeof DIRECTIONS];
        }
        throw new Error("Invalid direction id");
    }
}
