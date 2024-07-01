"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const game_1 = require("../src/logic/game/game");
describe('Sample Test', () => {
    it('should return true', () => {
        console.log('Hello World');
        console.log('Hello World');
        console.log('Hello World');
        console.log('Hello World');
        console.log('Hello World');
        (0, chai_1.expect)(true).to.be.true;
    });
    it('boss monster test test', () => {
        const game = new game_1.Game(1, []);
    });
});
