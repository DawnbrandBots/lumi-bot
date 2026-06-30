import { helpCommandRuntimeInfo } from "../help/command/runtimeInfo.ts";
import { linksCommandRuntimeInfo } from "../links/command/runtimeInfo.ts";
import { searchCommandRuntimeInfo } from "../search/command/runtimeInfo.ts";

const allCommandRuntimeInfo = [helpCommandRuntimeInfo, searchCommandRuntimeInfo, linksCommandRuntimeInfo] as const;

export type TAllCommandApiInfo = (typeof allCommandRuntimeInfo)[number]["apiInfo"];

export default allCommandRuntimeInfo;
