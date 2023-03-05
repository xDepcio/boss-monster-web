const { OncePerRoundMechanicUsedAlready } = require("../../errors")
const { feedback, eventTypes } = require("../actionFeedbacks")

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
        if (!this.dungeonCard.getDescription()) {
            this.dungeonCard.setDescription(this.mechanicDescription)
        }
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
        // this.dungeonCard.owner.deleteFromDungeon(this)
    }

    getHeroOnThisDungeon() {
        const hero = this.dungeonCard.owner.dungeonEntranceHeroes.find(hero => hero.dungeonRoom?.id === this.dungeonCard.id)
        return hero
    }
}


class Get3MoneyOnDestroy extends DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        dungeonCard.setAllowDestroy(true)
    }

    use() {
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        this.dungeonCard.owner.addGold(3)
        // this.dungeonCard.owner.deleteFromDungeon(this)
    }
}


class DrawSpellWhenPlayedSpell extends DungeonMechanic { // "Raz na rundę: kiedy zagrasz kartę czaru, dociągnij kartę czaru."
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        this.usedInRound = false
    }

    use() {
        if (this.usedInRound) {
            throw new OncePerRoundMechanicUsedAlready("This card was already used in this round")
        }
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        this.dungeonCard.owner.drawNotUsedSpellCard()
        this.usedInRound = true
    }

    handleGameEvent(event) {
        if (!this.usedInRound) {
            if (event.type === eventTypes.PLAYER_PLAYED_SPELL) {
                if (event.player === this.dungeonCard.owner) {
                    this.use()
                }
            }
        }
    }
}


const dungeonMechanicsMap = {
    'Bezdenna czeluść': EliminateHeroInDungeon,
    'Niestabilna kopalnia': Get3MoneyOnDestroy,
    'Norka kocicy': DrawSpellWhenPlayedSpell
}


module.exports = {
    dungeonMechanicsMap,
    mechanicsTypes
}
