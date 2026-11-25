export default function functify<const Mapping extends object>(mapping: Readonly<Mapping>) {
    return <Key extends keyof Mapping>(key: Key): Mapping[Key] => mapping[key];
}
