// Disclaimer: AI-generated test fixtures

import type { ISpell } from "../../../../../../src/domain/game/models/spell.types.ts";
import {
    ESpellDraggingModeKind,
    ESpellCastKind,
    ESpellRole,
} from "../../../../../../src/domain/game/models/spell.types.ts";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../src/domain/game/models/spellEffect.types.ts";
import { ESpellEffectValueUnitKind } from "../../../../../../src/domain/game/models/spellEffectValue.types.ts";
import { RED_COLOR } from "./common.fixtures.ts";

export const SPELL = {
    kind: "spell",
    id: "ELFIRE",
    name: "Elfire",
    disciple: null,
    role: ESpellRole.EX,
    uses: null,
    cast: {
        kind: ESpellCastKind.NORMAL,
        countdown: null,
        cooldown: 5,
        shape: {
            id: "SINGLE_TILE",
            name: "single space",
            tiles: "............X............",
            isAoe: false,
        },
        draggingMode: ESpellDraggingModeKind.ANY,
        effects: [
            {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 60,
                    unit: {
                        kind: ESpellEffectValueUnitKind.FIXED,
                    },
                },
                color: RED_COLOR,
                target: ESpellEffectTarget.ANY,
            },
        ],
    },
    onlyFor: null,
} satisfies ISpell;
