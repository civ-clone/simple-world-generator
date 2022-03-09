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
} from '@civ-clone/civ1-world/Terrains';
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
} from '@civ-clone/civ1-world/TerrainFeatures';
import Loader from './Loader';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainFeature from '@civ-clone/core-terrain-feature/TerrainFeature';
import World from '@civ-clone/core-world/World';

type StringTerrain =
  | 'A'
  | 'D'
  | 'F'
  | 'G'
  | 'H'
  | 'J'
  | 'M'
  | 'O'
  | 'P'
  | 'R'
  | 'S'
  | 'T';
type StringFeature = 'c' | 'f' | 'a' | 'e' | 'g' | 'h' | 'i' | 'o' | 's' | 'd';

export const simpleRLELoader =
  (ruleRegistry: RuleRegistry) =>
  (map: string, height: number, width: number): World => {
    const terrainLookup = {
        A: Arctic,
        D: Desert,
        F: Forest,
        G: Grassland,
        H: Hills,
        J: Jungle,
        M: Mountains,
        O: Ocean,
        P: Plains,
        R: River,
        S: Swamp,
        T: Tundra,
      } as { [key in StringTerrain]: typeof Terrain },
      featureLookup = {
        c: Coal,
        f: Fish,
        a: Game,
        e: Gems,
        g: Gold,
        h: Horse,
        i: Oasis,
        o: Oil,
        s: Seal,
        d: Shield,
      } as { [key in StringFeature]: typeof TerrainFeature },
      data = (
        map.replace(/\s+/g, '').match(/(\d+|)([A-Z])([a-z]+|)/g) || []
      ).flatMap((definition: string): [Terrain, ...TerrainFeature[]][] => {
        const [, n, terrainIndex, featureIndices] = definition.match(
          /(\d+|)([A-Z])([a-z]+|)?/
        ) as [never, string, StringTerrain, StringFeature[]];

        return new Array(parseInt(n) || 1)
          .fill(0)
          .map((): [Terrain, ...TerrainFeature[]] => {
            const terrain = new terrainLookup[terrainIndex](),
              features =
                [...(featureIndices || [])].map(
                  (featureIndex: StringFeature): TerrainFeature =>
                    new featureLookup[featureIndex](terrain)
                ) || [];

            return [terrain, ...features];
          });
      }),
      world = new World(new Loader(height, width, data));

    world.build(ruleRegistry);

    return world;
  };

export default simpleRLELoader;
