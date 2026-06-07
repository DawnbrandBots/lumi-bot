import type { ICommand } from "./types.ts";

export class Command implements ICommand {
    public readonly info: ICommand["info"];
    public readonly request: ICommand["request"];
    public readonly autocomplete: ICommand["autocomplete"];

    public constructor(arg: ICommand) {
        this.info = arg.info;
        this.request = arg.request;
        this.autocomplete = arg.autocomplete;
    }
}
