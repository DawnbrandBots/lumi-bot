import type { TListableItem } from "../../../domain/bazaar/models/listableItem.types.ts";
import { isDiscipleWithListableSoul, isListableWeaponLevel } from "../../../domain/bazaar/rules/listableItem.ts";
import type { TBazaarDependencies, TListableItemReference } from "../types.ts";

export async function resolveListableItem(
    dependencies: Pick<TBazaarDependencies, "queries">,
    reference: TListableItemReference,
): Promise<TListableItem | null> {
    switch (reference.kind) {
        case "weapon": {
            const weapon = await dependencies.queries.bazaar.findWeaponById({ weaponId: reference.weaponId });
            return weapon && isListableWeaponLevel(weapon.level)
                ? { kind: "weapon", weapon: { id: weapon.id, name: weapon.name }, variant: reference.variant }
                : null;
        }
        case "soul": {
            const disciple = await dependencies.queries.bazaar.findDiscipleById({ discipleId: reference.discipleId });
            return disciple && isDiscipleWithListableSoul(disciple)
                ? { kind: "soul", disciple: { id: disciple.id, name: disciple.name } }
                : null;
        }
    }
}
