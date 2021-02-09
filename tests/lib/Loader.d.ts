import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import Generator from '@civ-clone/core-world-generator/Generator';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeature from '@civ-clone/core-terrain-feature/TerrainFeature';
export declare class Loader extends Generator {
  #private;
  constructor(
    height: number,
    width: number,
    data: [Terrain, ...TerrainFeature[]][],
    terrainFeatureRegistry?: TerrainFeatureRegistry
  );
  generate(): Terrain[];
}
export default Loader;
