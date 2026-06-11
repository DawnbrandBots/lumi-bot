import { adminCommandInfo } from "../admin/commandInfo.ts";
import { bazaarCommandInfo } from "../bazaar/commandInfo.ts";
import { helpCommandInfo } from "../help/commandInfo.ts";
import { lfgCommandInfo } from "../lfg/commandInfo.ts";
import { linksCommandInfo } from "../links/commandInfo.ts";
import { searchCommandInfo } from "../search/commandInfo.ts";

const allCommandInfo = [
    helpCommandInfo,
    searchCommandInfo,
    linksCommandInfo,
    lfgCommandInfo,
    bazaarCommandInfo,
    adminCommandInfo,
];
export default allCommandInfo;
