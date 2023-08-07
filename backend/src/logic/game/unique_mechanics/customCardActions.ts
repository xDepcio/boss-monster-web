import { Player } from "../../player/player"
import { Id } from "../../types"

const { v4 } = require("uuid")

class CardAction {
    static cardActions: { [id: Id]: CardAction } = {}

    title: string
    allowUseFor: Player[] | (() => Player[])
    onUse: (player: Player) => void
    actionDisabled: boolean
    id: Id
    additionalUseValidation?: (player: Player) => boolean

    constructor({ title, allowUseFor, onUse, additionalUseValidation = () => true }: { title: string, allowUseFor: Player[] | (() => Player[]), onUse: (player: Player) => void, additionalUseValidation?: (player: Player) => boolean }) {
        this.title = title
        this.allowUseFor = allowUseFor // Array of all players allowed to use this
        this.onUse = onUse
        this.additionalUseValidation = additionalUseValidation
        this.actionDisabled = false
        this.id = v4()
        CardAction.cardActions[this.id] = this

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
