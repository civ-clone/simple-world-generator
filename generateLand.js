"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const distanceFrom_1 = require("@civ-clone/core-world-generator/lib/distanceFrom");
const getNeighbours_1 = require("@civ-clone/core-world-generator/lib/getNeighbours");
const worker_threads_1 = require("worker_threads");
const { height, width, islandSize, landCoverage, maxIterations, } = worker_threads_1.workerData;
const map = new Array(height * width).fill(0);
while (map.length === 0 ||
    map.filter((value) => value === 1).length / map.length <
        landCoverage) {
    const seen = {}, toProcess = [], seedTile = Math.floor(height * width * Math.random()), flagAsSeen = (id) => {
        if (!(id in seen)) {
            seen[id] = 0;
        }
        seen[id]++;
    };
    map[seedTile] = 1;
    flagAsSeen(seedTile);
    toProcess.push(...getNeighbours_1.default(height, width, seedTile));
    while (toProcess.length) {
        const currentTile = toProcess.shift(), distance = distanceFrom_1.default(height, width, seedTile, currentTile), surroundingLand = getNeighbours_1.default(height, width, currentTile, false).filter((n) => map[n] === 1);
        if ((seen[currentTile] || 0) <= maxIterations) {
            if (islandSize >= Math.sqrt(distance) * Math.random() ||
                surroundingLand.length * Math.random() > 3) {
                map[currentTile] = 1;
                getNeighbours_1.default(height, width, currentTile)
                    .filter((tile) => toProcess.indexOf(tile) === -1)
                    .forEach((tile) => toProcess.push(tile));
            }
            else {
                getNeighbours_1.default(height, width, currentTile).forEach((tile) => {
                    const index = toProcess.indexOf(tile);
                    if (index > -1) {
                        toProcess.splice(index, 1);
                    }
                });
            }
            flagAsSeen(currentTile);
        }
        if (map.filter((value) => value === 1).length / map.length >=
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