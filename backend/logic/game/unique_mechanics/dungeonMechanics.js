const feedback = require("../actionFeedbacks")

const mechanicsTypes = {
    ON_DESTORY: 'onDestroy',
    ON_BUILD: 'onBuild',
    ONE_PER_ROUND: 'onePerRound'
}


class DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        this.dungeonCard = dungeonCard
        this.type = type
        this.mechanicDescription = mechanicDescription
    }

    getType() {
        return this.type
    }

    getDescription() {
        return this.mechanicDescription
    }
}


class EliminateHeroInDungeon extends DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        dungeonCard.setAllowDestroy(true)
    }

    use() {
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        const hero = this.getHeroOnThisDungeon()
        if (hero) {
            hero.die()
        }
    }

    getHeroOnThisDungeon() {
        const hero = this.dungeonCard.owner.dungeonEntranceHeroes.find(hero => hero.dungeonRoom?.id === this.dungeonCard.id)
        return hero
    }
}


const dungeonMechanicsMap = {
    'Bezdenna czeluść': EliminateHeroInDungeon
}

module.exports = {
    dungeonMechanicsMap,
    mechanicsTypes
}
