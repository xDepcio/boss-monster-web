const { HeroNotFoundInCity, InvalidTreasureType } = require("../errors")

class SelectionRequest {
    static requestItemTypes = {
        HERO: 'hero',
        DUNGEON: 'dungeon',
        PLAYER: 'player',
        SPELL: 'spell',
        TREASURE: 'treasure'
    }
    static scopeAny = 'ANY'
    static scopeCity = 'CITY'
    static scopeDeadHeroes = 'DEAD_HEROES'

    requestedPlayer
    requestItemType
    amount
    choiceScope
    selectedItems
    target


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
        else if (this.choiceScope === SelectionRequest.scopeAny) {
            switch (this.requestItemType) {
                case SelectionRequest.requestItemTypes.TREASURE:
                    if (!(selectedItem === 'magic' || selectedItem === 'fortune' || selectedItem === 'strength' || selectedItem === 'faith')) {
                        throw new InvalidTreasureType("Only 'fortune', 'magic', 'streangth' and 'faith' are valid treasure types.")
                    }
                    break;

                default:
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

class SelectionRequestOneFromGivenList {
    static chooseFromGivenListRequestType = 'CHOOSE_FROM_GIVEN_LIST'

    requestedPlayer
    selectionMessage
    avalibleItemsForSelectArr
    selectedItems
    target
    requestItemType


    constructor(requestedPlayer, selectionMessage, avalibleItemsForSelectArr, target) {
        this.requestedPlayer = requestedPlayer
        this.selectionMessage = selectionMessage
        this.avalibleItemsForSelectArr = avalibleItemsForSelectArr
        this.selectedItems = []
        this.target = target
        this.requestItemType = SelectionRequestOneFromGivenList.chooseFromGivenListRequestType
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
        let isItemIn = false
        for (const item of this.avalibleItemsForSelectArr) {
            if (selectedItem === item) {
                isItemIn = true
            }
        }
        return isItemIn
    }

    isCompleted() {
        return this.selectedItems.length === 1
    }

    resolveTarget() {
        this.requestedPlayer.setRequestedSelection(null)
        this.target.receiveSelectionData(this.selectedItems)
        this.target.use()
    }
}


module.exports = {
    SelectionRequest,
    SelectionRequestOneFromGivenList
}

export { SelectionRequest }
