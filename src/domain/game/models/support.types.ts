import type { IDisciple } from "./disciple.types.ts";

/** A pair of disciples who have supports with each other. */
export interface ISupport {
    readonly discipleOne: IDisciple;
    readonly discipleTwo: IDisciple;
}
