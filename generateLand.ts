import distanceFrom from '@civ-clone/core-world-generator/lib/distanceFrom';
import getNeighbours from '@civ-clone/core-world-generator/lib/getNeighbours';
import { parentPort, workerData } from 'worker_threads';

const {
  height,
  width,

  islandSize: maxIslandPercentage,
  landCoverage,
  maxIterations,
} = workerData;

const maxIslandSize = Math.ceil(((height * width) / 100) * maxIslandPercentage),
  map: number[] = new Array(height * width).fill(0);

while (
  map.length === 0 ||
  map.filter((value: number): boolean => value === 1).length / map.length <
    landCoverage
) {
  const seen: { [key: number]: number } = {},
    currentIsland: number[] = [],
    toProcess: number[] = [],
    seedTile: number = Math.floor(height * width * Math.random()),
    flagAsSeen: (id: number) => void = (id: number): void => {
      if (!(id in seen)) {
        seen[id] = 0;
      }

      seen[id]++;
    };

  map[seedTile] = 1;
  currentIsland.push(seedTile);

  flagAsSeen(seedTile);

  toProcess.push(...getNeighbours(height, width, seedTile));

  while (toProcess.length) {
    const currentTile = toProcess.shift() as number;
    // ,
    //   distance = distanceFrom(height, width, seedTile, currentTile),
    //   surroundingLand = getNeighbours(height, width, currentTile, false).filter(
    //     (n: number): boolean => map[n] === 1
    //   );

    if ((seen[currentTile] || 0) <= maxIterations) {
      if (
        Math.random() > 0.3
        // maxIslandPercentage >= Math.sqrt(distance) * Math.random() ||
        // surroundingLand.length * Math.random() > 3
      ) {
        map[currentTile] = 1;
        currentIsland.push(currentTile);

        getNeighbours(height, width, currentTile)
          .filter((tile) => toProcess.indexOf(tile) === -1)
          .forEach((tile) => toProcess.push(tile));
      } else {
        getNeighbours(height, width, currentTile).forEach((tile) => {
          const index = toProcess.indexOf(tile);

          if (index > -1) {
            toProcess.splice(index, 1);
          }
        });
      }

      flagAsSeen(currentTile);
    }

    if (
      currentIsland.length > maxIslandSize ||
      map.filter((value: number): boolean => value === 1).length / map.length >=
        landCoverage
    ) {
      break;
    }
  }

  if (
    map.filter((value: number): boolean => value === 1).length / map.length >=
    landCoverage
  ) {
    break;
  }
}

parentPort?.postMessage(map);
