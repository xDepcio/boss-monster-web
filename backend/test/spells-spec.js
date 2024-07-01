"use strict";
// const { expect } = require("chai");
// const { Game } = require('../logic/game/game')
// const Player = require('../logic/player/player')
// const { BossCard, DungeonCard, HeroCard, SpellCard } = require('../logic/game/cards')
// const DUNGEON_CARDS = require('./test-cards.json').dungeons
// const BOSS_CARDS = require('./test-cards.json').bosses
// const HERO_CARDS = require('./test-cards.json').heroes;
// const SPELL_CARDS = require('./test-cards.json').spells;
// const { bossesMechanicsMap } = require('../logic/game/unique_mechanics/bossMecahnics')
// const { dungeonMechanicsMap } = require('../logic/game/unique_mechanics/dungeonMechanics')
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const game_1 = require("../src/logic/game/game");
const player_1 = require("../src/logic/player/player");
const cards_1 = require("../src/logic/game/cards");
// const { spellsMechanicsMap } = require('../logic/game/unique_mechanics/spellsMechanics')
const test_cards_json_1 = require("./test-cards.json");
const bossMecahnics_1 = require("../src/logic/game/unique_mechanics/bossMecahnics");
const dungeonMechanics_1 = require("../src/logic/game/unique_mechanics/dungeonMechanics");
const spellsMechanics_1 = require("../src/logic/game/unique_mechanics/spellsMechanics");
const findCardByName = (where, cardName) => {
    let foundCard;
    where.forEach(card => {
        if (card.name === cardName) {
            foundCard = card;
        }
    });
    return foundCard;
};
const addSpellToPlayer = (player, game, spellName) => {
    let spell = findCardByName(test_cards_json_1.spells, spellName);
    const { CARDTYPE, id, name, playablePhase, description, skip } = spell;
    const cardMechanic = spellsMechanics_1.spellsMechanicsMap[name];
    let createdSpell = new cards_1.SpellCard(id, name, CARDTYPE, game, playablePhase, cardMechanic, description);
    createdSpell.owner = player;
    player.spellCards.push(createdSpell);
};
const addDungeonToPlayer = (player, game, dungeonName) => {
    let dungeon = findCardByName(test_cards_json_1.dungeons, dungeonName);
    const { id, name, CARDTYPE, damage, isFancy, treasure, type, mechanicType, mechanicDescription, skip } = dungeon;
    const cardMechanic = dungeonMechanics_1.dungeonMechanicsMap[name];
    let createdDungeon = new cards_1.DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy, cardMechanic, mechanicType, mechanicDescription);
    createdDungeon.owner = player;
    player.dungeonCards.push(createdDungeon);
};
const addBossToPlayer = (player, game, bossName) => {
    let boss = findCardByName(test_cards_json_1.bosses, bossName);
    const { id, name, pd, treasure, CARDTYPE, skip, mechanicDescription } = boss;
    const cardMechanic = bossMecahnics_1.bossesMechanicsMap[name];
    let createdBoss = new cards_1.BossCard(id, name, CARDTYPE, game, pd, treasure, cardMechanic, mechanicDescription);
    createdBoss.owner = player;
    player.drawnBosses.push(createdBoss);
};
const createCard = (game, card) => {
    let createdObj;
    if (card.CARDTYPE === "DUNGEON") {
        const { id, name, CARDTYPE, damage, isFancy, treasure, type } = card;
        createdObj = new cards_1.DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy, undefined, undefined, undefined);
    }
    else if (card.CARDTYPE === "SPELL") {
        const { id, name, CARDTYPE, playablePhase } = card;
        createdObj = new cards_1.SpellCard(id, name, CARDTYPE, game, playablePhase, undefined, undefined);
    }
    else if (card.CARDTYPE === "HERO") {
        const { id, name, CARDTYPE, health, treasure, damageDealt } = card;
        createdObj = new cards_1.HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt);
    }
    else if (card.CARDTYPE === "BOSS") {
        const { id, name, CARDTYPE, pd, treasure } = card;
        createdObj = new cards_1.BossCard(id, name, CARDTYPE, game, pd, treasure, undefined, undefined);
    }
    return createdObj;
};
describe('Spell cards', () => {
    context("Wyczerpanie (Zadaj X obrażeń jednemu bohaterowi w Twoich podziemiach, gdzie X jest równy liczbie widocznych komnat w Twoich podziemiach.)", () => {
        let player1 = new player_1.Player(undefined, 'olek');
        let player2 = new player_1.Player(undefined, 'mat');
        let bosses;
        let game = new game_1.Game(undefined, [player1, player2]);
        let testedCard;
        beforeEach(() => {
            testedCard = findCardByName(test_cards_json_1.spells, "Wyczerpanie");
            player1 = new player_1.Player(1, 'olek');
            player2 = new player_1.Player(2, 'mat');
            game = new game_1.Game(1, [player1, player2]);
            function getObjectedCards(cards) {
                let finalCards = [];
                for (let card of cards) {
                    let createdObj;
                    if (card.CARDTYPE === "DUNGEON") {
                        const { id, name, CARDTYPE, damage, isFancy, treasure, type } = card;
                        createdObj = new cards_1.DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy, undefined, undefined, undefined);
                    }
                    else if (card.CARDTYPE === "SPELL") {
                        const { id, name, CARDTYPE, playablePhase } = card;
                        createdObj = new cards_1.SpellCard(id, name, CARDTYPE, game, playablePhase, undefined, undefined);
                    }
                    else if (card.CARDTYPE === "HERO") {
                        const { id, name, CARDTYPE, health, treasure, damageDealt } = card;
                        createdObj = new cards_1.HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt);
                    }
                    else if (card.CARDTYPE === "BOSS") {
                        const { id, name, CARDTYPE, pd, treasure } = card;
                        createdObj = new cards_1.BossCard(id, name, CARDTYPE, game, pd, treasure, undefined, undefined);
                    }
                    finalCards.push(createdObj);
                }
                return finalCards;
            }
            const spells = getObjectedCards(test_cards_json_1.spells);
            const dungeons = getObjectedCards(test_cards_json_1.dungeons);
            const heroes = getObjectedCards(test_cards_json_1.heroes);
            bosses = getObjectedCards(test_cards_json_1.bosses);
            game.notUsedSpellCardsStack = [...spells];
            game.notUsedDungeonCardsStack = [...dungeons];
            game.notUsedHeroCardsStack = [...heroes];
            game.notUsedBossesStack = [...bosses];
        });
        it('Deal damage 1 dungeon', () => {
            player1.drawnBosses = [];
            player2.drawnBosses = [];
            addBossToPlayer(player1, game, "dummy_1fortune_580pd");
            addBossToPlayer(player2, game, "dummy_1fortune_580pd");
            player1.selectBoss(player1.drawnBosses[0].id);
            player2.selectBoss(player2.drawnBosses[0].id);
            player1.dungeonCards = [];
            player2.dungeonCards = [];
            addDungeonToPlayer(player1, game, "dung_monsters_2dmg_1faith");
            addDungeonToPlayer(player2, game, "dung_traps_1dmg_2strength");
            player2.spellCards = [];
            addSpellToPlayer(player2, game, "Wyczerpanie");
            player1.declareBuild(player1.dungeonCards[0]);
            player2.declareBuild(player2.dungeonCards[0]);
            game.city = [createCard(game, findCardByName(test_cards_json_1.heroes, "hero_10hp_strength"))];
            player1.becomeReady();
            player2.becomeReady();
            player2.playSpell(player2.spellCards[0].id);
            player1.acceptSpellPlay();
            player2.acceptSpellPlay();
            player2.requestedSelection.selectItem(player2.dungeonEntranceHeroes[0]);
            (0, chai_1.expect)(player2.dungeonEntranceHeroes[0].baseHealth).to.deep.equal(10);
            (0, chai_1.expect)(player2.dungeonEntranceHeroes[0].health).to.deep.equal(9);
            (0, chai_1.expect)(player2.spellCards.length).to.deep.equal(0);
        });
        it('Deal damage and kill', () => {
            player1.drawnBosses = [];
            player2.drawnBosses = [];
            addBossToPlayer(player1, game, "dummy_1fortune_580pd");
            addBossToPlayer(player2, game, "dummy_1fortune_580pd");
            player1.selectBoss(player1.drawnBosses[0].id);
            player2.selectBoss(player2.drawnBosses[0].id);
            player1.dungeonCards = [];
            player2.dungeonCards = [];
            addDungeonToPlayer(player1, game, "dung_monsters_2dmg_1faith");
            addDungeonToPlayer(player2, game, "dung_traps_1dmg_2strength");
            player2.spellCards = [];
            addSpellToPlayer(player2, game, "Wyczerpanie");
            player1.declareBuild(player1.dungeonCards[0]);
            player2.declareBuild(player2.dungeonCards[0]);
            game.city = [createCard(game, findCardByName(test_cards_json_1.heroes, "hero_1hp_strength"))];
            player1.becomeReady();
            player2.becomeReady();
            player2.playSpell(player2.spellCards[0].id);
            player1.acceptSpellPlay();
            player2.acceptSpellPlay();
            player2.requestedSelection.selectItem(player2.dungeonEntranceHeroes[0]);
            (0, chai_1.expect)(player2.dungeonEntranceHeroes.length).to.deep.equal(0);
            (0, chai_1.expect)(player2.totalScore).to.deep.equal(1);
            (0, chai_1.expect)(player2.spellCards.length).to.deep.equal(0);
        });
    });
});
