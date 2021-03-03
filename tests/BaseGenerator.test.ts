import {
  Distribution,
  IDistribution,
} from '@civ-clone/core-world-generator/Rules/Distribution';
import { Grassland, Ocean, Plains } from '@civ-clone/civ1-world/Terrains';
import { Land, Water } from '@civ-clone/core-terrain/Types';
import Criterion from '@civ-clone/core-rule/Criterion';
import { DistributionGroups } from '@civ-clone/core-world-generator/Rules/DistributionGroups';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '../BaseGenerator';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import { expect } from 'chai';
import { TerrainRegistry } from '@civ-clone/core-terrain/TerrainRegistry';

describe('BaseGenerator', () => {
  const height = 10,
    width = 10,
    generator = new Generator(height, width);

  generator.generate();

  it('should return the expected dimensions', () => {
    expect(generator.height()).to.equal(height);
    expect(generator.width()).to.equal(width);
  });

  it('should correctly convert coordinates to an index', () => {
    expect(generator.coordsToIndex(0, 2)).to.equal(20);
    expect(
      generator
        .getNeighbours(generator.coordsToIndex(0, 2))
        .includes(generator.coordsToIndex(10, 1))
    ).to.true;
  });

  it('should calculate distance correctly', () => {
    expect(
      generator.distanceFrom(
        generator.coordsToIndex(0, 0),
        generator.coordsToIndex(9, 9)
      ) < 1.5
    ).to.true;
    expect(
      generator.distanceFrom(
        generator.coordsToIndex(0, 0),
        generator.coordsToIndex(0, 9)
      )
    ).to.equal(1);
  });
});
