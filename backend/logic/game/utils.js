const DUNGEON_CARDS = require('./cards.json').dungeons
const SPELL_CARDS = require('./cards.json').spells
const HERO_CARDS = require('./cards.json').heroes
const BOSS_CARDS = require('./cards.json').bosses
const { DungeonCard, HeroCard, SpellCard, BossCard } = require('./cards')
const { dungeonMechanicsMap } = require('./unique_mechanics/dungeonMechanics')
const { spellsMechanicsMap } = require('./unique_mechanics/spellsMechanics')


function getShuffledDungeonCards(game) {
    let dungeonCards = []
    for (let card of DUNGEON_CARDS) {
        if (card.CARDTYPE === "DUNGEON") {
            const { id, name, CARDTYPE, damage, isFancy, treasure, type, mechanicType, mechanicDescription } = card
            const cardMechanic = dungeonMechanicsMap[name]

            const createdCardObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy, cardMechanic, mechanicType, mechanicDescription)
            dungeonCards.push(createdCardObj)
        }
    }
    dungeonCards = shuuffled(dungeonCards)
    return dungeonCards
}

function getShuffledSpellCards(game) {
    let dungeonCards = []
    for (let card of SPELL_CARDS) {
        if (card.CARDTYPE === "SPELL") {
            const { CARDTYPE, id, name, playablePhase, description } = card
            const spellMechanic = spellsMechanicsMap[name]

            const createdCardObj = new SpellCard(id, name, CARDTYPE, game, playablePhase, spellMechanic, description)
            dungeonCards.push(createdCardObj)
        }
    }
    dungeonCards = shuuffled(dungeonCards)
    return dungeonCards
}

function getShuffledHeroCards(game) {
    let dungeonCards = []
    for (let card of HERO_CARDS) {
        if (card.CARDTYPE === "HERO") {
            const { CARDTYPE, damageDealt, health, id, name, treasure, description, specialName, typeName } = card
            const createdCardObj = new HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt, description || null, specialName || null, typeName || null)
            dungeonCards.push(createdCardObj)
        }
    }
    dungeonCards = shuuffled(dungeonCards)
    return dungeonCards
}


function getShuffledBossesCards(game) {
    let bossCards = []
    for (let card of BOSS_CARDS) {
        const { id, name, pd, treasure, CARDTYPE } = card
        const createdCardObj = new BossCard(id, name, CARDTYPE, game, pd, treasure)
        bossCards.push(createdCardObj)
    }
    bossCards = shuuffled(bossCards)
    return bossCards
}


function shuuffled(array) {
    let shuffledArray = [...array]
    for (let i = 0; i < shuffledArray.length; i++) {
        const j = Math.floor(Math.random() * shuffledArray.length)
        const temp = shuffledArray[i]
        shuffledArray[i] = shuffledArray[j]
        shuffledArray[j] = temp
    }
    return shuffledArray
}


module.exports = {
    getShuffledDungeonCards,
    getShuffledHeroCards,
    getShuffledSpellCards,
    getShuffledBossesCards
}
