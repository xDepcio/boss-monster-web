const { expect } = require("chai");
const { Game } = require('../logic/game/game')
const Player = require('../logic/player/player')
const { BossCard, DungeonCard, HeroCard, SpellCard } = require('../logic/game/cards')
const DUNGEON_CARDS = require('./test-cards.json').dungeons
const BOSS_CARDS = require('./test-cards.json').bosses
const HERO_CARDS = require('./test-cards.json').heroes;
const SPELL_CARDS = require('./test-cards.json').spells;
const { bossesMechanicsMap } = require('../logic/game/unique_mechanics/bossMecahnics')
const { dungeonMechanicsMap } = require('../logic/game/unique_mechanics/dungeonMechanics')
const { spellsMechanicsMap } = require('../logic/game/unique_mechanics/spellsMechanics')

const findCardByName = (where, cardName) => {
    let foundCard
    where.forEach(card => {
        if (card.name === cardName) {
            foundCard = card
        }
    });
    return foundCard
}

const addSpellToPlayer = (player, game, spellName) => {
    let spell = findCardByName(SPELL_CARDS, spellName)
    const { CARDTYPE, id, name, playablePhase, description, skip } = spell
    const cardMechanic = spellsMechanicsMap[name]
    let createdSpell = new SpellCard(id, name, CARDTYPE, game, playablePhase, cardMechanic, description)
    createdSpell.owner = player
    player.spellCards.push(createdSpell)
}

const addDungeonToPlayer = (player, game, dungeonName) => {
    let dungeon = findCardByName(DUNGEON_CARDS, dungeonName)
    const { id, name, CARDTYPE, damage, isFancy, treasure, type, mechanicType, mechanicDescription, skip } = dungeon
    const cardMechanic = dungeonMechanicsMap[name]
    let createdDungeon = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy, cardMechanic, mechanicType, mechanicDescription)
    createdDungeon.owner = player
    player.dungeonCards.push(createdDungeon)
}

const addBossToPlayer = (player, game, bossName) => {
    let boss = findCardByName(BOSS_CARDS, bossName)
    const { id, name, pd, treasure, CARDTYPE, skip, mechanicDescription } = boss
    const cardMechanic = bossesMechanicsMap[name]
    let createdBoss = new BossCard(id, name, CARDTYPE, game, pd, treasure, cardMechanic, mechanicDescription)
    createdBoss.owner = player
    player.drawnBosses.push(createdBoss)
}

const createCard = (game, card) => {
    let createdObj
    if (card.CARDTYPE === "DUNGEON") {
        const { id, name, CARDTYPE, damage, isFancy, treasure, type } = card
        createdObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy)
    }
    else if (card.CARDTYPE === "SPELL") {
        const { id, name, CARDTYPE, playablePhase } = card
        createdObj = new SpellCard(id, name, CARDTYPE, game, playablePhase)
    }
    else if (card.CARDTYPE === "HERO") {
        const { id, name, CARDTYPE, health, treasure, damageDealt } = card
        createdObj = new HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt)
    }
    else if (card.CARDTYPE === "BOSS") {
        const { id, name, CARDTYPE, pd, treasure } = card
        createdObj = new BossCard(id, name, CARDTYPE, game, pd, treasure)
    }
    return createdObj
}

describe('Spell cards', () => {

    context("Wyczerpanie (Zadaj X obrażeń jednemu bohaterowi w Twoich podziemiach, gdzie X jest równy liczbie widocznych komnat w Twoich podziemiach.)", () => {
        let player1 = new Player()
        let player2 = new Player()
        let bosses
        let game = new Game()
        let testedCard
        let hero = new HeroCard()
        beforeEach(() => {
            testedCard = findCardByName(SPELL_CARDS, "Wyczerpanie")

            player1 = new Player(1, 'olek')
            player2 = new Player(2, 'mat')
            game = new Game(1, [player1, player2])

            function getObjectedCards(cards) {
                let finalCards = []
                for (let card of cards) {
                    let createdObj
                    if (card.CARDTYPE === "DUNGEON") {
                        const { id, name, CARDTYPE, damage, isFancy, treasure, type } = card
                        createdObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy)
                    }
                    else if (card.CARDTYPE === "SPELL") {
                        const { id, name, CARDTYPE, playablePhase } = card
                        createdObj = new SpellCard(id, name, CARDTYPE, game, playablePhase)
                    }
                    else if (card.CARDTYPE === "HERO") {
                        const { id, name, CARDTYPE, health, treasure, damageDealt } = card
                        createdObj = new HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt)
                    }
                    else if (card.CARDTYPE === "BOSS") {
                        const { id, name, CARDTYPE, pd, treasure } = card
                        createdObj = new BossCard(id, name, CARDTYPE, game, pd, treasure)
                    }
                    finalCards.push(createdObj)
                }
                return finalCards
            }
            spells = getObjectedCards(SPELL_CARDS)
            dungeons = getObjectedCards(DUNGEON_CARDS)
            heroes = getObjectedCards(HERO_CARDS)
            bosses = getObjectedCards(BOSS_CARDS)
            game.notUsedSpellCardsStack = [...spells]
            game.notUsedDungeonCardsStack = [...dungeons]
            game.notUsedHeroCardsStack = [...heroes]
            game.notUsedBossesStack = [...bosses]
        })

        it('Deal damage 1 dungeon', () => {
            player1.drawnBosses = []
            player2.drawnBosses = []
            addBossToPlayer(player1, game, "dummy_1fortune_580pd")
            addBossToPlayer(player2, game, "dummy_1fortune_580pd")
            player1.selectBoss(player1.drawnBosses[0].id)
            player2.selectBoss(player2.drawnBosses[0].id)

            player1.dungeonCards = []
            player2.dungeonCards = []
            addDungeonToPlayer(player1, game, "dung_monsters_2dmg_1faith")
            addDungeonToPlayer(player2, game, "dung_traps_1dmg_2strength")

            player2.spellCards = []
            addSpellToPlayer(player2, game, "Wyczerpanie")

            player1.declareBuild(player1.dungeonCards[0])
            player2.declareBuild(player2.dungeonCards[0])

            game.city = [createCard(game, findCardByName(HERO_CARDS, "hero_10hp_strength"))]

            player1.becomeReady()
            player2.becomeReady()
            player2.playSpell(player2.spellCards[0].id)
            player1.acceptSpellPlay()
            player2.acceptSpellPlay()
            player2.requestedSelection.selectItem(player2.dungeonEntranceHeroes[0])

            expect(player2.dungeonEntranceHeroes[0].baseHealth).to.deep.equal(10)
            expect(player2.dungeonEntranceHeroes[0].health).to.deep.equal(9)
            expect(player2.spellCards.length).to.deep.equal(0)
        })

        it('Deal damage and kill', () => {
            player1.drawnBosses = []
            player2.drawnBosses = []
            addBossToPlayer(player1, game, "dummy_1fortune_580pd")
            addBossToPlayer(player2, game, "dummy_1fortune_580pd")
            player1.selectBoss(player1.drawnBosses[0].id)
            player2.selectBoss(player2.drawnBosses[0].id)

            player1.dungeonCards = []
            player2.dungeonCards = []
            addDungeonToPlayer(player1, game, "dung_monsters_2dmg_1faith")
            addDungeonToPlayer(player2, game, "dung_traps_1dmg_2strength")

            player2.spellCards = []
            addSpellToPlayer(player2, game, "Wyczerpanie")

            player1.declareBuild(player1.dungeonCards[0])
            player2.declareBuild(player2.dungeonCards[0])

            game.city = [createCard(game, findCardByName(HERO_CARDS, "hero_1hp_strength"))]

            player1.becomeReady()
            player2.becomeReady()
            player2.playSpell(player2.spellCards[0].id)
            player1.acceptSpellPlay()
            player2.acceptSpellPlay()
            player2.requestedSelection.selectItem(player2.dungeonEntranceHeroes[0])

            expect(player2.dungeonEntranceHeroes.length).to.deep.equal(0)
            expect(player2.totalScore).to.deep.equal(1)
            expect(player2.spellCards.length).to.deep.equal(0)
        })
    })
})
