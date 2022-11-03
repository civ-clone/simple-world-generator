import {
  Generator,
  IGenerator,
} from '@civ-clone/core-world-generator/Generator';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TerrainRegistry } from '@civ-clone/core-terrain/TerrainRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
export declare type IOptions = {
  landCoverage?: number;
  landSize?: number;
  maxIterations?: number;
  clusterChance?: number;
  coverage?: number;
  pathChance?: number;
};
export declare class BaseGenerator extends Generator implements IGenerator {
  #private;
  constructor(
    height?: number,
    width?: number,
    options?: IOptions,
    ruleRegistry?: RuleRegistry,
    terrainRegistry?: TerrainRegistry,
    randomNumberGenerator?: () => number
  );
  generateIslands(): Promise<void>;
  generate(): Promise<Terrain[]>;
  getNeighbours(index: number, directNeighbours?: boolean): number[];
  populateTerrain(): Promise<void>;
}
export default BaseGenerator;
