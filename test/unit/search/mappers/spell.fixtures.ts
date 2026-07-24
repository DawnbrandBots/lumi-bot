// Disclaimer: AI-generated test fixtures

import {
    ESpellDraggingMode,
    ESpellEffectKind,
    ESpellEffectTarget,
    ESpellEffectValueUnitKind,
    ESpellRole,
    type ISpell,
    type ISpellDraggingMode,
    type ISpellRole,
    type ISpellShape,
} from "../../../../src/game/types.ts";
import { RED_COLOR } from "./common.fixtures.ts";

export const SPELL_ROLE = {
    kind: ESpellRole.EX,
    name: "EX",
} satisfies ISpellRole;

export const SPELL_SHAPE = {
    id: "SINGLE_TILE",
    name: "single tile",
    tiles: "............X............",
    isAoe: false,
} satisfies ISpellShape;

export const SPELL_DRAGGING_MODE = {
    kind: ESpellDraggingMode.ANY,
    asString: "target tile",
} satisfies ISpellDraggingMode;

export const SPELL = {
    kind: "spell",
    id: "ELFIRE",
    name: "Elfire",
    disciple: null,
    role: SPELL_ROLE,
    uses: null,
    countdown: null,
    cooldown: 5,
    effects: [
        {
            kind: ESpellEffectKind.DAMAGE,
            amount: {
                base: 60,
                scalesWithLevel: true,
                unit: {
                    kind: ESpellEffectValueUnitKind.FIXED,
                },
            },
            color: RED_COLOR,
            target: {
                kind: ESpellEffectTarget.ANY,
                asString: "targets",
            },
        },
    ],
    shape: SPELL_SHAPE,
    onlyFor: null,
    draggingMode: SPELL_DRAGGING_MODE,
} satisfies ISpell;
