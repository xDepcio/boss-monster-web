const DUNGEON_CARDS = require('./cards.json').dungeons
const SPELL_CARDS = require('./cards.json').spells
const HERO_CARDS = require('./cards.json').heroes
const BOSS_CARDS = require('./cards.json').bosses
const { DungeonCard, HeroCard, SpellCard } = require('./cards')


function getShuffledDungeonCards(game) {
    let dungeonCards = []
    for (let card of DUNGEON_CARDS) {
        if (card.CARDTYPE === "DUNGEON") {
            const { id, name, CARDTYPE, damage, isFancy, treasure, type } = card
            const createdCardObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy)
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
            const { CARDTYPE, id, name, playablePhase } = card
            const createdCardObj = new SpellCard(id, name, CARDTYPE, game, playablePhase)
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
            const { CARDTYPE, damageDealt, health, id, name, treasure } = card
            const createdCardObj = new HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt)
            dungeonCards.push(createdCardObj)
        }
    }
    dungeonCards = shuuffled(dungeonCards)
    return dungeonCards
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
    getShuffledSpellCards
}
