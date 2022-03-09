"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getNeighbours_1 = require("@civ-clone/core-world-generator/lib/getNeighbours");
const worker_threads_1 = require("worker_threads");
const { height, width, islandSize: maxIslandPercentage, landCoverage, maxIterations, } = worker_threads_1.workerData;
const maxIslandSize = Math.ceil(((height * width) / 100) * maxIslandPercentage), map = new Array(height * width).fill(0);
while (map.length === 0 ||
    map.filter((value) => value === 1).length / map.length <
        landCoverage) {
    const seen = {}, currentIsland = [], toProcess = [], seedTile = Math.floor(height * width * Math.random()), flagAsSeen = (id) => {
        if (!(id in seen)) {
            seen[id] = 0;
        }
        seen[id]++;
    };
    map[seedTile] = 1;
    currentIsland.push(seedTile);
    flagAsSeen(seedTile);
    toProcess.push(...(0, getNeighbours_1.default)(height, width, seedTile));
    while (toProcess.length) {
        const currentTile = toProcess.shift();
        // ,
        //   distance = distanceFrom(height, width, seedTile, currentTile),
        //   surroundingLand = getNeighbours(height, width, currentTile, false).filter(
        //     (n: number): boolean => map[n] === 1
        //   );
        if ((seen[currentTile] || 0) <= maxIterations) {
            if (Math.random() > 0.3
            // maxIslandPercentage >= Math.sqrt(distance) * Math.random() ||
            // surroundingLand.length * Math.random() > 3
            ) {
                map[currentTile] = 1;
                currentIsland.push(currentTile);
                (0, getNeighbours_1.default)(height, width, currentTile)
                    .filter((tile) => toProcess.indexOf(tile) === -1)
                    .forEach((tile) => toProcess.push(tile));
            }
            else {
                (0, getNeighbours_1.default)(height, width, currentTile).forEach((tile) => {
                    const index = toProcess.indexOf(tile);
                    if (index > -1) {
                        toProcess.splice(index, 1);
                    }
                });
            }
            flagAsSeen(currentTile);
        }
        if (currentIsland.length > maxIslandSize ||
            map.filter((value) => value === 1).length / map.length >=
                landCoverage) {
            break;
        }
    }
    if (map.filter((value) => value === 1).length / map.length >=
        landCoverage) {
        break;
    }
}
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(map);
//# sourceMappingURL=generateLand.js.map