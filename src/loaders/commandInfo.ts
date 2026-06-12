import { adminCommandInfo } from "../admin/commandInfo.ts";
import { helpCommandInfo } from "../help/commandInfo.ts";
import { lfgCommandInfo } from "../lfg/commandInfo.ts";

const allCommandInfo = [
    helpCommandInfo,
    // searchCommandInfo,
    // linksCommandInfo,
    lfgCommandInfo,
    adminCommandInfo,
];
export default allCommandInfo;
