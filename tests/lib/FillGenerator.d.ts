import Generator from '@civ-clone/core-world-generator/Generator';
import Terrain from '@civ-clone/core-terrain/Terrain';
export declare class FillGenerator extends Generator {
  #private;
  constructor(height: number, width: number, TerrainType?: typeof Terrain);
  generate(): Terrain[];
}
export default FillGenerator;
