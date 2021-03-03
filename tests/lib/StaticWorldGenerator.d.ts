import Generator from '@civ-clone/core-world-generator/Generator';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeature from '@civ-clone/core-terrain-feature/TerrainFeature';
import { TerrainFeatureRegistry } from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
export declare class StaticWorldGenerator extends Generator {
  #private;
  constructor(terrainFeatureRegistry?: TerrainFeatureRegistry);
  generate(): Promise<Terrain[]>;
  getTerrainWithFeature(
    TerrainType: typeof Terrain,
    ...features: typeof TerrainFeature[]
  ): Terrain;
}
export default StaticWorldGenerator;
