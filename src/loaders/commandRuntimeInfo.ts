import { adminCommandRuntimeInfo } from "../admin/command/runtimeInfo.ts";
import { helpCommandRuntimeInfo } from "../help/command/runtimeInfo.ts";
import { lfgCommandRuntimeInfo } from "../lfg/command/runtimeInfo.ts";
import { linksCommandRuntimeInfo } from "../links/command/runtimeInfo.ts";
import { searchCommandRuntimeInfo } from "../search/command/runtimeInfo.ts";

const allCommandRuntimeInfo = [
    adminCommandRuntimeInfo,
    helpCommandRuntimeInfo,
    searchCommandRuntimeInfo,
    linksCommandRuntimeInfo,
    lfgCommandRuntimeInfo,
] as const;

export type TAllCommandApiInfo = (typeof allCommandRuntimeInfo)[number]["apiInfo"];

export default allCommandRuntimeInfo;
