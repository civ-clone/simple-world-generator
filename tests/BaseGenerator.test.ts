import { Land, Water } from '@civ-clone/core-terrain/Types';
import Criterion from '@civ-clone/core-rule/Criterion';
import { Distribution } from '@civ-clone/core-world-generator/Rules/Distribution';
import DistributionGroups from '@civ-clone/core-world-generator/Rules/DistributionGroups';
import Effect from '@civ-clone/core-rule/Effect';
import Generator from '../BaseGenerator';
import { ITopology } from '@civ-clone/core-world/Topology';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import SquareTopology from '@civ-clone/core-world/SquareTopology';
import Terrain from '@civ-clone/core-terrain/Terrain';
import { TerrainRegistry } from '@civ-clone/core-terrain/TerrainRegistry';
import { createHash } from 'crypto';
import { createRng } from '@civ-clone/core-random';
import { expect } from 'chai';

class Ocean extends Water {}
class Grassland extends Land {}
class Hills extends Land {}

// Islands, then a filled terrain, a clustered one and a pathed one, so every
// place `BaseGenerator` asks for neighbours or a distance is exercised.
const rules = (): RuleRegistry => {
    const ruleRegistry = new RuleRegistry();

    ruleRegistry.register(
      new DistributionGroups(new Effect(() => [Ocean, Grassland, Hills])),
      new Distribution(
        new Criterion((TerrainType: typeof Terrain) => TerrainType === Ocean),
        new Effect(() => [{ fill: true }])
      ),
      new Distribution(
        new Criterion(
          (TerrainType: typeof Terrain) => TerrainType === Grassland
        ),
        new Effect(() => [{ cluster: true, clusterChance: 0.3 }])
      ),
      new Distribution(
        new Criterion((TerrainType: typeof Terrain) => TerrainType === Hills),
        new Effect(() => [{ coverage: 0.05, path: true, pathChance: 0.5 }])
      )
    );

    return ruleRegistry;
  },
  generate = async (
    height: number,
    width: number,
    seed: number,
    GeneratorType: typeof Generator = Generator
  ): Promise<string> => {
    const rng = createRng(seed),
      generator = new GeneratorType(
        height,
        width,
        {},
        rules(),
        new TerrainRegistry(),
        rng
      ),
      map = (await generator.generate())
        .map((terrain) => terrain.constructor.name[0])
        .join('');

    return `${createHash('sha1')
      .update(map)
      .digest('hex')
      .slice(0, 12)} ${rng.calls()}`;
  };

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

  // Recorded before neighbours went through the generator's topology: the
  // SHA-1 of each map's terrain, one letter per tile, and how many random
  // numbers it drew.
  const expected: { [key: string]: string } = {
    '10x10 1': '955cf8cf2932 93',
    '10x10 2': '190514683219 86',
    '10x10 3': 'ad2772e6d4d9 78',
    '40x25 1': '3cd08319cc38 862',
    '40x25 2': '9a0b6f906cc0 848',
    '40x25 3': '028ac428c507 838',
    '64x40 1': '05e77e0514a0 2462',
    '64x40 2': '1cc9dc3c709f 2373',
    '64x40 3': '0de938c0b50c 2306',
    '80x50 1': '3af535520adc 3975',
    '80x50 2': '661170d00635 4033',
    '80x50 3': 'c117347de72c 4031',
    '17x11 1': 'dee2f7df9075 187',
    '17x11 2': 'a751fdd00cce 151',
    '17x11 3': '6219e8b4b78e 167',
  };

  Object.entries(expected).forEach(([key, value]) => {
    const [size, seed] = key.split(' '),
      [mapWidth, mapHeight] = size.split('x').map(Number);

    it(`should generate the same ${size} map for seed ${seed}`, async () => {
      expect(await generate(mapHeight, mapWidth, Number(seed))).to.equal(value);
    });
  });

  it('should lay out a square grid by default', () => {
    const topology = new Generator(6, 8).topology();

    expect(topology.id()).to.equal('square');
    expect(topology.neighbour(7, 5, 's')).to.deep.equal([7, 0]);
  });

  it('should lay out the grid its topologyId option names, and still read its other options', async () => {
    const options = {
        landCoverage: 0.5,
        landSize: 0.3,
        maxIterations: 5,
        clusterChance: 0.1,
        coverage: 0.2,
        pathChance: 0.15,
      },
      hex = new Generator(
        6,
        8,
        { topologyId: 'hex-odd-r', ...options },
        rules(),
        new TerrainRegistry(),
        createRng(1)
      ),
      topology = hex.topology();

    expect(hex.height()).to.equal(6);
    expect(hex.width()).to.equal(8);
    expect(topology.id()).to.equal('hex-odd-r');
    // 8 wide: east of the last column is the first.
    expect(topology.neighbour(7, 0, 'e')).to.deep.equal([0, 0]);
    // 6 tall: south of the last row is the first.
    expect(topology.neighbour(0, 5, 'se')![1]).to.equal(0);
    expect(hex.getNeighbours(0)).to.have.length(6);

    expect(hex.options()).to.deep.equal({
      topologyId: 'hex-odd-r',
      ...options,
    });
    Object.entries(options).forEach(([key, value]) =>
      expect((hex as any)[`_${key}`]).to.equal(value)
    );

    expect(await hex.generate()).to.have.length(48);
  });

  it('should find neighbours through its topology', async () => {
    const topologies: ITopology[] = [];

    // Square, but it only knows two of its neighbours, and counts the times
    // it is asked for one.
    class TwoNeighbours extends Generator {
      topology(): ITopology {
        if (topologies.length === 0) {
          const square = new SquareTopology(this.width(), this.height()),
            topology = Object.create(square);

          topology.asked = 0;
          topology.edgeDirections = () => ['n', 'e'];
          topology.neighbour = (x: number, y: number, direction: 'n' | 'e') => {
            topology.asked++;

            return square.neighbour(x, y, direction);
          };

          topologies.push(topology);
        }

        return topologies[0];
      }
    }

    const twoNeighbours = new TwoNeighbours(10, 10);

    expect(twoNeighbours.getNeighbours(0)).to.deep.equal([90, 1]);

    await generate(25, 40, 1, TwoNeighbours);

    expect((topologies[0] as any).asked).to.be.above(1000);
  });
});
