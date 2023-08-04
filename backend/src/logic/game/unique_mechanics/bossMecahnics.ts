import { GameEvent } from "../actionFeedbacks"
import { BossCard } from "../cards"
import { CardAction } from "./customCardActions"
import { RoundModifer } from "./roundModifiers"

const { eventTypes, feedback } = require("../actionFeedbacks")
const GAME_CONSTANTS = require('../gameConstants.json')
// const { CardAction } = require("./customCardActions")
// const { RoundModifer } = require("./roundModifiers")

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

    validate(): boolean {
        if (!this.bossCard.owner) return false

        if (!this.bossCard.hasRankedUp()) {
            if (this.bossCard.owner.dungeon.length >= GAME_CONSTANTS.dungeonsCountToRankUp) {
                this.bossCard.setRankedUp(true)
                return false
            }
            return false
        }
        return true
    }

    handleGameEvent(event: GameEvent): any {
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
        if (!super.validate()) return
        // if (!super.handleGameEvent(event)) return

        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (this.bossCard.owner.id === event.player.id && event.dungeon.type === "monsters") {
                this.use()
            }
        }
    }
}

class BoostEveryTrapDungeonFor1EnemiesCanPay1GoldToDeactivate extends BossMechanic {

    appliedModifer: RoundModifer
    // handledRankUp: boolean
    disabled: boolean
    addedCardAction: CardAction

    constructor(bossCard: BossCard, mechanicDescription: string) {
        super(bossCard, mechanicDescription)
        this.appliedModifer = null
        // this.handledRankUp = false
        this.addedCardAction = null
        this.disabled = false
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
        // this.handledRankUp = true
    }

    disableForRound() {
        this.addedCardAction.setActionDisabled(true)
        this.appliedModifer.endManually()
        this.disabled = true
    }

    applyModifier() {
        const existingCards = [...this.bossCard.owner.dungeon]
        const modifer = new RoundModifer(
            () => {
                this.addedCardAction.setActionDisabled(false)
                existingCards.forEach((dungeonCard) => {
                    if (dungeonCard.type === "traps") {
                        dungeonCard.damage += 1
                    }
                })
            },
            () => {
                existingCards.forEach((dungeonCard) => {
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

    reApplayModifier() {
        if (this.appliedModifer) {
            this.appliedModifer.endManually()
        }
        this.applyModifier()
    }

    handleGameEvent(event: GameEvent) {
        if (!super.validate()) return

        if (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) {
            this.handleRankUp()
        }

        if (event.type === "NEW_ROUND_BEGUN") {
            this.disabled = false
        }

        if (!this.disabled) {
            this.reApplayModifier()
        }

        // if (event.type === "START_BUILD_PHASE" || event.type === "START_FIGHT" || (event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id) || (event.type === 'PLAYER_BUILD_DUNGEON' && event.dungeon.type === "traps")) {
        // if (
        //     (this.appliedModifer === null && event.type === "START_FIGHT") ||
        //     (this.appliedModifer === null && event.type === "PLAYER_RANKED_UP_BOSS" && event.player.id === this.bossCard.owner.id)2
        // ) {
        //     this.applyModifier()
        // }
        // else if (event.type === 'PLAYER_BUILD_DUNGEON' && event.dungeon.type === "traps" && event.dungeon.owner.id === this.bossCard.owner.id && this.appliedModifer !== null && !this.disabled) {
        //     this.reApplayModifier()
        // }
    }
}

class MakeEveryOpponentDestroyOneDungeon extends BossMechanic { }

const bossesMechanicsMap = {
    'Lamia': GainOneGoldEveryTimeMonsterDungeonIsBuild,
    'Scott': BoostEveryTrapDungeonFor1EnemiesCanPay1GoldToDeactivate,
}

module.exports = {
    bossesMechanicsMap
}

export { BossMechanic }
