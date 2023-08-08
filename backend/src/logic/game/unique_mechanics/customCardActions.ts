import { Player } from "../../player/player"
import { Id } from "../../types"
import { feedback } from "../actionFeedbacks"
import { BossCard, DungeonCard, HeroCard } from "../cards"

const { v4 } = require("uuid")

class CardAction {
    static cardActions: { [id: Id]: CardAction } = {}

    title: string
    allowUseFor: Player[] | (() => Player[])
    onUse: (player: Player) => void
    actionDisabled: boolean
    id: Id
    assignTo: DungeonCard | BossCard | HeroCard
    additionalUseValidation?: (player: Player) => boolean

    constructor({ title, allowUseFor, onUse, additionalUseValidation = () => true, assignTo }: { title: string, allowUseFor: Player[] | (() => Player[]), onUse: (player: Player) => void, additionalUseValidation?: (player: Player) => boolean, assignTo: DungeonCard | BossCard | HeroCard }) {
        this.title = title
        this.allowUseFor = allowUseFor // Array of all players allowed to use this
        this.onUse = onUse
        this.additionalUseValidation = additionalUseValidation
        this.actionDisabled = false
        this.id = v4()
        this.assignTo = assignTo
        CardAction.cardActions[this.id] = this

        assignTo.customCardActions.push(this)
    }

    isDisabled(): boolean {
        return this.actionDisabled
    }

    setActionDisabled(bool: boolean) {
        this.actionDisabled = bool
    }

    canPlayerUse(player: Player) {
        if (this.actionDisabled) {
            throw new Error("This action is disabled.")
        }

        let allowUseFor: Player[] = []
        if (typeof this.allowUseFor === "function") {
            allowUseFor = this.allowUseFor()
        }
        else {
            allowUseFor = this.allowUseFor
        }

        for (let allowedPlayer of allowUseFor) {
            if (player.id === allowedPlayer.id) {
                return true
            }
        }
        return this.additionalUseValidation(player)
    }

    handleUsedByPlayer(player: Player) {
        if (this.canPlayerUse(player)) {
            this.onUse(player)
            this.assignTo.trackedGame.saveGameAction(feedback.PLAYER_USED_CUSTOM_CARD_ACTION(player, this.assignTo, this))
        }
    }

    static getCardActionById(id: string | number) {
        return CardAction.cardActions[id]
    }
}


module.exports = {
    CardAction
}

export { CardAction }
