import { stringify } from "csv-stringify/sync";

import fs from "node:fs";

if (!fs.existsSync("./csv")) {
    fs.mkdirSync("./csv");
}

const files = fs.globSync("./data/*.json");
for (const file of files) {
    console.info(file);
    const content = fs.readFileSync(file);
    const json = JSON.parse(content.toString());
    const csv = stringify(json);
    fs.writeFileSync(`./csv/${file.replace(/data\/|\.json/g, "")}.csv`, csv);
}
