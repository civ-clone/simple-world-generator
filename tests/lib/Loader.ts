import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';
import Generator from '@civ-clone/core-world-generator/Generator';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeature from '@civ-clone/core-terrain-feature/TerrainFeature';

export class Loader extends Generator {
  #data: [Terrain, ...TerrainFeature[]][];
  #height: number;
  #width: number;
  #terrainFeatureRegistry: TerrainFeatureRegistry;

  constructor(
    height: number,
    width: number,
    data: [Terrain, ...TerrainFeature[]][],
    terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance
  ) {
    super(height, width);

    this.#height = height;
    this.#width = width;
    this.#data = data;
    this.#terrainFeatureRegistry = terrainFeatureRegistry;
  }

  generate(): Terrain[] {
    return this.#data.map(
      ([terrain, ...features]: [Terrain, ...TerrainFeature[]]): Terrain => {
        this.#terrainFeatureRegistry.register(...features);

        return terrain;
      }
    );
  }
}

export default Loader;
