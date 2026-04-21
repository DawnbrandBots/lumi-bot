import { IColor, IDisciple, IMovement, IWeapon, IWeaponType } from "../types.js"
import { indexById } from "../search/utils/indexById.js"
import { ColorDto, DiscipleDto, MovementDto, WeaponDto, WeaponTypeDto } from "../search/validate.js"

function initData({
    colorDtos,
    weaponTypeDtos,
    weaponDtos,
    movementDtos,
    discipleDtos
}: {
    colorDtos: ColorDto[]
    weaponTypeDtos: WeaponTypeDto[]
    weaponDtos: WeaponDto[]
    movementDtos: MovementDto[]
    discipleDtos: DiscipleDto[]
}) {
    const colors: IColor[] = colorDtos.map(dto => ({
        kind: "color",
        id: dto.id,
        name: dto.name,
    }));
    const colorMap = indexById(colors)

    const weaponTypes: IWeaponType[] = weaponTypeDtos.map(dto => {
        const color = colorMap[dto.color];
        if (!color) {
            throw new Error(`Color not found for id: ${dto.color}`);
        }
        return {
            kind: "weaponType",
            id: dto.id,
            name: dto.name,
            color: color,
            range: dto.range,
        };
    });
    const weaponTypeMap = indexById(weaponTypes)

    const weapons: IWeapon[] = weaponDtos.map(dto => {
        const type = weaponTypeMap[dto.type];
        if (!type) {
            throw new Error(`Weapon type not found for id: ${dto.type}`);
        }
        return {
            kind: "weapon",
            id: dto.id,
            name: dto.name,
            type: type,
            level: dto.level,
        };
    });
    const weaponMap = indexById(weapons)

    const movements: IMovement[] = movementDtos.map(dto => ({ kind: "movement", ...dto }))
    const movementMap = indexById(movements)

    const disciples: IDisciple[] = discipleDtos.map(dto => {
        const weapon = weaponTypeMap[dto.weapon];
        if (!weapon) {
            throw new Error(`Weapon type not found for id: ${dto.weapon}`);
        }
        const movement = movementMap[dto.movement];
        if (!movement) {
            throw new Error(`Movement not found for id: ${dto.movement}`);
        }
        const prf = weaponMap[dto.prf];
        if (!prf) {
            throw new Error(`PRF not found for id: ${dto.prf}`);
        }
        return {
            kind: "disciple",
            id: dto.id,
            name: dto.name,
            movement: movement,
            prf: prf,
            weapon: weapon
        };
    })
    const discipleMap = indexById(disciples)

    return {
        colors,
        colorMap,
        weaponTypes,
        weaponTypeMap,
        weapons,
        weaponMap,
        movements,
        movementMap,
        disciples,
        discipleMap
    }
}

export default initData;