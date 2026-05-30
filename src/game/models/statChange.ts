import { Type } from "@mikro-orm/sqlite";
import { EStatChange, type IStatChange } from "../types.ts";

export class StatChange implements IStatChange {
    readonly id: IStatChange["id"];
    readonly verb: IStatChange["verb"];
    readonly preposition: IStatChange["preposition"];

    public constructor({
        id,
        verb,
        preposition,
    }: {
        readonly id: IStatChange["id"];
        readonly verb: IStatChange["verb"];
        readonly preposition: IStatChange["preposition"];
    }) {
        this.id = id;
        this.verb = verb;
        this.preposition = preposition;
    }
}

const STAT_CHANGES = {
    INCREASE: new StatChange({ id: EStatChange.INCREASE, verb: "Increases", preposition: "by" }),
    DECREASE: new StatChange({ id: EStatChange.DECREASE, verb: "Decreases", preposition: "by" }),
    LIMIT: new StatChange({ id: EStatChange.LIMIT, verb: "Limits", preposition: "to" }),
} as const satisfies { [K in keyof typeof EStatChange]: IStatChange };

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
