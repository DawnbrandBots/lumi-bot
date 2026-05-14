import { Type } from "@mikro-orm/sqlite";
import type { IStatChange, TStatChange } from "../types.ts";

export class StatChange implements IStatChange {
    readonly id: IStatChange["id"];
    readonly verb: IStatChange["verb"];

    public constructor({ id, verb }: { readonly id: IStatChange["id"]; readonly verb: IStatChange["verb"] }) {
        this.id = id;
        this.verb = verb;
    }
}

const STAT_CHANGES = {
    INCREASE: new StatChange({ id: "INCREASE", verb: "Increases" }),
    DECREASE: new StatChange({ id: "DECREASE", verb: "Decreases" }),
} as const satisfies { [K in TStatChange]: IStatChange };

export class StatChangeType extends Type<StatChange, string | null | undefined> {
    public convertToDatabaseValue(value: StatChange | null | undefined): string | null | undefined {
        return value?.id;
    }

    public convertToJSValue(value: string): StatChange {
        if (value in STAT_CHANGES) {
            return STAT_CHANGES[value as keyof typeof STAT_CHANGES];
        }
        throw new Error("Invalid stat change id");
    }
}
