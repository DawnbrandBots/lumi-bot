/** https://stackoverflow.com/a/37511463 */
export default function removeDiacritics(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
