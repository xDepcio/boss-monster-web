const { eventTypes, feedback } = require("../actionFeedbacks")
const GAME_CONSTANTS = require('../gameConstants.json')

class BossMechanic {
    constructor(bossCard, mechanicDescription) {
        this.bossCard = bossCard
        this.mechanicDescription = mechanicDescription
    }

    getDescription() {
        return this.mechanicDescription
    }

    handleGameEvent(event) {
        if (!this.bossCard.owner) return

        if (!this.bossCard.hasRankedUp()) {
            if (this.bossCard.owner.dungeon.length >= GAME_CONSTANTS.dungeonsCountToRankUp) {
                this.bossCard.setRankedUp(true)
            }
            return
        }
    }
}

class GainOneGoldEveryTimeMonsterDungeonIsBuild extends BossMechanic {
    constructor(bossCard, mechanicDescription) {
        super(bossCard, mechanicDescription)
    }

    use() {
        this.bossCard.owner.addGold(1)
        this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_BOSS_RANKUP_MECHANIC(this.bossCard.owner, this.bossCard, this))
    }

    handleGameEvent(event) {
        super.handleGameEvent(event)

        if (event.type === eventTypes.PLAYER_BUILD_DUNGEON) {
            if (this.bossCard.owner.id === event.player.id && event.dungeon.type === GAME_CONSTANTS.dungeonTypes.monsters) {
                this.use()
            }
        }
    }
}

const bossesMechanicsMap = {
    'Lamia': GainOneGoldEveryTimeMonsterDungeonIsBuild
}

module.exports = {
    bossesMechanicsMap
}
