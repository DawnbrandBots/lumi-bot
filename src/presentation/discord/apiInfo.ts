import { adminCommandApiInfo } from "./apiInfo/admin.ts";
import { helpCommandApiInfo } from "./apiInfo/help.ts";
import { lfgCommandApiInfo } from "./apiInfo/lfg.ts";
import { lfgManageCommandApiInfo } from "./apiInfo/lfgManage.ts";
import { linksCommandApiInfo } from "./apiInfo/links.ts";
import { searchCommandApiInfo } from "./apiInfo/search.ts";

export const allCommandApiInfo = [
    helpCommandApiInfo,
    searchCommandApiInfo,
    linksCommandApiInfo,
    lfgCommandApiInfo,
    lfgManageCommandApiInfo,
    adminCommandApiInfo,
] as const;

export type TAllCommandApiInfo = (typeof allCommandApiInfo)[number];
