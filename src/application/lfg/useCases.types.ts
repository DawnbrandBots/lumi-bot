import type { IUser } from "../../domain/lfg/models/user.types.ts";
import type { MaybePromise } from "../../utils/types.ts";
import type { TLfgResultTypes } from "./types.ts";

export type TGetLfgStatusArg = { readonly guildId: string };
export type TCreateLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly code: string;
};
export type TChangeOwnedLfgRoomCodeArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly newCode: string;
};
export type TChangeLfgRoomCodeArg = {
    readonly guildId: string;
    readonly code: string;
    readonly newCode: string;
};
export type TMoveLfgUserArg = {
    readonly guildId: string;
    readonly user: IUser;
    readonly code: string;
};
export type TTransferLfgRoomArg = {
    readonly guildId: string;
    readonly code: string;
    readonly target: IUser;
};
export type TTransferOwnedLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly target: IUser;
};
export type TKickFromLfgRoomByCodeArg = {
    readonly guildId: string;
    readonly code: string;
    readonly target: IUser;
};
export type TKickFromOwnedLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
    readonly target: IUser;
};
export type TLeaveLfgRoomArg = { readonly guildId: string; readonly user: IUser };
export type TDisbandLfgRoomArg = { readonly guildId: string; readonly code: string };
export type TDisbandOwnedLfgRoomArg = {
    readonly guildId: string;
    readonly owner: IUser;
};

export type TLfgUseCases = {
    readonly changeLfgRoomCode: (arg: TChangeLfgRoomCodeArg) => MaybePromise<TLfgResultTypes["changeRoomCode"]>;
    readonly changeOwnedLfgRoomCode: (
        arg: TChangeOwnedLfgRoomCodeArg,
    ) => MaybePromise<TLfgResultTypes["changeOwnedRoomCode"]>;
    readonly createLfgRoom: (arg: TCreateLfgRoomArg) => MaybePromise<TLfgResultTypes["create"]>;
    readonly disbandLfgRoom: (arg: TDisbandLfgRoomArg) => MaybePromise<TLfgResultTypes["disband"]>;
    readonly disbandOwnedLfgRoom: (arg: TDisbandOwnedLfgRoomArg) => MaybePromise<TLfgResultTypes["disbandOwnedRoom"]>;
    readonly getLfgStatus: (arg: TGetLfgStatusArg) => MaybePromise<TLfgResultTypes["status"]>;
    readonly kickFromLfgRoom: (arg: TKickFromLfgRoomByCodeArg) => MaybePromise<TLfgResultTypes["kick"]>;
    readonly kickFromOwnedLfgRoom: (
        arg: TKickFromOwnedLfgRoomArg,
    ) => MaybePromise<TLfgResultTypes["kickFromOwnedRoom"]>;
    readonly leaveLfgRoom: (arg: TLeaveLfgRoomArg) => MaybePromise<TLfgResultTypes["leave"]>;
    readonly moveLfgUser: (arg: TMoveLfgUserArg) => MaybePromise<TLfgResultTypes["move"]>;
    readonly transferLfgRoom: (arg: TTransferLfgRoomArg) => MaybePromise<TLfgResultTypes["transfer"]>;
    readonly transferOwnedLfgRoom: (
        arg: TTransferOwnedLfgRoomArg,
    ) => MaybePromise<TLfgResultTypes["transferOwnedRoom"]>;
};

export default TLfgUseCases;
