// const { expect } = require("chai");
// const { Game } = require('../logic/game/game')
// const Player = require('../logic/player/player')
// const { BossCard, DungeonCard, HeroCard, SpellCard } = require('../logic/game/cards')
// describe('Dungeon Cards', () => {
//     context("Full game cycle tests", () => {
//         let spells
//         let dungeons
//         let heroes
//         let bosses
//         let player1
//         let player2
//         let game
//         beforeEach(() => {
//             spells = [
//                 {
//                     "CARDTYPE": "SPELL",
//                     "id": 3,
//                     "name": "spell 1",
//                     "playablePhase": "build"
//                 },
//                 {
//                     "CARDTYPE": "SPELL",
//                     "id": 6,
//                     "name": "spell 2",
//                     "playablePhase": "fight"
//                 }
//             ]
//             dungeons = [
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 1,
//                     "name": "dungeon 1",
//                     "type": "monsters",
//                     "damage": 2,
//                     "treasure": {
//                         "faith": 1
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 2,
//                     "name": "dungeon 2",
//                     "type": "traps",
//                     "damage": 3,
//                     "treasure": {
//                         "strength": 2
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 7,
//                     "name": "dungeon 3",
//                     "type": "monsters",
//                     "damage": 2,
//                     "treasure": {
//                         "fortune": 2
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 8,
//                     "name": "dungeon 4",
//                     "type": "traps",
//                     "damage": 4,
//                     "treasure": {
//                         "faith": 1,
//                         "strength": 2
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 9,
//                     "name": "dungeon 5",
//                     "type": "traps",
//                     "damage": 2,
//                     "treasure": {
//                         "strength": 1
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 10,
//                     "name": "dungeon 6 fancy",
//                     "type": "monsters",
//                     "damage": 4,
//                     "treasure": {
//                         "magic": 2
//                     },
//                     "isFancy": true
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 11,
//                     "name": "Biuro kadr",
//                     "type": "monsters",
//                     "damage": 1,
//                     "treasure": {
//                         "magic": 1,
//                         "strength": 1
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 12,
//                     "name": "Niszczyciel umysłów",
//                     "type": "monsters",
//                     "damage": 2,
//                     "treasure": {
//                         "magic": 1
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 13,
//                     "name": "Bezdenna czeluść",
//                     "type": "traps",
//                     "damage": 1,
//                     "treasure": {
//                         "fortune": 1
//                     },
//                     "isFancy": false
//                 },
//                 {
//                     "CARDTYPE": "DUNGEON",
//                     "id": 14,
//                     "name": "Diabliczki w spa",
//                     "type": "monsters",
//                     "damage": 1,
//                     "treasure": {
//                         "faith": 1
//                     },
//                     "isFancy": false
//                 }
//             ]
//             heroes = [
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 4,
//                     "name": "hero 1",
//                     "health": 4,
//                     "treasure": "magic",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 5,
//                     "name": "hero 2",
//                     "health": 11,
//                     "treasure": "strength",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 6,
//                     "name": "hero 3",
//                     "health": 8,
//                     "treasure": "fortune",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 7,
//                     "name": "hero 4",
//                     "health": 4,
//                     "treasure": "faith",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 8,
//                     "name": "Mag",
//                     "health": 4,
//                     "treasure": "magic",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 9,
//                     "name": "Najemnik",
//                     "health": 6,
//                     "treasure": "strength",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 10,
//                     "name": "Wojownik",
//                     "health": 6,
//                     "treasure": "strength",
//                     "damageDealt": 1
//                 },
//                 {
//                     "CARDTYPE": "HERO",
//                     "id": 11,
//                     "name": "Złodziej",
//                     "health": 4,
//                     "treasure": "fortune",
//                     "damageDealt": 1
//                 }
//             ]
//             bosses = [
//                 {
//                     "CARDTYPE": "BOSS",
//                     "id": 1,
//                     "name": "Lamia",
//                     "pd": 255,
//                     "treasure": {
//                         "strength": 1
//                     }
//                 },
//                 {
//                     "CARDTYPE": "BOSS",
//                     "id": 2,
//                     "name": "Belladonna",
//                     "pd": 860,
//                     "treasure": {
//                         "faith": 1
//                     }
//                 },
//                 {
//                     "CARDTYPE": "BOSS",
//                     "id": 3,
//                     "name": "ROBOBO",
//                     "pd": 400,
//                     "treasure": {
//                         "strength": 1
//                     }
//                 },
//                 {
//                     "CARDTYPE": "BOSS",
//                     "id": 4,
//                     "name": "gała",
//                     "pd": 630,
//                     "treasure": {
//                         "magic": 1
//                     }
//                 }
//             ]
//             player1 = new Player(1, 'olek')
//             player2 = new Player(2, 'mat')
//             game = new Game(1, [player1, player2])
//             function getObjectedCards(cards) {
//                 let finalCards = []
//                 for (let card of cards) {
//                     let createdObj
//                     if (card.CARDTYPE === "DUNGEON") {
//                         const { id, name, CARDTYPE, damage, isFancy, treasure, type } = card
//                         createdObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy)
//                     }
//                     else if (card.CARDTYPE === "SPELL") {
//                         const { id, name, CARDTYPE, playablePhase } = card
//                         createdObj = new SpellCard(id, name, CARDTYPE, game, playablePhase)
//                     }
//                     else if (card.CARDTYPE === "HERO") {
//                         const { id, name, CARDTYPE, health, treasure, damageDealt } = card
//                         createdObj = new HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt)
//                     }
//                     else if (card.CARDTYPE === "BOSS") {
//                         const { id, name, CARDTYPE, pd, treasure } = card
//                         createdObj = new BossCard(id, name, CARDTYPE, game, pd, treasure)
//                     }
//                     finalCards.push(createdObj)
//                 }
//                 return finalCards
//             }
//             spells = getObjectedCards(spells)
//             dungeons = getObjectedCards(dungeons)
//             heroes = getObjectedCards(heroes)
//             bosses = getObjectedCards(bosses)
//             game.notUsedSpellCardsStack = [...spells]
//             game.notUsedDungeonCardsStack = [...dungeons]
//             game.notUsedHeroCardsStack = [...heroes]
//             game.notUsedBossesStack = [...bosses]
//         })
//         it('Bezdenna czeluść ()', () => { })
//         it('One round not full cycle with hero passing up to 1 dungeon', () => {
//             player1.drawnBosses = [bosses[3], bosses[0]]
//             player2.drawnBosses = [bosses[1], bosses[2]]
//             player1.selectBoss(4)
//             player2.selectBoss(2)
//             player1.dungeonCards = [dungeons[2], dungeons[4]]
//             player2.dungeonCards = [dungeons[8], dungeons[0]]
//             player1.declareBuild(dungeons[2])
//             player2.declareBuild(dungeons[8])
//             player1.becomeReady()
//             player2.becomeReady()
//             player1.acceptHeroMove()
//             player2.acceptHeroMove()
//             player2.acceptHeroMove()
//             player1.acceptHeroMove()
//         })
//         it('2 rounds cycle with hero passing 2 dungeons', () => {
//             game.city = [heroes[2], heroes[7], heroes[1], heroes[3]]
//             player1.drawnBosses = [bosses[0], bosses[1]]
//             player2.drawnBosses = [bosses[2], bosses[3]]
//             player1.selectBoss(1)
//             player2.selectBoss(3)
//             player1.dungeonCards = [dungeons[8], dungeons[2]]
//             player2.dungeonCards = [dungeons[7], dungeons[3]]
//             player1.declareBuild(player1.dungeonCards[0])
//             player2.declareBuild(player2.dungeonCards[0])
//             player1.becomeReady()
//             player2.becomeReady()
//             player1.acceptHeroMove()
//             player2.acceptHeroMove()
//             player2.acceptHeroMove()
//             player1.acceptHeroMove()
//             player1.becomeReady()
//             player2.becomeReady()
//             player1.declareBuild(player1.dungeonCards[0])
//             player2.declareBuild(player2.dungeonCards[0])
//             player1.becomeReady()
//             player2.becomeReady()
//             player1.acceptHeroMove()
//             player2.acceptHeroMove()
//             player2.acceptHeroMove()
//             player1.acceptHeroMove()
//         })
//     })
// })
// export { }
