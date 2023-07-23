"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { HeroNotFoundInCity, InvalidTreasureType } = require("../errors");
class SelectionRequest {
    constructor(requestedPlayer, requestItemType, amount, choiceScope = 'ANY', target) {
        this.requestedPlayer = requestedPlayer;
        this.requestItemType = requestItemType;
        this.amount = amount;
        this.choiceScope = choiceScope; // player object to hace acces to
        this.selectedItems = [];
        this.target = target;
    }
    getRequestItemType() {
        return this.requestItemType;
    }
    selectItem(item) {
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item);
            if (this.isCompleted()) {
                this.resolveTarget();
            }
        }
    }
    isSelectionValid(selectedItem) {
        // Still TODO other variants...
        if (this.choiceScope === SelectionRequest.scopeCity) {
            switch (this.requestItemType) {
                case SelectionRequest.requestItemTypes.HERO:
                    const hero = this.requestedPlayer.trackedGame.city.find((hero) => hero.id === selectedItem.id);
                    if (!hero) {
                        throw new HeroNotFoundInCity("Selected hero isn't in city");
                    }
                    break;
                default:
                    // TODO...
                    throw new Error("Unhandled check. TODO...");
                    break;
            }
        }
        else if (this.choiceScope === SelectionRequest.scopeAny) {
            switch (this.requestItemType) {
                case SelectionRequest.requestItemTypes.TREASURE:
                    if (!(selectedItem === 'magic' || selectedItem === 'fortune' || selectedItem === 'strength' || selectedItem === 'faith')) {
                        throw new InvalidTreasureType("Only 'fortune', 'magic', 'streangth' and 'faith' are valid treasure types.");
                    }
                    break;
                default:
                    break;
            }
        }
        return true;
    }
    isCompleted() {
        return this.amount === this.selectedItems.length;
    }
    resolveTarget() {
        this.requestedPlayer.setRequestedSelection(null);
        this.target.receiveSelectionData(this.selectedItems);
        this.target.use();
    }
}
SelectionRequest.requestItemTypes = {
    HERO: 'hero',
    DUNGEON: 'dungeon',
    PLAYER: 'player',
    SPELL: 'spell',
    TREASURE: 'treasure'
};
SelectionRequest.scopeAny = 'ANY';
SelectionRequest.scopeCity = 'CITY';
SelectionRequest.scopeDeadHeroes = 'DEAD_HEROES';
class SelectionRequestOneFromGivenList {
    constructor(requestedPlayer, selectionMessage, avalibleItemsForSelectArr, target) {
        this.requestedPlayer = requestedPlayer;
        this.selectionMessage = selectionMessage;
        this.avalibleItemsForSelectArr = avalibleItemsForSelectArr;
        this.selectedItems = [];
        this.target = target;
        this.requestItemType = SelectionRequestOneFromGivenList.chooseFromGivenListRequestType;
    }
    getRequestItemType() {
        return this.requestItemType;
    }
    selectItem(item) {
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item);
            if (this.isCompleted()) {
                this.resolveTarget();
            }
        }
    }
    isSelectionValid(selectedItem) {
        let isItemIn = false;
        for (const item of this.avalibleItemsForSelectArr) {
            if (selectedItem === item) {
                isItemIn = true;
            }
        }
        return isItemIn;
    }
    isCompleted() {
        return this.selectedItems.length === 1;
    }
    resolveTarget() {
        this.requestedPlayer.setRequestedSelection(null);
        this.target.receiveSelectionData(this.selectedItems);
        this.target.use();
    }
}
SelectionRequestOneFromGivenList.chooseFromGivenListRequestType = 'CHOOSE_FROM_GIVEN_LIST';
module.exports = {
    SelectionRequest,
    SelectionRequestOneFromGivenList
};
