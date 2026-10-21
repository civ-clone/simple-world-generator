import {
  Generator,
  IGenerator,
} from '@civ-clone/core-world-generator/Generator';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TerrainRegistry } from '@civ-clone/core-terrain/TerrainRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
export type IOptions = {
  landCoverage?: number;
  landSize?: number;
  maxIterations?: number;
  clusterChance?: number;
  coverage?: number;
  pathChance?: number;
  topologyId?: string;
};
export declare class BaseGenerator extends Generator implements IGenerator {
  private _landCoverage;
  private _landSize;
  private _maxIterations;
  private _clusterChance;
  private _coverage;
  private _pathChance;
  private _map;
  private _randomNumberGenerator;
  private _ruleRegistry;
  private _terrainRegistry;
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
  populateTerrain(): Promise<void>;
}
export default BaseGenerator;
