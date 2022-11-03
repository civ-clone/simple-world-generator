import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import World from '@civ-clone/core-world/World';
export declare const simpleRLELoader: (
  ruleRegistry?: RuleRegistry,
  terrainFeatureRegistry?: TerrainFeatureRegistry
) => (map: string, height: number, width: number) => Promise<World>;
export default simpleRLELoader;
