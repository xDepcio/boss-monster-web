import { Player } from "../player/player"
import { RequestItemType, SelectionChoiceScope, TreasureSign } from "../types"
import { BossCard, DungeonCard, HeroCard, SpellCard } from "./cards"

const { HeroNotFoundInCity, InvalidTreasureType } = require("../errors")

export type SelectableItem = Player | HeroCard | DungeonCard | SpellCard | BossCard | TreasureSign
class SelectionRequest {
    // static requestItemTypes = {
    //     HERO: 'hero',
    //     DUNGEON: 'dungeon',
    //     PLAYER: 'player',
    //     SPELL: 'spell',
    //     TREASURE: 'treasure'
    // }
    // static scopeAny = 'ANY'
    // static scopeCity = 'CITY'
    // static scopeDeadHeroes = 'DEAD_HEROES'
    requestedPlayer: Player
    requestItemType: RequestItemType
    amount: number
    choiceScope: SelectionChoiceScope
    selectedItems: SelectableItem[]
    target


    constructor(requestedPlayer: Player, requestItemType: RequestItemType, amount: number, choiceScope: SelectionChoiceScope = 'ANY', target) {
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

    selectItem(item: SelectableItem) {
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item)
            if (this.isCompleted()) {
                this.resolveTarget()
            }
        }
    }

    isSelectionValid(selectedItem: SelectableItem) {
        // Still TODO other variants...
        if (this.choiceScope === "CITY") {
            switch (this.requestItemType) {
                case "hero":
                    const hero = this.requestedPlayer.trackedGame.city.find((hero) => hero.id === (selectedItem as HeroCard).id)
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
        else if (this.choiceScope === "ANY") {
            switch (this.requestItemType) {
                case "treasure":
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

type TSelectionRequestNEWConstructor = {
    requestedPlayer: Player
    requestItemType: RequestItemType
    amount: number
    choiceScope: SelectionChoiceScope
    onFinish: (data: SelectableItem[]) => void
    message?: string
}
class SelectionRequestNEW {
    requestedPlayer: Player
    requestItemType: RequestItemType
    amount: number
    choiceScope: SelectionChoiceScope
    selectedItems: SelectableItem[]
    onFinish: (data: SelectableItem[]) => void
    message: string

    constructor({ requestedPlayer, requestItemType, amount, choiceScope, onFinish, message = '' }: TSelectionRequestNEWConstructor) {
        this.requestedPlayer = requestedPlayer
        this.requestItemType = requestItemType
        this.amount = amount
        this.choiceScope = choiceScope // player object to hace acces to
        this.selectedItems = []
        this.message = message
        this.onFinish = onFinish
    }

    getRequestItemType() {
        return this.requestItemType
    }

    selectItem(item: SelectableItem) {
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item)
            if (this.isCompleted()) {
                this.resolveTarget()
            }
        }
    }

    isSelectionValid(selectedItem: SelectableItem) {
        // Still TODO other variants...
        if (this.choiceScope === "CITY") {
            switch (this.requestItemType) {
                case "hero":
                    const hero = this.requestedPlayer.trackedGame.city.find((hero) => hero.id === (selectedItem as HeroCard).id)
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
        else if (this.choiceScope === "ANY") {
            switch (this.requestItemType) {
                case "treasure":
                    if (!(selectedItem === 'magic' || selectedItem === 'fortune' || selectedItem === 'strength' || selectedItem === 'faith')) {
                        throw new InvalidTreasureType("Only 'fortune', 'magic', 'streangth' and 'faith' are valid treasure types.")
                    }
                    break;

                default:
                    break;
            }
        }
        else if (this.choiceScope instanceof Player) {
            if ((selectedItem as DungeonCard).owner.id !== (this.choiceScope as Player).id) {
                throw new Error("Selected dungeon isn't owned by avalible player.")
            }
            switch (this.requestItemType) {
                case "builtDungeon":
                    if (!(selectedItem instanceof DungeonCard)) {
                        throw new Error("Selected item isn't a dungeon.")
                    }
                    const dungeon = this.requestedPlayer.dungeon.find((dungeon) => dungeon.id === (selectedItem as DungeonCard).id)
                    if (!dungeon) {
                        throw new Error("Selected dungeon isn't in player's dungeon")
                    }
                    break
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
        this.onFinish(this.selectedItems)
    }
}

class SelectionRequestOneFromGivenList<SelectableType> {
    // static chooseFromGivenListRequestType = 'CHOOSE_FROM_GIVEN_LIST'

    requestedPlayer: Player
    selectionMessage: string
    avalibleItemsForSelectArr: SelectableType[]
    selectedItems: SelectableType[]
    requestItemType: 'CHOOSE_FROM_GIVEN_LIST'
    onRecieveSelectionData: (data: SelectableType[]) => void

    constructor({ requestedPlayer, selectionMessage, avalibleItemsForSelectArr, onRecieveSelectionData }: { requestedPlayer: Player, selectionMessage: string, avalibleItemsForSelectArr: SelectableType[], onRecieveSelectionData: (data: SelectableType[]) => void }) {
        this.requestedPlayer = requestedPlayer
        this.selectionMessage = selectionMessage
        this.avalibleItemsForSelectArr = avalibleItemsForSelectArr
        this.selectedItems = []
        this.onRecieveSelectionData = onRecieveSelectionData
        this.requestItemType = "CHOOSE_FROM_GIVEN_LIST"
    }

    getRequestItemType() {
        return this.requestItemType
    }

    selectItem(item: SelectableType) {
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item)
            if (this.isCompleted()) {
                this.resolveTarget()
            }
        }
    }

    isSelectionValid(selectedItem: SelectableType) {
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
        this.onRecieveSelectionData(this.selectedItems)
        // this.target.receiveSelectionData(this.selectedItems)
        // this.target.use()
    }
}

/**
 * Allows for selecting any type of item without type constraints. On frontend by deafult displays a list of choices, but this can be contolled utilizing metdata property.
 */
class SelectionRequestUniversal<SelectableType> {

    requestedPlayer: Player
    selectionMessage: string
    avalibleItemsForSelectArr: SelectableType[]
    selectedItems: SelectableType[]
    requestItemType: 'UNIVERSAL_SELECTION'
    onFinish: (data: SelectableType[]) => void
    onSingleSelect?: (data: SelectableType) => void
    additonalValidation?: (selectedItem: SelectableType) => boolean
    metadata: { displayType: 'dungeonCard' | 'text' | 'mixed' | 'spellCard' | 'player' }
    amount: number
    canceled: boolean

    constructor({ requestedPlayer, selectionMessage, avalibleItemsForSelectArr, onFinish, metadata, amount, additonalValidation = () => true, onSingleSelect = () => { } }: { onSingleSelect?: (data: SelectableType) => void, additonalValidation?: (selectedItem: SelectableType) => boolean, amount: number, metadata: { displayType: 'dungeonCard' | 'text' | 'mixed' | 'spellCard' | 'player' }, requestedPlayer: Player, selectionMessage: string, avalibleItemsForSelectArr: SelectableType[], onFinish: (data: SelectableType[]) => void }) {
        this.requestedPlayer = requestedPlayer
        this.selectionMessage = selectionMessage
        this.avalibleItemsForSelectArr = avalibleItemsForSelectArr
        this.selectedItems = []
        this.onFinish = onFinish
        this.requestItemType = "UNIVERSAL_SELECTION"
        this.amount = amount
        this.additonalValidation = additonalValidation
        this.onSingleSelect = onSingleSelect
        this.metadata = metadata
        this.canceled = false

        requestedPlayer.setRequestedSelection(this);
    }

    getRequestItemType() {
        return this.requestItemType
    }

    selectItem(item: SelectableType) {
        if (this.isAreadySelected(item)) {
            this.deselectItem(item)
            return
        }
        if (this.isSelectionValid(item)) {
            this.selectedItems.push(item)
            this.onSingleSelect(item)
            if (this.isCompleted() && !this.canceled) {
                this.resolveTarget()
            }
        }
    }

    isSelectionValid(selectedItem: SelectableType) {
        let isItemIn = false
        for (const item of this.avalibleItemsForSelectArr) {
            if (selectedItem === item) {
                isItemIn = true
            }
        }
        const additionalValidation = this.additonalValidation(selectedItem)
        return isItemIn && additionalValidation
    }

    isAreadySelected(selectedItem: SelectableType): boolean {
        return this.selectedItems.includes(selectedItem)
    }

    deselectItem(item: SelectableType) {
        this.selectedItems = this.selectedItems.filter((selectedItem) => selectedItem !== item)
    }

    isCompleted() {
        return this.selectedItems.length === this.amount
    }

    resolveTarget() {
        try {
            this.onFinish(this.selectedItems)
            if (this.requestedPlayer.requestedSelection === this) {
                this.requestedPlayer.setRequestedSelection(null)
            }
        } catch (error) {
            this.selectedItems = []
            this.requestedPlayer.setRequestedSelection(this)
        }
    }

    cancel() {
        this.requestedPlayer.setRequestedSelection(null)
        this.canceled = true
    }
}

// class Class1<T> {
//     avalibleItemsForSelectArr: T[]
//     selectedItems: T[]
//     constructor(a: number, avalibleItemsForSelectArr: T[]) {
//         this.avalibleItemsForSelectArr = avalibleItemsForSelectArr
//         this.selectedItems = []
//     }

//     resolve() {
//         return this.selectedItems
//     }
// }

// const a = new Class1<"tak" | "nie">(1, ['tak', "nie"])
// let xd = a.resolve()


module.exports = {
    SelectionRequest,
    SelectionRequestOneFromGivenList,
    SelectionRequestNEW,
    SelectionRequestUniversal
}

export { SelectionRequest, SelectionRequestOneFromGivenList, SelectionRequestNEW, SelectionRequestUniversal }
