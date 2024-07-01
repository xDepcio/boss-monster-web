import { DungeonCard, HeroCard, SpellCard, BossCard } from "./cards.js"
import { bossesMechanicsMap } from "./unique_mechanics/bossMecahnics.js"
import { dungeonMechanicsMap } from "./unique_mechanics/dungeonMechanics.js"
import { spellsMechanicsMap } from "./unique_mechanics/spellsMechanics.js"
import { bosses as BOSS_CARDS, dungeons as DUNGEON_CARDS, heroes as HERO_CARDS, spells as SPELL_CARDS } from "./cards.json"


function getShuffledDungeonCards(game) {
    let dungeonCards = []
    for (let card of DUNGEON_CARDS) {
        if (card.CARDTYPE === "DUNGEON") {
            const { id, name, CARDTYPE, damage, isFancy, treasure, type, mechanicType, mechanicDescription, skip } = card
            if (skip) {
                continue
            }
            const cardMechanic = dungeonMechanicsMap[name]

            const createdCardObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type as any, isFancy, cardMechanic, mechanicType as any, mechanicDescription)
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
            const { CARDTYPE, id, name, playablePhase, description, skip } = card as any
            if (skip) {
                continue
            }
            const spellMechanic = spellsMechanicsMap[name]

            const createdCardObj = new SpellCard(id, name, CARDTYPE, game, playablePhase as any, spellMechanic, description)
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
            const { CARDTYPE, damageDealt, health, id, name, treasure, description, specialName, typeName, skip } = card as any
            if (skip) {
                continue
            }
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
        const { id, name, pd, treasure, CARDTYPE, skip, mechanicDescription } = card as any
        if (skip) {
            continue
        }
        const cardMechanic = bossesMechanicsMap[name]
        const createdCardObj = new BossCard(id, name, CARDTYPE, game, pd, treasure, cardMechanic, mechanicDescription)
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

export {
    getShuffledDungeonCards,
    getShuffledHeroCards,
    getShuffledSpellCards,
    getShuffledBossesCards
}
