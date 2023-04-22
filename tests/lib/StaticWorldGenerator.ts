import {
  Arctic,
  Desert,
  Forest,
  Grassland,
  Hills,
  Jungle,
  Mountains,
  Ocean,
  Plains,
  River,
  Swamp,
  Tundra,
} from '@civ-clone/library-world/Terrains';
import {
  Coal,
  Fish,
  Game,
  Gems,
  Gold,
  Horse,
  Oasis,
  Oil,
  Seal,
  Shield,
} from '@civ-clone/library-world/TerrainFeatures';
import Generator from '@civ-clone/core-world-generator/Generator';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeature from '@civ-clone/core-terrain-feature/TerrainFeature';
import {
  TerrainFeatureRegistry,
  instance as terrainFeatureRegistryInstance,
} from '@civ-clone/core-terrain-feature/TerrainFeatureRegistry';

export class StaticWorldGenerator extends Generator {
  #terrainFeatureRegistry: TerrainFeatureRegistry;

  constructor(
    terrainFeatureRegistry: TerrainFeatureRegistry = terrainFeatureRegistryInstance
  ) {
    super(1, 24);

    this.#terrainFeatureRegistry = terrainFeatureRegistry;
  }

  generate(): Promise<Terrain[]> {
    const terrains: [typeof Terrain, ...(typeof TerrainFeature)[]][] = [
      [Arctic],
      [Arctic, Seal],
      [Desert],
      [Desert, Oasis],
      [Forest],
      [Forest, Horse],
      [Grassland],
      [Grassland, Shield],
      [Hills],
      [Hills, Coal],
      [Jungle],
      [Jungle, Gems],
      [Mountains],
      [Mountains, Gold],
      [Ocean],
      [Ocean, Fish],
      [Plains],
      [Plains, Game],
      [River],
      [River, Shield],
      [Swamp],
      [Swamp, Oil],
      [Tundra],
      [Tundra, Game],
    ];

    return new Promise((resolve): void => {
      resolve(
        terrains.map(
          ([TerrainType, ...features]: [
            typeof Terrain,
            ...(typeof TerrainFeature)[]
          ]): Terrain => this.getTerrainWithFeature(TerrainType, ...features)
        )
      );
    });
  }

  getTerrainWithFeature(
    TerrainType: typeof Terrain,
    ...features: (typeof TerrainFeature)[]
  ): Terrain {
    const terrain = new TerrainType();

    features.forEach((Feature: typeof TerrainFeature) => {
      this.#terrainFeatureRegistry.register(new Feature(terrain));
    });

    return terrain;
  }
}

export default StaticWorldGenerator;
