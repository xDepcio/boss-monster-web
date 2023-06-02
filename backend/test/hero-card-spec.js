// const { expect } = require("chai");
// const { Game } = require('../logic/game/game')
// const Player = require('../logic/player/player')
// const { BossCard, DungeonCard, HeroCard, SpellCard } = require('../logic/game/cards')


// describe('Hero card', () => {

//     context("getMostValuablePlayer()", () => {

//         let player1
//         let player2
//         let player3
//         let boss
//         let game
//         before(() => {
//             player1 = new Player(1, 'olek')
//             player2 = new Player(2, 'mat')
//             player3 = new Player(3, 'fafa')
//             game = new Game(1, [player1, player2, player3])
//             boss = new BossCard(1, 'gała', 'BOSS', game, 600, 'strength')
//             player1.selectedBoss = boss
//             player2.selectedBoss = boss
//             player3.selectedBoss = boss
//         })

//         it('All players have same treasure count', () => {
//             player1.treasure = {
//                 magic: 1,
//                 strength: 2,
//                 faith: 1,
//                 fortune: 1
//             }
//             player2.treasure = {
//                 magic: 1,
//                 strength: 2,
//                 faith: 1,
//                 fortune: 3
//             }
//             player3.treasure = {
//                 magic: 4,
//                 strength: 2,
//                 faith: 1,
//                 fortune: 3
//             }
//             const heroStrength = new HeroCard(1, 'h', 'HERO', game, 4, 'strength', 1)
//             const mostValuable1 = heroStrength.getMostValuablePlayer([player1, player2])
//             expect(mostValuable1).to.deep.equal(null)
//         })
//     })
// })
