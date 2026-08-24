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

export type TGetLfgStatus = (arg: TGetLfgStatusArg) => MaybePromise<TLfgResultTypes["status"]>;
export type TCreateLfgRoomUseCase = (arg: TCreateLfgRoomArg) => MaybePromise<TLfgResultTypes["create"]>;
export type TChangeOwnedLfgRoomCodeUseCase = (
    arg: TChangeOwnedLfgRoomCodeArg,
) => MaybePromise<TLfgResultTypes["changeOwnedRoomCode"]>;
export type TChangeLfgRoomCodeUseCase = (arg: TChangeLfgRoomCodeArg) => MaybePromise<TLfgResultTypes["changeRoomCode"]>;
export type TMoveLfgUser = (arg: TMoveLfgUserArg) => MaybePromise<TLfgResultTypes["move"]>;
export type TTransferLfgRoomUseCase = (arg: TTransferLfgRoomArg) => MaybePromise<TLfgResultTypes["transfer"]>;
export type TTransferOwnedLfgRoomUseCase = (
    arg: TTransferOwnedLfgRoomArg,
) => MaybePromise<TLfgResultTypes["transferOwnedRoom"]>;
export type TKickFromLfgRoomByCode = (arg: TKickFromLfgRoomByCodeArg) => MaybePromise<TLfgResultTypes["kick"]>;
export type TKickFromOwnedLfgRoomUseCase = (
    arg: TKickFromOwnedLfgRoomArg,
) => MaybePromise<TLfgResultTypes["kickFromOwnedRoom"]>;
export type TLeaveLfgRoom = (arg: TLeaveLfgRoomArg) => MaybePromise<TLfgResultTypes["leave"]>;
export type TDisbandLfgRoomUseCase = (arg: TDisbandLfgRoomArg) => MaybePromise<TLfgResultTypes["disband"]>;
export type TDisbandOwnedLfgRoomUseCase = (
    arg: TDisbandOwnedLfgRoomArg,
) => MaybePromise<TLfgResultTypes["disbandOwnedRoom"]>;

export type TLfgUseCases = {
    readonly changeLfgRoomCode: TChangeLfgRoomCodeUseCase;
    readonly changeOwnedLfgRoomCode: TChangeOwnedLfgRoomCodeUseCase;
    readonly createLfgRoom: TCreateLfgRoomUseCase;
    readonly disbandLfgRoom: TDisbandLfgRoomUseCase;
    readonly disbandOwnedLfgRoom: TDisbandOwnedLfgRoomUseCase;
    readonly getLfgStatus: TGetLfgStatus;
    readonly kickFromLfgRoom: TKickFromLfgRoomByCode;
    readonly kickFromOwnedLfgRoom: TKickFromOwnedLfgRoomUseCase;
    readonly leaveLfgRoom: TLeaveLfgRoom;
    readonly moveLfgUser: TMoveLfgUser;
    readonly transferLfgRoom: TTransferLfgRoomUseCase;
    readonly transferOwnedLfgRoom: TTransferOwnedLfgRoomUseCase;
};

export default TLfgUseCases;
