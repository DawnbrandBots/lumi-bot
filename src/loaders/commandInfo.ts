import { adminCommandInfo } from "../admin/commandInfo.ts";
import { helpCommandInfo } from "../help/commandInfo.ts";
import { lfgCommandInfo } from "../lfg/commandInfo.ts";
import { lfgManageCommandInfo } from "../lfgManage/commandInfo.ts";

const allCommandInfo = [
    helpCommandInfo,
    // searchCommandInfo,
    // linksCommandInfo,
    lfgCommandInfo,
    lfgManageCommandInfo,
    adminCommandInfo,
];
export default allCommandInfo;
