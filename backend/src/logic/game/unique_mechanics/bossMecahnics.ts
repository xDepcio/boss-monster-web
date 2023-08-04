import { GameEvent } from "../actionFeedbacks"
import { BossCard } from "../cards"

const { eventTypes, feedback } = require("../actionFeedbacks")
const GAME_CONSTANTS = require('../gameConstants.json')
const { CardAction } = require("./customCardActions")
const { RoundModifer } = require("./roundModifiers")

class BossMechanic {

    bossCard: BossCard
    mechanicDescription: string

    constructor(bossCard: BossCard, mechanicDescription: string) {
        this.bossCard = bossCard
        this.mechanicDescription = mechanicDescription
    }

    getDescription() {
        return this.mechanicDescription
    }

    handleGameEvent(event: GameEvent): any {
        if (!this.bossCard.owner) return false

        if (!this.bossCard.hasRankedUp()) {
            if (this.bossCard.owner.dungeon.length >= GAME_CONSTANTS.dungeonsCountToRankUp) {
                this.bossCard.setRankedUp(true)
                return true
            }
            return false
        }
        return true
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

    handleGameEvent(event: GameEvent) {
        if (!super.handleGameEvent(event)) return

        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (this.bossCard.owner.id === event.player.id && event.dungeon.type === "monsters") {
                this.use()
            }
        }
    }
}

class BoostEveryTrapDungeonFor1EnemiesCanPay1GoldToDeactivate extends BossMechanic {

    appliedModifer
    handledRankUp
    addedCardAction

    constructor(bossCard, mechanicDescription) {
        super(bossCard, mechanicDescription)
        this.appliedModifer = null
        this.handledRankUp = false
        this.addedCardAction = null
    }

    handleRankUp() {
        const cardAction = new CardAction(
            "Zapłać 1 gold",
            [...this.bossCard.trackedGame.players].filter(player => player.id !== this.bossCard.owner.id),
            (playerThatUsed) => {
                this.bossCard.trackedGame.saveGameAction(feedback.PLAYER_USED_CUSTOM_CARD_ACTION(this.bossCard.owner, this.bossCard, "Zapłać 1 gold"))
                playerThatUsed.payGold(1, this.bossCard.owner)
                this.disableForRound()
            }
        )
        this.addedCardAction = cardAction
        this.bossCard.addCustomCardAction(cardAction)
        this.handledRankUp = true
    }

    disableForRound() {
        this.addedCardAction.setActionDisabled(true)
        this.bossCard.trackedGame.addRoundModifier(
            new RoundModifer(
                () => {
                    this.bossCard.owner.dungeon.forEach((dungeonCard) => {
                        if (dungeonCard.type === GAME_CONSTANTS.dungeonTypes.traps) {
                            dungeonCard.damage -= 1
                        }
                    })
                },
                () => {
                    this.bossCard.owner.dungeon.forEach((dungeonCard) => {
                        if (dungeonCard.type === GAME_CONSTANTS.dungeonTypes.traps) {
                            dungeonCard.damage += 1
                        }
                    })
                },
            )
        )
    }

    handleGameEvent(event: GameEvent) {
        if (!super.handleGameEvent(event)) return

        if (!this.handledRankUp) {
            this.handleRankUp()
        }

        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (this.appliedModifer === null) {
                const modifer = new RoundModifer(
                    () => {
                        this.addedCardAction.setActionDisabled(false)
                        this.bossCard.owner.dungeon.forEach((dungeonCard) => {
                            if (dungeonCard.type === "traps") {
                                dungeonCard.damage += 1
                            }
                        })
                    },
                    () => {
                        this.bossCard.owner.dungeon.forEach((dungeonCard) => {
                            if (dungeonCard.type === "traps") {
                                dungeonCard.damage -= 1
                            }
                        })
                        this.appliedModifer = null
                    },
                )

                this.appliedModifer = modifer
                this.bossCard.trackedGame.addRoundModifier(modifer)
            }
        }
    }
}

const bossesMechanicsMap = {
    'Lamia': GainOneGoldEveryTimeMonsterDungeonIsBuild,
    'Scott': BoostEveryTrapDungeonFor1EnemiesCanPay1GoldToDeactivate
}

module.exports = {
    bossesMechanicsMap
}

export { BossMechanic }
