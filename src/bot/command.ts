import type { ICommand } from "./types.ts";

export class Command implements ICommand {
    public readonly info: ICommand["info"];
    public readonly run: ICommand["run"];

    public constructor(arg: ICommand) {
        this.info = arg.info;
        this.run = arg.run;
    }
}
