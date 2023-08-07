const { Game } = require('../../logic/game/game')
const { DungeonCard, HeroCard, SpellCard, BossCard } = require('../../logic/game/cards')
const { bossesMechanicsMap } = require('../../logic/game/unique_mechanics/bossMecahnics')
const { dungeonMechanicsMap } = require('../../logic/game/unique_mechanics/dungeonMechanics')
const { spellsMechanicsMap } = require('../../logic/game/unique_mechanics/spellsMechanics')


function getPrefabDungeonCards(game, cards) {
    let dungeonCards = []
    for (let card of cards) {
        if (card.CARDTYPE === "DUNGEON") {
            const { id, name, CARDTYPE, damage, isFancy, treasure, type, mechanicType, mechanicDescription, skip } = card
            if (skip) {
                continue
            }
            const cardMechanic = dungeonMechanicsMap[name]

            const createdCardObj = new DungeonCard(id, name, CARDTYPE, game, damage, treasure, type, isFancy, cardMechanic, mechanicType, mechanicDescription)
            dungeonCards.push(createdCardObj)
        }
    }
    return dungeonCards
}

function getPrefabSpellCards(game, cards) {
    let dungeonCards = []
    for (let card of cards) {
        if (card.CARDTYPE === "SPELL") {
            const { CARDTYPE, id, name, playablePhase, description, skip } = card
            if (skip) {
                continue
            }
            const spellMechanic = spellsMechanicsMap[name]

            const createdCardObj = new SpellCard(id, name, CARDTYPE, game, playablePhase, spellMechanic, description)
            dungeonCards.push(createdCardObj)
        }
    }
    return dungeonCards
}

function getPrefabHeroCards(game, cards) {
    let dungeonCards = []
    for (let card of cards) {
        if (card.CARDTYPE === "HERO") {
            const { CARDTYPE, damageDealt, health, id, name, treasure, description, specialName, typeName, skip, isLegendary } = card
            if (skip) {
                continue
            }
            const createdCardObj = new HeroCard(id, name, CARDTYPE, game, health, treasure, damageDealt, description || null, specialName || null, typeName || null, isLegendary)
            dungeonCards.push(createdCardObj)
        }
    }
    return dungeonCards
}


function getPrefabBossesCards(game, cards) {
    let bossCards = []
    for (let card of cards) {
        const { id, name, pd, treasure, CARDTYPE, skip, mechanicDescription } = card
        if (skip) {
            continue
        }
        const cardMechanic = bossesMechanicsMap[name]
        const createdCardObj = new BossCard(id, name, CARDTYPE, game, pd, treasure, cardMechanic, mechanicDescription)
        bossCards.push(createdCardObj)
    }
    return bossCards
}

module.exports = {
    getPrefabBossesCards,
    getPrefabDungeonCards,
    getPrefabHeroCards,
    getPrefabSpellCards
}

export { }
