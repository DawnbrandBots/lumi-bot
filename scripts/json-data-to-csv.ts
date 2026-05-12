import { stringify } from "csv-stringify/sync";

import fs from "node:fs";

const outputDirectory = process.argv[2] ?? "csv";

if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

const files = fs.globSync("./data/*.json");
for (const file of files) {
    const content = fs.readFileSync(file);
    const json = JSON.parse(content.toString());
    const csv = stringify(json);
    fs.writeFileSync(`${outputDirectory}/${file.replace(/data\/|\.json/g, "")}.csv`, csv);
}
