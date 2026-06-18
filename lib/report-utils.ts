import type { ScenarioWithEvidences } from "@/lib/actions/scenarios";

export function groupScenariosByModule(
  scenarios: ScenarioWithEvidences[],
): { module: string; scenarios: ScenarioWithEvidences[] }[] {
  const map = new Map<string, ScenarioWithEvidences[]>();
  for (const scenario of scenarios) {
    const list = map.get(scenario.module) ?? [];
    list.push(scenario);
    map.set(scenario.module, list);
  }
  return Array.from(map.entries()).map(([module, items]) => ({
    module,
    scenarios: items,
  }));
}
