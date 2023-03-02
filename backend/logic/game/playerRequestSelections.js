class SelectionRequest {
    static requestItemTypes = {
        HERO: 'hero',
        DUNGEON: 'dungeon',
        PLAYER: 'player',
    }
    static scopeAny = 'ANY'

    constructor(requestedPlayer, requestItemType, amount, choiceScope = 'ANY', target) {
        this.requestedPlayer = requestedPlayer
        this.requestItemType = requestItemType
        this.amount = amount
        this.choiceScope = choiceScope // player object to hace acces to
        this.selectedItems = []
        this.target = target
    }

    getRequestItemType() {
        return this.requestItemType
    }

    selectItem(item) {
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item)
            if (this.isCompleted()) {
                this.resolveTarget()
            }
        }
    }

    isSelectionValid() {
        ///TODO...
        return true
    }

    isCompleted() {
        return this.amount === this.selectedItems.length
    }

    resolveTarget() {
        this.requestedPlayer.setRequestedSelection(null)
        this.target.receiveSelectionData(this.selectedItems)
        this.target.use()
    }
}


module.exports = {
    SelectionRequest
}
