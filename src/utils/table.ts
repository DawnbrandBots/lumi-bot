// TODO: should the function be able to compute cellpadding on its own?
export function toAsciiTable(arg: { data: (string | number)[][]; headerPadding?: number; cellPadding: number }) {
    if (!arg.data[0]) {
        throw new Error("No first row");
    }
    const headerPadding = arg.data.reduce((acc, row) => Math.max(acc, row[0]?.toString().length ?? 0), -Infinity) + 1;
    function formatRow(row: (string | number)[]) {
        return rowToStr({ row, headerPadding, cellPadding: arg.cellPadding });
    }
    const firstRow = formatRow(arg.data[0]);
    // const rowSeparator = "─".repeat(5) + " ┼" + " ─── ".repeat(11)
    const rowSeparator = "─".repeat(headerPadding) + "┼" + "─".repeat(firstRow.length - headerPadding - 1);
    return [firstRow, rowSeparator, ...arg.data.slice(1).map(formatRow)].join("\n");
}

function rowToStr({
    row,
    headerPadding,
    cellPadding,
}: {
    row: (string | number)[];
    headerPadding: number;
    cellPadding: number;
}) {
    return (
        row[0]?.toString().padEnd(headerPadding, " ") +
        "| " +
        row
            .slice(1)
            .map((n) => `${n}`.padStart(cellPadding, " "))
            .join("  ")
    );
}
