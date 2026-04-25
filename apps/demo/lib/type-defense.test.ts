import { describe, expect, test } from "vite-plus/test";
import { calculateTypeDefenses } from "./type-defense";

describe("calculateTypeDefenses", () => {
  test("single type: grass weaknesses and resistances", () => {
    const result = calculateTypeDefenses([
      {
        double_damage_from: ["fire", "ice", "flying", "poison", "bug"],
        half_damage_from: ["water", "electric", "grass", "ground"],
        no_damage_from: [],
      },
    ]);

    expect(result.weakTo.map((w) => w.type)).toContain("fire");
    expect(result.weakTo.map((w) => w.type)).toContain("ice");
    expect(result.resistantTo.map((r) => r.type)).toContain("water");
    expect(result.resistantTo.map((r) => r.type)).toContain("electric");
    expect(result.immuneTo).toEqual([]);
  });

  test("dual type: multipliers compound (grass+poison)", () => {
    const result = calculateTypeDefenses([
      {
        double_damage_from: ["fire", "ice", "flying", "poison", "bug"],
        half_damage_from: ["water", "electric", "grass", "ground"],
        no_damage_from: [],
      },
      {
        double_damage_from: ["ground", "psychic"],
        half_damage_from: ["fighting", "poison", "bug", "grass", "fairy"],
        no_damage_from: [],
      },
    ]);

    // ground: 0.5 (grass) * 2 (poison) = 1x neutral
    expect(result.neutral).toContain("ground");
    // grass: 0.5 (grass) * 0.5 (poison) = 0.25x
    const grassResist = result.resistantTo.find((r) => r.type === "grass");
    expect(grassResist?.multiplier).toBe(0.25);
    // psychic: 1 (grass) * 2 (poison) = 2x
    expect(result.weakTo.map((w) => w.type)).toContain("psychic");
  });

  test("immunity overrides other multipliers", () => {
    const result = calculateTypeDefenses([
      {
        double_damage_from: [],
        half_damage_from: [],
        no_damage_from: ["ghost"],
      },
    ]);

    expect(result.immuneTo).toContain("ghost");
  });

  test("4x weakness from dual type", () => {
    const result = calculateTypeDefenses([
      {
        double_damage_from: ["grass"],
        half_damage_from: [],
        no_damage_from: [],
      },
      {
        double_damage_from: ["grass"],
        half_damage_from: [],
        no_damage_from: [],
      },
    ]);

    const grassWeak = result.weakTo.find((w) => w.type === "grass");
    expect(grassWeak?.multiplier).toBe(4);
  });
});
