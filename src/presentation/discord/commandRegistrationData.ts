import { adminCommandCommandRegistrationData } from "./commandRegistrationData/admin.ts";
import { bazaarCommandRegistrationData } from "./commandRegistrationData/bazaar.ts";
import { bazaarManageCommandRegistrationData } from "./commandRegistrationData/bazaarManage.ts";
import { helpCommandCommandRegistrationData } from "./commandRegistrationData/help.ts";
import { lfgCommandCommandRegistrationData } from "./commandRegistrationData/lfg.ts";
import { lfgManageCommandCommandRegistrationData } from "./commandRegistrationData/lfgManage.ts";
import { linksCommandCommandRegistrationData } from "./commandRegistrationData/links.ts";
import { searchCommandCommandRegistrationData } from "./commandRegistrationData/search.ts";

export const allCommandRegistrationData = [
    helpCommandCommandRegistrationData,
    searchCommandCommandRegistrationData,
    linksCommandCommandRegistrationData,
    lfgCommandCommandRegistrationData,
    lfgManageCommandCommandRegistrationData,
    adminCommandCommandRegistrationData,
    bazaarCommandRegistrationData,
    bazaarManageCommandRegistrationData,
] as const;

export type TAllCommandRegistrationData = (typeof allCommandRegistrationData)[number];
