import type { TAdminResultTypes } from "./types.ts";

export type { TAdminUseCaseBase, TAdminUseCaseDependencies } from "./types.ts";

export type TAdminUseCaseArgs = {
    readonly addLfgRole: {
        readonly guildId: string;
        readonly roleId: string;
    };
    readonly clearLfgChannel: {
        readonly guildId: string;
    };
    readonly clearLfgRolePingCooldown: {
        readonly guildId: string;
    };
    readonly getGuildConfig: {
        readonly guildId: string;
    };
    readonly getLfgRoleConfig: {
        readonly guildId: string;
        readonly roleId: string;
    };
    readonly removeLfgRole: {
        readonly guildId: string;
        readonly roleId: string;
    };
    readonly setLfgChannel: {
        readonly guildId: string;
        readonly channelId: string;
    };
    readonly setLfgRoleLastPingedAt: {
        readonly guildId: string;
        readonly roleId: string;
        readonly date: Date;
    };
    readonly setLfgRolePingCooldown: {
        readonly guildId: string;
        readonly minutes: number;
    };
};

export type TAdminUseCases = {
    readonly [Name in keyof TAdminUseCaseArgs]: (arg: TAdminUseCaseArgs[Name]) => Promise<TAdminResultTypes[Name]>;
};
