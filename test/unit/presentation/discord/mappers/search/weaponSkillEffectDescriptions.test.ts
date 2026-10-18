import { expect, test } from "vitest";
import {
    describeWeaponSkillEffect,
    type TWeaponSkillEffectDescriptionInput,
} from "../../../../../../src/presentation/discord/mappers/search/weaponSkillEffectDescriptions.ts";

test.each<{
    name: string;
    input: TWeaponSkillEffectDescriptionInput;
    expected: string;
}>([
    {
        name: "increased damage against a weapon type",
        input: {
            effect: {
                kind: "WEAPON_DAMAGE_CHANGE",
                action: "DEAL_TO",
                change: "INCREASE",
                amount: 30,
                condition: { kind: "FOE", foeSelector: { property: "weaponType", value: { name: "Axe" } } },
            },
        },
        expected: "Deal 30% more weapon damage against Axe units.",
    },
    {
        name: "reduced damage from minions",
        input: {
            effect: {
                kind: "WEAPON_DAMAGE_CHANGE",
                action: "TAKE_FROM",
                change: "DECREASE",
                amount: 20,
                condition: { kind: "FOE", foeSelector: { property: "kind", value: "MINION" } },
            },
        },
        expected: "Take 20% less weapon damage from minions.",
    },
    {
        name: "damage from range-one foes",
        input: {
            effect: {
                kind: "WEAPON_DAMAGE_CHANGE",
                action: "TAKE_FROM",
                change: "DECREASE",
                amount: 30,
                condition: { kind: "FOE", foeSelector: { property: "weaponType.range", value: 1 } },
            },
        },
        expected: "Take 30% less weapon damage from units with a range of 1.",
    },
    {
        name: "damage against a movement type",
        input: {
            effect: {
                kind: "WEAPON_DAMAGE_CHANGE",
                action: "DEAL_TO",
                change: "INCREASE",
                amount: 40,
                condition: { kind: "FOE", foeSelector: { property: "movementType", value: { name: "Flying" } } },
            },
        },
        expected: "Deal 40% more weapon damage against Flying units.",
    },
    {
        name: "damage at high HP",
        input: {
            effect: {
                kind: "WEAPON_DAMAGE_CHANGE",
                action: "DEAL_TO",
                change: "INCREASE",
                amount: 20,
                condition: { kind: "HP", operand: "GREATER_OR_EQUAL", percentage: 50 },
            },
        },
        expected: "Deal 20% more weapon damage while HP is at least 50%.",
    },
    {
        name: "damage at low HP",
        input: {
            effect: {
                kind: "WEAPON_DAMAGE_CHANGE",
                action: "TAKE_FROM",
                change: "DECREASE",
                amount: 40,
                condition: { kind: "HP", operand: "LOWER_OR_EQUAL", percentage: 50 },
            },
        },
        expected: "Take 40% less weapon damage while HP is at most 50%.",
    },
    {
        name: "unconditional damage",
        input: { effect: { kind: "WEAPON_DAMAGE_CHANGE", action: "DEAL_TO", change: "INCREASE", amount: 15 } },
        expected: "Deal 15% more weapon damage.",
    },
    {
        name: "permanent HP stat change",
        input: { effect: { kind: "STAT_CHANGE", HP: { change: "INCREASE", amount: 5 } } },
        expected: "Boost HP by 5%.",
    },
    {
        name: "permanent Atk stat change",
        input: { effect: { kind: "STAT_CHANGE", ATK: { change: "INCREASE", amount: 15 } } },
        expected: "Boost Atk by 15%.",
    },
    {
        name: "permanent HP and Atk stat changes",
        input: {
            effect: {
                kind: "STAT_CHANGE",
                HP: { change: "DECREASE", amount: 5 },
                ATK: { change: "INCREASE", amount: 15 },
            },
        },
        expected: "Reduce HP by 5% and boost Atk by 15%.",
    },
    {
        name: "spell damage reduction after an auto-attack kill",
        input: {
            effect: {
                kind: "STATUS_EFFECT_ON_AUTO_ATTACK_KILL",
                stat: "RECEIVED_SPELL_DAMAGE",
                change: "DECREASE",
                amount: 40,
                duration: 1,
            },
        },
        expected: 'After defeating a foe with a weapon attack, grant "take 40% less spell damage (1 turn)" to user.',
    },
    {
        name: "weapon damage reduction after an auto-attack kill",
        input: {
            effect: {
                kind: "STATUS_EFFECT_ON_AUTO_ATTACK_KILL",
                stat: "RECEIVED_WEAPON_DAMAGE",
                change: "DECREASE",
                amount: 90,
                duration: 1,
            },
        },
        expected: 'After defeating a foe with a weapon attack, grant "take 90% less weapon damage (1 turn)" to user.',
    },
    {
        name: "cooldown reduction after an auto-attack kill",
        input: {
            effect: {
                kind: "STATUS_EFFECT_ON_AUTO_ATTACK_KILL",
                stat: "SPELL_COOLDOWN",
                change: "DECREASE",
                amount: 20,
                duration: 1,
            },
        },
        expected: 'After defeating a foe with a weapon attack, grant "reduce Spell Cooldown by 20% (1 turn)" to user.',
    },
    {
        name: "attack increase after an auto-attack kill",
        input: {
            effect: {
                kind: "STATUS_EFFECT_ON_AUTO_ATTACK_KILL",
                stat: "ATK",
                change: "INCREASE",
                amount: 50,
                duration: 3,
            },
        },
        expected: 'After defeating a foe with a weapon attack, grant "boost Atk by 50% (3 turns)" to user.',
    },
])("describes $name", ({ input, expected }) => {
    expect(describeWeaponSkillEffect(input)).toBe(expected);
});

test("rejects a stat effect without a stat change", () => {
    expect(() => describeWeaponSkillEffect({ effect: { kind: "STAT_CHANGE" } })).toThrow(
        "A stat effect must change at least one stat",
    );
});
