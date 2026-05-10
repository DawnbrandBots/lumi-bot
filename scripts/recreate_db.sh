rm lumi

camel_to_snake() {
    sed -e 's/\([A-Z]\)/_\L\1/g'
}
csv_path_to_property_name() {
    sed -e 's/csv\/\([a-zA-Z]\+\)\.csv/\1/'
}
csv_path_to_column_name() {
    csv_path_to_property_name | camel_to_snake
}

npx mikro-orm schema:create --run \
&& {
    node scripts/json-data-to-csv.ts
    for i in csv/*.csv; do
        echo "$i" | csv_path_to_column_name;
        sqlite3 lumi ".mode csv" ".import $i $(echo "$i" | csv_path_to_column_name)"
    done
}

