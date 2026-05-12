#!/usr/bin/env bash

set -euo pipefail

db_name="${1:-lumi}"
mikro_orm_config="${2:-./src/mikro-orm.config.ts}"
csv_dir="${3:-csv}"

rm -f "$db_name"
rm -rf "$csv_dir"

camel_to_snake() {
    sed -e 's/\([A-Z]\)/_\L\1/g'
}
csv_path_to_column_name() {
    basename "$1" .csv | camel_to_snake
}

NODE_OPTIONS="--experimental-transform-types" npx mikro-orm schema:create --run --config "$mikro_orm_config" \
&& {
    node scripts/json-data-to-csv.ts "$csv_dir"
    for i in "$csv_dir"/*.csv; do
        table_name="$(csv_path_to_column_name "$i")"
        echo "$table_name"
        sqlite3 "$db_name" ".mode csv" ".import $i $table_name"
    done
}
