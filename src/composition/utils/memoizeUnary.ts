/** Returns a function of the same signature as the input, but caches the return value for each unique input argument. */
const memoizeUnary = <I, R>(f: (arg: I) => R): ((arg: I) => R) => {
    const cache = new Map<I, R>();

    return (arg: I): R => {
        if (!cache.has(arg)) {
            cache.set(arg, f(arg));
        }
        return cache.get(arg)!;
    };
};

export default memoizeUnary;
