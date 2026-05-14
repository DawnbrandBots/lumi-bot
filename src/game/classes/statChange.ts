import { Type } from "@mikro-orm/core";
import { EStatChange, IStatChange } from "../types.ts";

export class StatChange implements IStatChange {
    readonly id: IStatChange["id"];
    readonly verb: IStatChange["verb"];

    public constructor({ id, verb }: { readonly id: IStatChange["id"]; readonly verb: IStatChange["verb"] }) {
        this.id = id;
        this.verb = verb;
    }
}

const STAT_CHANGES = {
    INCREASE: new StatChange({ id: EStatChange.INCREASE, verb: "Increases" }),
    DECREASE: new StatChange({ id: EStatChange.DECREASE, verb: "Decreases" }),
} as const satisfies { [K in EStatChange]: IStatChange };

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
