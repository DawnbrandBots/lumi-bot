import { helpCommandRuntimeInfo } from "../help/commandRuntimeInfo.ts";
import { linksCommandRuntimeInfo } from "../links/commandRuntimeInfo.ts";
import { searchCommandRuntimeInfo } from "../search/commandRuntimeInfo.ts";

const allCommandRuntimeInfo = [helpCommandRuntimeInfo, searchCommandRuntimeInfo, linksCommandRuntimeInfo] as const;

export type TAllCommandApiInfo = (typeof allCommandRuntimeInfo)[number]["apiInfo"];

export default allCommandRuntimeInfo;
