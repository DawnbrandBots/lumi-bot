import { describe, expect, test } from "vitest";
import { ESpellDraggingMode } from "../../../../../src/domain/game/models/spell.types.ts";
import Spell from "../../../../../src/domain/game/rules/spell.ts";

describe(Spell.draggingModeKind.name, () => {
    test.each([
        [[ESpellDraggingMode.SELF], ESpellDraggingMode.SELF],
        [[ESpellDraggingMode.SELF, ESpellDraggingMode.SELF], ESpellDraggingMode.SELF],
        [[ESpellDraggingMode.ANY], ESpellDraggingMode.ANY],
        [[ESpellDraggingMode.SELF, ESpellDraggingMode.ANY], ESpellDraggingMode.ANY],
    ] as const)("dragging modes %o => %s", (draggingModes, expected) => {
        expect(Spell.draggingModeKind(draggingModes)).toBe(expected);
    });
});
