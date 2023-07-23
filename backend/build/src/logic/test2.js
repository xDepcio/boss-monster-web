"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { parse, stringify, toJSON, fromJSON } = require('flatted');
const CircularJSON = require('circular-json');
const player1 = {
    name: 'olek',
    trackedGame: null
};
const player2 = {
    name: 'mat',
    trackedGame: null
};
const game = {
    players: [player1, player2],
    selectedPlayer: player1
};
player1.trackedGame = game;
player2.trackedGame = game;
// console.log(toJSON(game))
const serialized = stringify(game);
console.log(serialized);
const unserialized = parse(serialized);
console.log(unserialized);
