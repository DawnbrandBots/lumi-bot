import { helpCommandInfo } from "../help/commandInfo.ts";
import { linksCommandInfo } from "../links/commandInfo.ts";
import { searchCommandInfo } from "../search/commandInfo.ts";

const allCommandInfo = [helpCommandInfo, searchCommandInfo, linksCommandInfo] as const;

export type TAllCommandData = (typeof allCommandInfo)[number]["data"];

export default allCommandInfo;
