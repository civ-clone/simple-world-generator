import Generator from '@civ-clone/core-world-generator/Generator';
import { Land } from '@civ-clone/core-terrain/Types';
import Terrain from '@civ-clone/core-terrain/Terrain';

export class FillGenerator extends Generator {
  #Terrain: typeof Terrain;
  #height: number;
  #width: number;

  constructor(
    height: number,
    width: number,
    TerrainType: typeof Terrain = Land
  ) {
    super(height, width);

    this.#height = height;
    this.#width = width;
    this.#Terrain = TerrainType;
  }

  generate(): Promise<Terrain[]> {
    return new Promise<Terrain[]>((resolve): void => {
      resolve(
        new Array(this.#height * this.#width)
          .fill(0)
          .map((): Terrain => new this.#Terrain())
      );
    });
  }
}

export default FillGenerator;
