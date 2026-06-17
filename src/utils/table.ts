export function separator(arg: {
    readonly data: (string | number)[][];
    /**
     * Maximum size of cells not on the first column.
     */
    readonly cellPadding: number;
    /**
     * Maximum size of cells on the first column.
     */
    readonly rowHeaderPadding?: number;
    /**
     * Number of rows part of table's header.
     */
    readonly headerRowsCount?: number;
    readonly cross?: string;
    readonly line?: string;
}) {
    const headerRowsCount = arg.headerRowsCount ?? 1;
    if (headerRowsCount > arg.data.length) {
        throw new Error("Number of header rows greater than number of rows");
    }
    const rowHeaderPadding =
        arg.rowHeaderPadding ??
        arg.data.reduce((acc, row) => Math.max(acc, row[0]?.toString().length ?? 0), -Infinity) + 1;
    function formatRow(row: (string | number)[]) {
        return rowToStr({ row, rowHeaderPadding, cellPadding: arg.cellPadding });
    }
    const headerRows = arg.data.slice(0, headerRowsCount).map(formatRow);
    const rowSeparatorSecondHalfLength =
        headerRows.reduce((acc, row) => Math.max(acc, row.length), headerRows[0]!.length - rowHeaderPadding - 1) -
        rowHeaderPadding -
        1;
    return (
        (arg.line ?? "─").repeat(rowHeaderPadding) +
        (arg.cross ?? "┼") +
        (arg.line ?? "─").repeat(rowSeparatorSecondHalfLength)
    );
}

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
    /**
     * Number of rows part of table's header.
     */
    readonly headerRowsCount?: number;
}) {
    const headerRowsCount = arg.headerRowsCount ?? 1;
    if (headerRowsCount > arg.data.length) {
        throw new Error("Number of header rows greater than number of rows");
    }
    const rowHeaderPadding =
        arg.rowHeaderPadding ??
        arg.data.reduce((acc, row) => Math.max(acc, row[0]?.toString().length ?? 0), -Infinity) + 1;
    function formatRow(row: (string | number)[]) {
        return rowToStr({ row, rowHeaderPadding, cellPadding: arg.cellPadding });
    }
    const headerRows = arg.data.slice(0, headerRowsCount).map(formatRow);
    const rowSeparatorSecondHalfLength =
        headerRows.reduce((acc, row) => Math.max(acc, row.length), headerRows[0]!.length - rowHeaderPadding - 1) -
        rowHeaderPadding -
        1;
    const rowSeparator = "─".repeat(rowHeaderPadding) + "┼" + "─".repeat(rowSeparatorSecondHalfLength);
    return [...headerRows, rowSeparator, ...arg.data.slice(headerRowsCount).map(formatRow)].join("\n");
}

export function rowToStr({
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
            .join(" ")
    );
}
