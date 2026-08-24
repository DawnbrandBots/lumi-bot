import type { TAdminResultTypes } from "./types.ts";

export type TAddAdminLfgRole = (arg: {
    readonly guildId: string;
    readonly roleId: string;
}) => Promise<TAdminResultTypes["lfgRole"]>;
export type TClearAdminLfgChannel = (arg: { readonly guildId: string }) => Promise<TAdminResultTypes["lfgChannel"]>;
export type TClearAdminLfgRolePingCooldown = (arg: {
    readonly guildId: string;
}) => Promise<TAdminResultTypes["lfgRolePingCooldown"]>;
export type TGetAdminGuildConfig = (arg: { readonly guildId: string }) => Promise<TAdminResultTypes["getGuildConfig"]>;
export type TGetAdminLfgRoleConfig = (arg: {
    readonly guildId: string;
    readonly roleId: string;
}) => Promise<TAdminResultTypes["getLfgRoleConfig"]>;
export type TRemoveAdminLfgRole = (arg: {
    readonly guildId: string;
    readonly roleId: string;
}) => Promise<TAdminResultTypes["lfgRole"]>;
export type TSetAdminLfgChannel = (arg: {
    readonly guildId: string;
    readonly channelId: string;
}) => Promise<TAdminResultTypes["lfgChannel"]>;
export type TSetAdminLfgRoleLastPingedAt = (arg: {
    readonly guildId: string;
    readonly roleId: string;
    readonly date: Date;
}) => Promise<void>;
export type TSetAdminLfgRolePingCooldown = (arg: {
    readonly guildId: string;
    readonly minutes: number;
}) => Promise<TAdminResultTypes["lfgRolePingCooldown"]>;

export type TAdminUseCases = {
    readonly addLfgRole: TAddAdminLfgRole;
    readonly clearLfgChannel: TClearAdminLfgChannel;
    readonly clearLfgRolePingCooldown: TClearAdminLfgRolePingCooldown;
    readonly getGuildConfig: TGetAdminGuildConfig;
    readonly getLfgRoleConfig: TGetAdminLfgRoleConfig;
    readonly removeLfgRole: TRemoveAdminLfgRole;
    readonly setLfgChannel: TSetAdminLfgChannel;
    readonly setLfgRoleLastPingedAt: TSetAdminLfgRoleLastPingedAt;
    readonly setLfgRolePingCooldown: TSetAdminLfgRolePingCooldown;
};
