import { IColor, IWeapon, IWeaponType } from "../types.js"
import { indexById } from "../search/utils/indexById.js"
import { ColorDto, WeaponDto, WeaponTypeDto } from "../search/validate.js"

function initData({
    colorDtos,
    weaponTypeDtos,
    weaponDtos
}: {
    colorDtos: ColorDto[]
    weaponTypeDtos: WeaponTypeDto[]
    weaponDtos: WeaponDto[]
}) {
    const colors: IColor[] = colorDtos.map(dto => ({
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
            id: dto.id,
            name: dto.name,
            type: type,
            level: dto.level,
        };
    });
    const weaponMap = indexById(weapons)

    return {
        colors,
        colorMap,
        weaponTypes,
        weaponTypeMap,
        weapons,
        weaponMap,
    }
}

export default initData;