import isKeyOfExactObject from "../../utils/isKeyOfExactObject.ts";

export type THandler = (...args: never[]) => unknown;
export type THandlerTree<Handler extends THandler> = Handler | IHandlerMap<Handler>;

interface IHandlerMap<Handler extends THandler> {
    readonly [name: string]: THandlerTree<Handler>;
}

function isHandlerMap<Handler extends THandler>(
    value: THandlerTree<Handler> | undefined,
): value is IHandlerMap<Handler> {
    return typeof value === "object" && value !== null;
}

export default function getHandlerAtRoute<Handler extends THandler>(
    handlers: Record<string, THandlerTree<Handler>>,
    commandName: string,
    route: readonly string[],
): Handler | undefined {
    if (!isKeyOfExactObject(handlers, commandName)) {
        return undefined;
    }

    let current: THandlerTree<Handler> | undefined = handlers[commandName];

    for (const part of route) {
        if (!isHandlerMap(current)) {
            return undefined;
        }
        current = current[part];
    }

    return typeof current === "function" ? current : undefined;
}
