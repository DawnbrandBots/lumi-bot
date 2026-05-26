import { adminCommandInfo } from "../admin/commandInfo.ts";
import { helpCommandInfo } from "../help/commandInfo.ts";
import { lfgCommandInfo } from "../lfg/commandInfo.ts";
import { searchCommandInfo } from "../search/commandInfo.ts";

const allCommandInfo = [helpCommandInfo, searchCommandInfo, lfgCommandInfo, adminCommandInfo];
export default allCommandInfo;
