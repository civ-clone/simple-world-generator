import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import World from '@civ-clone/core-world/World';
export declare const simpleRLELoader: (
  ruleRegistry: RuleRegistry
) => (map: string, height: number, width: number) => World;
export default simpleRLELoader;
