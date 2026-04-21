import z from "zod";

export const id = z.string();
export const name = z.string();

export const color = z.object({
    id: id,
    name: name,
});

export const weaponType = z.object({
    id: id,
    name: name,
    color: color.shape.id,
    range: z.union([z.literal(1), z.literal(2)]),
});

export const weapon = z.object({
    id: id,
    name: name,
    type: weaponType.shape.id,
    level: z.int().gte(1).lte(8),
});

export type ColorDto = z.infer<typeof color>;
export type WeaponDto = z.infer<typeof weapon>;
export type WeaponTypeDto = z.infer<typeof weaponType>;