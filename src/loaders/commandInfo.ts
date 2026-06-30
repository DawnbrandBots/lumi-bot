import { helpCommandInfo } from "../help/commandInfo.ts";
import { linksCommandInfo } from "../links/commandInfo.ts";
import { searchCommandInfo } from "../search/commandInfo.ts";

const allCommandInfo = [helpCommandInfo, searchCommandInfo, linksCommandInfo] as const;

export type TAllCommandApiInfo = (typeof allCommandInfo)[number]["apiInfo"];

export default allCommandInfo;
