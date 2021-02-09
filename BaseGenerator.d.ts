import Terrain from '@civ-clone/core-terrain/Terrain';
import {
  Generator,
  IGenerator,
} from '@civ-clone/core-world-generator/Generator';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
export declare class BaseGenerator extends Generator implements IGenerator {
  #private;
  constructor({
    coverage,
    chanceToBecomeLand,
    clusterChance,
    height,
    landCoverage,
    landMassReductionScale,
    maxIterations,
    pathChance,
    rulesRegistry,
    width,
  }?: {
    coverage?: number;
    chanceToBecomeLand?: number;
    clusterChance?: number;
    height?: number;
    landCoverage?: number;
    landMassReductionScale?: number;
    maxIterations?: number;
    pathChance?: number;
    rulesRegistry?: RuleRegistry;
    width?: number;
  });
  generateLand(): Terrain[];
  generate(): Terrain[];
  getNeighbours(index: number, directNeighbours?: boolean): number[];
  populateTerrain(): void;
}
export default BaseGenerator;
