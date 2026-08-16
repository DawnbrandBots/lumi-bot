// Disclaimer: AI-generated test fixtures

import {
    ESpellDraggingMode,
    ESpellEffectKind,
    ESpellEffectTarget,
    ESpellEffectValueUnitKind,
    ESpellRole,
    type ISpell
} from "../../../../src/game/types.ts";
import { RED_COLOR } from "./common.fixtures.ts";

export const SPELL = {
    kind: "spell",
    id: "ELFIRE",
    name: "Elfire",
    disciple: null,
    role: ESpellRole.EX,
    uses: null,
    countdown: null,
    cooldown: 5,
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
    shape: {
        id: "SINGLE_TILE",
        name: "single space",
        tiles: "............X............",
        isAoe: false,
    },
    onlyFor: null,
    draggingMode: ESpellDraggingMode.ANY,
} satisfies ISpell;
