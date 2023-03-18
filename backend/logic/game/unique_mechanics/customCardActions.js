const { v4 } = require("uuid")

class CardAction {
    static cardActions = {}

    constructor(title, allowUseFor, onUse) {
        this.title = title
        this.allowUseFor = allowUseFor // Array of all players allowed to use this
        this.onUse = onUse
        this.actionDisabled = false
        this.id = v4()
        CardAction.cardActions[this.id] = this

    }

    setActionDisabled(bool) {
        this.actionDisabled = bool
    }

    canPlayerUse(player) {
        if (this.actionDisabled) return false

        for (let allowedPlayer of this.allowUseFor) {
            if (player.id === allowedPlayer.id) {
                return true
            }
        }
        return false
    }

    handleUsedByPlayer(player) {
        if (this.canPlayerUse(player)) {
            this.onUse(player)
        }
    }

    static getCardActionById(id) {
        return CardAction.cardActions[id]
    }
}


module.exports = {
    CardAction
}
