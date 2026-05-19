/**
 * Returns an ASCII table representation of the given table, using the first row and column as headers.
 *
 * Quickly-hacked function, inspired by [ascii-table3](https://github.com/AllMightySauron/ascii-table3),
 * which is more complete but doesn't provide row headers.
 */
export function toAsciiTable(arg: {
    readonly data: (string | number)[][];
    /**
     * Maximum size of cells not on the first column.
     */
    readonly cellPadding: number;
    /**
     * Maximum size of cells on the first column.
     */
    readonly rowHeaderPadding?: number;
}) {
    if (!arg.data[0]) {
        throw new Error("No first row");
    }
    const rowHeaderPadding =
        arg.rowHeaderPadding ??
        arg.data.reduce((acc, row) => Math.max(acc, row[0]?.toString().length ?? 0), -Infinity) + 1;
    function formatRow(row: (string | number)[]) {
        return rowToStr({ row, rowHeaderPadding, cellPadding: arg.cellPadding });
    }
    const firstRow = formatRow(arg.data[0]);
    const rowSeparator = "─".repeat(rowHeaderPadding) + "┼" + "─".repeat(firstRow.length - rowHeaderPadding - 1);
    return [firstRow, rowSeparator, ...arg.data.slice(1).map(formatRow)].join("\n");
}

function rowToStr({
    row,
    rowHeaderPadding,
    cellPadding,
}: {
    row: (string | number)[];
    rowHeaderPadding: number;
    cellPadding: number;
}) {
    return (
        row[0]?.toString().padEnd(rowHeaderPadding, " ") +
        "| " +
        row
            .slice(1)
            .map((n) => `${n}`.padStart(cellPadding, " "))
            .join("  ")
    );
}
