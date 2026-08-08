import { adminCommandRuntimeInfo } from "./runtimeInfo/admin.ts";
import { helpCommandRuntimeInfo } from "./runtimeInfo/help.ts";
import { lfgCommandRuntimeInfo } from "./runtimeInfo/lfg.ts";
import { lfgManageCommandRuntimeInfo } from "./runtimeInfo/lfgManage.ts";
import { linksCommandRuntimeInfo } from "./runtimeInfo/links.ts";
import { searchCommandRuntimeInfo } from "./runtimeInfo/search.ts";

const allCommandRuntimeInfo = [
    helpCommandRuntimeInfo,
    searchCommandRuntimeInfo,
    linksCommandRuntimeInfo,
    lfgCommandRuntimeInfo,
    lfgManageCommandRuntimeInfo,
    adminCommandRuntimeInfo,
] as const;

export type TAllCommandRuntimeInfo = (typeof allCommandRuntimeInfo)[number];

export default allCommandRuntimeInfo;
