import z from "zod";

export const id = z.string().regex(/[A-Z][A-Z0-9]*(_[A-Z0-9]+)*/);
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

export const movement = z.object({
    id: id,
    name: name,
    distance: z.union([z.literal(2), z.literal(3)])
})

export const disciple = z.object({
    id: id,
    name: name,
    weapon: weaponType.shape.id,
    movement: movement.shape.id,
    prf: weaponType.shape.id
})

export type ColorDto = z.infer<typeof color>;
export type WeaponDto = z.infer<typeof weapon>;
export type WeaponTypeDto = z.infer<typeof weaponType>;
export type MovementDto = z.infer<typeof movement>;
export type DiscipleDto = z.infer<typeof disciple>;