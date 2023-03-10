const { HeroNotFoundInCity } = require("../errors")

class SelectionRequest {
    static requestItemTypes = {
        HERO: 'hero',
        DUNGEON: 'dungeon',
        PLAYER: 'player',
        SPELL: 'spell'
    }
    static scopeAny = 'ANY'
    static scopeCity = 'CITY'

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

    isSelectionValid(selectedItem) {
        // Still TODO other variants...
        if (this.choiceScope === SelectionRequest.scopeCity) {
            switch (this.requestItemType) {
                case SelectionRequest.requestItemTypes.HERO:
                    const hero = this.requestedPlayer.trackedGame.city.find((hero) => hero.id === selectedItem.id)
                    if (!hero) {
                        throw new HeroNotFoundInCity("Selected hero isn't in city")
                    }
                    break;

                default:
                    // TODO...
                    throw new Error("Unhandled check. TODO...")
                    break;
            }
        }
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
