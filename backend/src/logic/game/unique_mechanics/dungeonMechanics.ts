import { Player } from "../../player/player"
import { DungeonMechanicTypes, TreasureSign } from "../../types"
import { GameEvent, feedback } from "../actionFeedbacks"
import { Card, DungeonCard, HeroCard, SpellCard } from "../cards"
import { SelectableItem, SelectionRequest, SelectionRequestOneFromGivenList, SelectionRequestUniversal } from "../playerRequestSelections"
import { CardAction } from "./customCardActions"
import { EventListener } from "./eventListener"
import { RoundModifer } from "./roundModifiers"

const { OncePerRoundMechanicUsedAlready, DungeonMechanicUseConditionError } = require("../../errors")
// const { feedback, eventTypes } = require("../actionFeedbacks")
// const { SelectionRequest, SelectionRequestOneFromGivenList } = require("../playerRequestSelections")

// const { RoundModifer } = require("./roundModifiers")

// Inheritance Scheme
// DungeonMechanic --|-- DungeonMechanicOnBuild
//                   |-- DungeonMechanicOnDestory
//                   |-- DungeonMechanicAutomatic --|-- DungeonMechanicAutomaticOnePerRound
//                   |                              |
//                   |                              |
//                   |
//                   |-- DungeonMechanicOnUse ------|-- DungeonMechanicOnUseOnePerRound

// const mechanicsTypes = {
//     ON_DESTORY: 'onDestroy',
//     ON_BUILD: 'onBuild',
//     ONE_PER_ROUND: 'onePerRound',
//     EVERY_GAME_ACTION: 'everyGameAction',
//     ON_USE_ONE_PER_ROUND: 'onUseOnePerRound'
// }


class DungeonMechanic {

    dungeonCard: DungeonCard
    type?: DungeonMechanicTypes
    mechanicDescription: string

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        this.dungeonCard = dungeonCard
        this.type = type
        this.mechanicDescription = mechanicDescription
        if (!this.dungeonCard.getDescription()) {
            this.dungeonCard.setDescription(this.mechanicDescription)
        }
    }

    getType() {
        return this.type
    }

    getDescription() {
        return this.mechanicDescription
    }

    handleGameEvent(event: GameEvent) {

    }

    use() {

    }
}

class EliminateHeroInDungeon extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        dungeonCard.setAllowDestroy(true)
    }

    use() {
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        const hero = this.getHeroOnThisDungeon()
        if (hero) {
            hero.die()
        }
        // this.dungeonCard.owner.deleteFromDungeon(this)
    }

    getHeroOnThisDungeon() {
        const hero = this.dungeonCard.owner.dungeonEntranceHeroes.find(hero => hero.dungeonRoom?.id === this.dungeonCard.id)
        return hero
    }
}


class Get3MoneyOnDestroy extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        dungeonCard.setAllowDestroy(true)
    }

    use() {
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        this.dungeonCard.owner.addGold(3)
        // this.dungeonCard.owner.deleteFromDungeon(this)
    }
}


class DrawSpellWhenPlayedSpell extends DungeonMechanic { // "Raz na rundę: kiedy zagrasz kartę czaru, dociągnij kartę czaru."

    usedInRound

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.usedInRound = false
    }

    use() {
        if (this.usedInRound) {
            // TODO probably shouldn't throw an error because effect is triggered automatically
            throw new OncePerRoundMechanicUsedAlready("This card was already used in this round")
        }
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        this.dungeonCard.owner.drawNotUsedSpellCard()
        this.usedInRound = true
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_PLAYED_SPELL") {
            if (event.player === this.dungeonCard.owner) {
                if (!this.usedInRound) {
                    this.use()
                }
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}


class Draw2GoldWhenAnyDungeonDestoryed extends DungeonMechanic {

    usedInRound: boolean

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.usedInRound = false
    }

    use() {
        if (this.usedInRound) {
            // TODO probably shouldn't throw an error because effect is triggered automatically
            throw new OncePerRoundMechanicUsedAlready("This card was already used in this round")
        }
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        this.dungeonCard.owner.addGold(2)
        this.usedInRound = true
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_DESTROYED_DUNGEON") {
            if (!this.usedInRound) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}


class Draw2GoldWhenDungeonBuildNext extends DungeonMechanic {

    previousLeft: DungeonCard | null
    previousRight: DungeonCard | null

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.previousLeft = null
        this.previousRight = null
    }

    getLeft() {
        const dungCardIndex = this.dungeonCard.owner.dungeon.findIndex(dungeon => dungeon.id === this.dungeonCard.id)
        const dungOnLeft = this.dungeonCard.owner.dungeon[dungCardIndex + 1]
        return dungOnLeft || null
    }

    getRight() {
        const dungCardIndex = this.dungeonCard.owner.dungeon.findIndex(dungeon => dungeon.id === this.dungeonCard.id)
        const dungOnRight = this.dungeonCard.owner.dungeon[dungCardIndex - 1]
        return dungOnRight || null
    }

    use() {
        const newLeft = this.getLeft()
        const newRight = this.getRight()
        if (newLeft !== this.previousLeft && newLeft !== null) {
            this.dungeonCard.owner.addGold(2)
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        }
        if (newRight !== this.previousRight && newRight !== null) {
            this.dungeonCard.owner.addGold(2)
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        }
        this.previousLeft = newLeft
        this.previousRight = newRight
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.dungeon.id === this.dungeonCard.id) {
                this.previousLeft = this.getLeft()
                this.previousRight = this.getRight()
            }
            else {
                this.use()
            }
        }
    }
}

class NegateSpellByRemovingYourSpell extends DungeonMechanic {

    usedInRound: boolean
    selectedSpell: SpellCard | null

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.usedInRound = false
        this.selectedSpell = null
        this.dungeonCard.setAllowUse(true)
    }

    use() {
        if (this.checkMechanicUseValid()) {
            if (!this.selectedSpell) {
                this.requestPlayerSelect()
            }
            else {
                const playedSpell = this.dungeonCard.trackedGame.getCurrentlyPlayedSpell()
                playedSpell.canForcePlay()
                this.selectedSpell.owner.discardSpellCard(this.selectedSpell)
                // this.selectedSpell.owner.throwCardAway(this.selectedSpell)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                this.selectedSpell = null
                this.usedInRound = true
            }
        }
    }

    checkMechanicUseValid() {
        if (this.usedInRound) {
            throw new OncePerRoundMechanicUsedAlready("This card was already used in this round.")
        }
        if (!this.dungeonCard.trackedGame.getCurrentlyPlayedSpell()) {
            throw new DungeonMechanicUseConditionError("The isn't any spell currently at play.")
        }
        return true
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.dungeonCard.owner, "spell", 1, this.dungeonCard.owner, this)
        this.dungeonCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.selectedSpell = data[0]
    }
}

class add1TreasureToAnyDungeonForThisRoundOnDestory extends DungeonMechanic {

    selectedTreasure: TreasureSign | null
    selectedPlayer: Player | null
    requestedSelection: "TREASURE" | "PLAYER" | null

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.dungeonCard.setAllowDestroy(true)
        this.selectedTreasure = null
        this.selectedPlayer = null
        this.requestedSelection = null
    }

    use() {
        if (!this.selectedTreasure) {
            this.requestPlayerSelectTreasure()
        }
        else if (!this.selectedPlayer) {
            this.requestPlayerSelectPlayer()
        }
        else {
            this.dungeonCard.trackedGame.addRoundModifier(new RoundModifer(
                () => this.selectedPlayer.collectedTreasure[this.selectedTreasure] += 1, // TODO... add method on player to do this and this method should save new gameAction
                () => this.selectedPlayer.collectedTreasure[this.selectedTreasure] -= 1 // TODO... add method on player to do this and this method should save new gameAction
            ))
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
        }
    }

    requestPlayerSelectTreasure() {
        this.requestedSelection = 'TREASURE'
        const selectionReq = new SelectionRequest(this.dungeonCard.owner, "treasure", 1, "ANY", this)
        this.dungeonCard.owner.setRequestedSelection(selectionReq)
    }

    requestPlayerSelectPlayer() {
        this.requestedSelection = 'PLAYER'
        const selectionReq = new SelectionRequest(this.dungeonCard.owner, "player", 1, "ANY", this)
        this.dungeonCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data: SelectableItem[]) {
        if (this.requestedSelection === 'TREASURE') {
            this.selectedTreasure = data[0] as TreasureSign
        }
        else if (this.requestedSelection === 'PLAYER') {
            this.selectedPlayer = data[0] as Player
        }
    }
}

class getOneDamageForEveryLuredHero extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
    }

    use() {
        this.dungeonCard.trackedGame.addRoundModifier(new RoundModifer(
            () => this.dungeonCard.damage += 1,
            () => this.dungeonCard.damage -= 1
        ))
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "HERO_LURED") {
            if (event.player.id === this.dungeonCard.owner.id) {
                this.use()
            }
        }
    }
}

class TakeThrownAwayCardByOtherPlayer extends DungeonMechanic {

    thrownAwayCard: DungeonCard | SpellCard | null
    shouldGetCard: "tak" | "nie" | null
    usedInRound: boolean

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.thrownAwayCard = null
        this.shouldGetCard = null
        this.usedInRound = false
    }

    use() {
        if (this.shouldGetCard === null) {
            this.requestPlayerSelect()
        }
        else {
            this.usedInRound = true
            if (this.shouldGetCard === 'tak') {
                this.dungeonCard.owner.receiveCard(this.thrownAwayCard)
            }
        }
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_THROWN_AWAY_SPELL_CARD") {
            if (event.player.id !== this.dungeonCard.owner.id) {
                this.thrownAwayCard = event.spell
                if (!this.usedInRound) {
                    this.use()
                }
            }
        }
        else if (event.type === "PLAYER_THROWN_AWAY_DUNGEON_CARD") {
            if (event.player.id !== this.dungeonCard.owner.id) {
                this.thrownAwayCard = event.dungeon
                if (!this.usedInRound) {
                    this.use()
                }
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }

    requestPlayerSelect() {
        const requestedSelection = new SelectionRequestOneFromGivenList<"tak" | "nie">({
            avalibleItemsForSelectArr: ["tak", "nie"],
            onRecieveSelectionData: (data) => {
                this.shouldGetCard = data[0]
            },
            requestedPlayer: this.dungeonCard.owner,
            selectionMessage: "Czy chcesz wziąść odrzuconą przez przeciwnika kartę?",
            // this.dungeonCard.owner, 'Czy chcesz wziąść odrzuconą przez przeciwnika kartę?', ["tak", 'nie'], this
        })
        this.dungeonCard.owner.setRequestedSelection(requestedSelection)
    }

    // receiveSelectionData(data) {
    //     this.shouldGetCard = data[0]
    // }
}

class SendHeroBackToDungeonStart extends DungeonMechanic {

    heroesThatEnteredInRound

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.heroesThatEnteredInRound = []
    }

    hasHeroEnteredThisRound(heroCard) {
        const foundHero = this.heroesThatEnteredInRound.find(hero => hero.id === heroCard.id)
        return !!foundHero
    }

    use() {
        const hero = this.getHeroOnThisDungeon()
        if (hero) {
            if (!this.hasHeroEnteredThisRound(hero)) {
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                hero.setDungeonRoom(null)
                this.heroesThatEnteredInRound.push(hero)
            }
        }
    }

    getHeroOnThisDungeon() {
        const hero = this.dungeonCard.owner.dungeonEntranceHeroes.find(hero => hero.dungeonRoom?.id === this.dungeonCard.id)
        return hero
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "NEW_ROUND_BEGUN") {
            this.heroesThatEnteredInRound = []
        }
        else if (event.type === "HERO_ENTERED_ROOM") {
            this.use()
        }
    }
}

class Pay1GoldToDrawSpellWhenAnyDungeonDestroyed extends DungeonMechanic {

    usedInRound
    shouldDrawCard

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.usedInRound = false
        this.shouldDrawCard = null
    }

    use() {
        if (this.shouldDrawCard === null) {
            this.requestPlayerSelect()
        }
        else {
            if (this.shouldDrawCard === 'tak') {
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                this.dungeonCard.owner.payGold(1)
                this.dungeonCard.owner.drawNotUsedSpellCard()
                this.usedInRound = true
                this.shouldDrawCard = null
            }
        }
    }

    requestPlayerSelect() {
        this.dungeonCard.owner.setRequestedSelection(new SelectionRequestOneFromGivenList<"tak" | "nie">({
            avalibleItemsForSelectArr: ["nie", "tak"],
            onRecieveSelectionData: (data) => {
                this.shouldDrawCard = data[0]
                this.use()
            },
            requestedPlayer: this.dungeonCard.owner,
            selectionMessage: `Przeciwnik zniszczył komnatę, czy chcesz zapłacić 1 golda aby dobrać czar? (Zdolność karty '${this.dungeonCard.name}')`,
        }
            // this.dungeonCard.owner,
            // `Przeciwnik zniszczył komnatę, czy chcesz zapłacić 1 golda aby dobrać czar? (Zdolność karty '${this.dungeonCard.name}')`,
            // ['tak', 'nie'],
            // this
        ))
    }

    // receiveSelectionData(data) {
    //     this.shouldDrawCard = data[0]
    // }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_DESTROYED_DUNGEON") {
            if (!this.usedInRound) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class DrawDungeonWhenHeroEliminatedInThisDungeon extends DungeonMechanic {

    usedInRound: boolean

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription, type)
        this.usedInRound = false
    }

    use() {
        this.dungeonCard.owner.drawNotUsedDungeonCard()
        this.usedInRound = true
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "HERO_DIED_IN_ROOM") {
            if (event.room === this.dungeonCard) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class DrawDungeonCardWhenYouBuildMonsterDungeonOncePerRound extends DungeonMechanic {

    usedInRound: boolean

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
        this.usedInRound = false
    }

    use() {
        this.dungeonCard.owner.drawNotUsedDungeonCard()
        this.usedInRound = true
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon.type === "monsters" && !this.usedInRound) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class DestroyOtherRoomToDeal5DamageToHeroOnThisRoom extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            assignTo: this.dungeonCard,
            title: "Użyj",
            allowUseFor: () => [this.dungeonCard.owner],
            additionalUseValidation: (mechanicUser) => {
                if (this.cardAction.isDisabled()) {
                    throw new OncePerRoundMechanicUsedAlready("This card was already used in this round.")
                }
                if (mechanicUser.dungeon.length === 1) {
                    throw new DungeonMechanicUseConditionError("You can't use this card because there is no Room to destroy.")
                }
                return true
            },
            onUse: (mechanicUser) => {
                new SelectionRequestUniversal<DungeonCard>({
                    amount: 1,
                    avalibleItemsForSelectArr: mechanicUser.dungeon.filter(dungeon => dungeon.id !== this.dungeonCard.id),
                    onFinish: ([selectedDungeon]) => {
                        selectedDungeon.setAllowDestroy(true)
                        mechanicUser.destroyDungeonCard(selectedDungeon.id)
                        selectedDungeon.setAllowDestroy(false)
                        this.dungeonCard.getHeroOnThisDungeon()?.getDamaged(5)
                        this.cardAction.setActionDisabled(true)
                        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(mechanicUser, this.dungeonCard, this))
                    },
                    metadata: {
                        displayType: "mixed",
                    },
                    requestedPlayer: mechanicUser,
                    selectionMessage: "Wybierz komnatę do zniszczenia",
                })
                // mechanicUser.trackedGame.saveGameAction(feedback.PLAYER_USED_CUSTOM_CARD_ACTION(mechanicUser, this.dungeonCard, this.cardAction))
            }
        })
        // this.dungeonCard.addCustomCardAction(this.cardAction)
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "NEW_ROUND_BEGUN") {
            this.cardAction.setActionDisabled(false)
        }
    }
}

class MayDrawSpellWhenHeroDiedInRoomOncePerTurn extends DungeonMechanic {
    usedInRound: boolean

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
        this.usedInRound = false
    }

    use() {
        new SelectionRequestUniversal<'tak' | 'nie'>({
            amount: 1,
            avalibleItemsForSelectArr: ['tak', 'nie'],
            metadata: {
                displayType: 'mixed'
            },
            requestedPlayer: this.dungeonCard.owner,
            selectionMessage: "Czy chcesz dobrać kartę czaru?",
            onFinish: ([selectedOption]) => {
                if (selectedOption === 'tak') {
                    this.dungeonCard.owner.drawNotUsedSpellCard()
                    this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                }
                this.usedInRound = true
            }
        })
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "HERO_DIED_IN_ROOM") {
            if (event.room === this.dungeonCard && !this.usedInRound) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class SwapAnyTwoRoomsOnBuild extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use() {
        new SelectionRequestUniversal<'tak' | 'nie'>({
            amount: 1,
            avalibleItemsForSelectArr: ['tak', 'nie'],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Czy chcesz zamienić miejscami dwie komnaty?",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([selectedOption]) => {
                if (selectedOption === 'tak') {
                    new SelectionRequestUniversal<Player>({
                        amount: 1,
                        avalibleItemsForSelectArr: this.dungeonCard.trackedGame.players,
                        metadata: {
                            displayType: "mixed"
                        },
                        requestedPlayer: this.dungeonCard.owner,
                        selectionMessage: "Wybierz gracza, którego komnaty chcesz zamienić miejscami",
                        onFinish: ([selectedPlayer]) => {
                            const dungeonSelection = new SelectionRequestUniversal<DungeonCard | 'Anuluj'>({
                                amount: 2,
                                avalibleItemsForSelectArr: [...selectedPlayer.dungeon, 'Anuluj'],
                                metadata: {
                                    displayType: 'mixed'
                                },
                                requestedPlayer: this.dungeonCard.owner,
                                selectionMessage: "Wybierz dwie komnaty do zamiany miejscami",
                                onFinish: ([dungeon1, dungeon2]: DungeonCard[]) => {
                                    const dungeon1Index = selectedPlayer.dungeon.findIndex(dungeon => dungeon.id === dungeon1.id)
                                    const dungeon2Index = selectedPlayer.dungeon.findIndex(dungeon => dungeon.id === dungeon2.id)
                                    const temp = selectedPlayer.dungeon[dungeon1Index]
                                    selectedPlayer.dungeon[dungeon1Index] = selectedPlayer.dungeon[dungeon2Index]
                                    selectedPlayer.dungeon[dungeon2Index] = temp
                                    this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                                },
                                onSingleSelect: (selection) => {
                                    if (selection === 'Anuluj') {
                                        dungeonSelection.cancel()
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class BuildAnotherDungeonWhenThisDungeonBuild extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use() {
        const request = new SelectionRequestUniversal<DungeonCard | 'Anuluj'>({
            amount: 1,
            avalibleItemsForSelectArr: [...this.dungeonCard.owner.dungeonCards, 'Anuluj'],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Który loch chcesz wybudować?",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([selectedDungeon]: DungeonCard[]) => {
                const selectionOuter = new SelectionRequestUniversal<DungeonCard | 'Nowy' | 'Anuluj'>({
                    avalibleItemsForSelectArr: this.dungeonCard.owner.dungeon.length === 5 ?
                        [...this.dungeonCard.owner.dungeon, 'Anuluj'] :
                        [...this.dungeonCard.owner.dungeon, 'Nowy', 'Anuluj'],
                    amount: 1,
                    metadata: {
                        displayType: "mixed"
                    },
                    requestedPlayer: this.dungeonCard.owner,
                    selectionMessage: "Gdzie chcesz wybudować nowy loch?",
                    onFinish: ([selectedPlace]: (DungeonCard | 'Nowy')[]) => {
                        if (selectedPlace === 'Nowy') {
                            this.dungeonCard.owner.declareBuild(selectedDungeon, null, { ignoreRoundPhase: true })
                            this.dungeonCard.owner.buildDeclaredDungeon()
                        }
                        else {
                            this.dungeonCard.owner.declareBuild(selectedDungeon, this.dungeonCard.owner.dungeon.findIndex((dung) => dung === selectedPlace), { ignoreRoundPhase: true })
                            this.dungeonCard.owner.buildDeclaredDungeon()
                        }
                        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                    },
                    onFinishError: (err) => {
                        request.reset()
                        this.dungeonCard.owner.addRequestedSelection(request, true)
                        this.dungeonCard.owner.removeRequestedSelection(selectionOuter)
                        // this.dungeonCard.owner.setRequestedSelection(request)
                    },
                    onSingleSelect: (selection) => {
                        if (selection === 'Anuluj') {
                            selectionOuter.cancel()
                        }
                    }
                })
            },
            onSingleSelect: (selection) => {
                if (selection === 'Anuluj') {
                    request.cancel()
                }
            }
        })
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class PlaceHeroFromCityAtEntranceAtBuild extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use() {
        if (this.dungeonCard.trackedGame.city.length === 0) return

        new SelectionRequestUniversal<HeroCard>({
            amount: 1,
            avalibleItemsForSelectArr: [...this.dungeonCard.trackedGame.city.filter(hero => !hero.isLegendary)],
            metadata: {
                displayType: "mixed"
            },
            requestedPlayer: this.dungeonCard.owner,
            selectionMessage: "Wybierz bohatera do umieszczenia na wejściu do twojego lochu.",
            onFinish: ([selectedHero]) => {
                selectedHero.removeSelfFromCity()
                this.dungeonCard.owner.addHeroToDungeonEntrance(selectedHero)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            },
        })
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class DamageEqualToNumberOfMonsterDungeonsInDungeon extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use() {
        const numberOfMonsterDungeons = this.dungeonCard.owner.dungeon.filter(dungeon => dungeon.type === "monsters").length
        this.dungeonCard.damage = numberOfMonsterDungeons
    }

    handleGameEvent(event: GameEvent) {
        this.use()
    }
}

class DrawMonsterRoomFromDiscardedPileOnBuild extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use() {
        const discardedMonsterDungeons = this.dungeonCard.trackedGame.discardedDungeonCardsStack.filter(dungeon => dungeon.type === "monsters")
        if (discardedMonsterDungeons.length === 0) return

        new SelectionRequestUniversal<DungeonCard>({
            amount: 1,
            avalibleItemsForSelectArr: discardedMonsterDungeons,
            metadata: {
                displayType: "mixed"
            },
            requestedPlayer: this.dungeonCard.owner,
            selectionMessage: "Wybierz loch do wzięcia.",
            onFinish: ([selectedDungeon]) => {
                this.dungeonCard.owner.drawDungeonFromDiscardedCardsStack(selectedDungeon.id)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            },
        })
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class DisableBuildOfFancyDungeonOnTopOfThisDungeon extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
        this.dungeonCard.setDisableFancyBuildOnTop(true)
    }
}

class ChooseDungeonCardFromDiscardedDungeonPileWhenHeroDiesInThisDungeonRoomOncePerRound extends DungeonMechanic {
    usedInRound: boolean

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
        this.usedInRound = false
    }

    use() {
        new SelectionRequestUniversal<DungeonCard>({
            amount: 1,
            avalibleItemsForSelectArr: this.dungeonCard.trackedGame.discardedDungeonCardsStack,
            metadata: {
                displayType: "mixed"
            },
            requestedPlayer: this.dungeonCard.owner,
            selectionMessage: "Wybierz loch do wzięcia.",
            onFinish: ([selectedDungeon]) => {
                this.dungeonCard.owner.drawDungeonFromDiscardedCardsStack(selectedDungeon.id)
                this.usedInRound = true
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            },
        })
    }

    handleGameEvent(event: GameEvent) {
        if (event.type === "HERO_DIED_IN_ROOM") {
            if (event.room === this.dungeonCard && !this.usedInRound) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class DestroyDungeonToTakeOneCardFromDiscardedPile extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        new CardAction({
            assignTo: this.dungeonCard,
            allowUseFor: () => [this.dungeonCard.owner],
            title: "Zniszcz loch",
            onUse: (mechanicUser) => {
                const items = [
                    ...this.dungeonCard.trackedGame.discardedDungeonCardsStack,
                    ...this.dungeonCard.trackedGame.discardedSpellCardsStack
                ]
                if (items.length === 0) return

                this.dungeonCard.setAllowDestroy(true)
                mechanicUser.destroyDungeonCard(this.dungeonCard.id)
                this.dungeonCard.setAllowDestroy(false)

                new SelectionRequestUniversal({
                    amount: 1,
                    avalibleItemsForSelectArr: items,
                    onFinish: ([selectedItem]) => {
                        if (selectedItem instanceof DungeonCard) {
                            mechanicUser.drawDungeonFromDiscardedCardsStack(selectedItem.id)
                        }
                        else if (selectedItem instanceof SpellCard) {
                            mechanicUser.drawSpellFromDiscardedCardsStack(selectedItem.id)
                        }
                        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(mechanicUser, this.dungeonCard, this))
                    },
                    metadata: {
                        displayType: "mixed"
                    },
                    requestedPlayer: mechanicUser,
                    selectionMessage: "Wybierz kartę do wzięcia.",
                })
                // this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_CUSTOM_CARD_ACTION(mechanicUser, this.dungeonCard, cardAction))
            },
        })
    }
}

class DrawTwoSpellCardsAndDiscardOneOnRoomBuild extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        this.dungeonCard.owner.drawNotUsedSpellCard()
        this.dungeonCard.owner.drawNotUsedSpellCard()

        new SelectionRequestUniversal<SpellCard>({
            amount: 1,
            avalibleItemsForSelectArr: [...this.dungeonCard.owner.spellCards],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Wybierz kartę do odrzucenia.",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([selectedSpell]) => {
                this.dungeonCard.owner.discardSpellCard(selectedSpell)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            }
        })

        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class BoostNextRoomBy2IfItIsTrapsRoom extends DungeonMechanic {
    lastBoosted: DungeonCard | null

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
        this.lastBoosted = null
    }

    use(): void {
        if (this.lastBoosted) {
            this.lastBoosted.damage -= 2
            this.lastBoosted = null
        }

        if (!this.dungeonCard.isActive) return

        const thisDungeonIndex = this.dungeonCard.owner.dungeon.indexOf(this.dungeonCard)
        if (thisDungeonIndex === -1) return

        const nextDungeon = this.dungeonCard.owner.dungeon[thisDungeonIndex - 1]
        if (nextDungeon && nextDungeon.type === 'traps') {
            nextDungeon.damage += 2
            this.lastBoosted = nextDungeon
        }
    }

    handleGameEvent(event: GameEvent): void {
        this.use()
    }
}

class DiscardTwoDungeonCardsToTakeOneFromDiscardedPileOnUseOncePerTurn extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            assignTo: this.dungeonCard,
            allowUseFor: () => [this.dungeonCard.owner],
            title: "Użyj",
            additionalUseValidation: (mechanicUser) => {
                const items = [...mechanicUser.dungeonCards]
                if (items.length < 2) {
                    throw new Error("Nie masz wystarczającej ilości kart lochu.")
                }
                return true
            },
            onUse: (mechanicUser) => {
                const items = [...mechanicUser.dungeonCards]

                new SelectionRequestUniversal({
                    amount: 2,
                    avalibleItemsForSelectArr: items,
                    onFinish: ([selectedDungeon1, selectedDungeon2]) => {
                        mechanicUser.discardDungeonCard(selectedDungeon1)
                        mechanicUser.discardDungeonCard(selectedDungeon2)

                        new SelectionRequestUniversal({
                            amount: 1,
                            avalibleItemsForSelectArr: [...mechanicUser.trackedGame.discardedDungeonCardsStack],
                            metadata: {
                                displayType: "mixed"
                            },
                            requestedPlayer: mechanicUser,
                            selectionMessage: "Wybierz kartę do wzięcia.",
                            onFinish: ([selectedDungeon]) => {
                                mechanicUser.drawDungeonFromDiscardedCardsStack(selectedDungeon.id)
                                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(mechanicUser, this.dungeonCard, this))
                            }
                        })
                    },
                    metadata: {
                        displayType: "mixed"
                    },
                    requestedPlayer: mechanicUser,
                    selectionMessage: "Wybierz karty do odrzucenia.",
                })

                this.cardAction.setActionDisabled(true)
            },
        })
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "NEW_ROUND_BEGUN") {
            this.cardAction.setActionDisabled(false)
        }
    }
}

class ContainsAllFourTreasureTypes extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }
}

class DrawTwoDungeonRoomCardsWhenDungeonIsDestroyed extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        new SelectionRequestUniversal<'tak' | 'nie'>({
            amount: 1,
            avalibleItemsForSelectArr: ['tak', 'nie'],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Czy chcesz dobrać dwie karty lochu? (Recycling Center)",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([selected]) => {
                if (selected === 'tak') {
                    this.dungeonCard.owner.drawNotUsedDungeonCard()
                    this.dungeonCard.owner.drawNotUsedDungeonCard()
                }
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            }
        })
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "PLAYER_DESTROYED_DUNGEON") {
            if (event.dungeon.owner === this.dungeonCard.owner) {
                this.use()
            }
        }
    }
}

class OponnentDiscardRandomSpellCardOnBuild extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: [...this.dungeonCard.trackedGame.players.filter(player => player !== this.dungeonCard.owner)],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Wybierz przeciwnika. (Specter's Sanctum)",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([selectedPlayer]) => {
                const randomSpell = selectedPlayer.spellCards[Math.floor(Math.random() * selectedPlayer.spellCards.length)]
                selectedPlayer.discardSpellCard(randomSpell)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            }
        })
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "PLAYER_BUILD_DUNGEON") {
            if (event.player === this.dungeonCard.owner && event.dungeon === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class TakeRandomCardFromOpponentWhenHeroDiesInThisDungeonOncePerRound extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: [...this.dungeonCard.trackedGame.players.filter(player => player !== this.dungeonCard.owner)],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Wybierz przeciwnika. (Succubus Spa)",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([selectedPlayer]) => {
                new SelectionRequestUniversal({
                    selectionMessage: "Wybierz kartę do wzięcia.",
                    amount: 1,
                    metadata: {
                        displayType: "mixed"
                    },
                    requestedPlayer: this.dungeonCard.owner,
                    avalibleItemsForSelectArr: [
                        `karta lochów (${selectedPlayer.dungeonCards.length} kart)`,
                        `karta czarów (${selectedPlayer.dungeonCards.length} kart)`
                    ],
                    onFinish: ([selected]) => {
                        if (selected.includes('karta lochów')) {
                            const randomDungeon = selectedPlayer.dungeonCards[Math.floor(Math.random() * selectedPlayer.dungeonCards.length)]
                            this.dungeonCard.owner.takeCardFromPlayer(randomDungeon, selectedPlayer)
                        }
                        else if (selected.includes('karta czarów')) {
                            const randomSpell = selectedPlayer.spellCards[Math.floor(Math.random() * selectedPlayer.spellCards.length)]
                            this.dungeonCard.owner.takeCardFromPlayer(randomSpell, selectedPlayer)
                        }
                        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                    }
                })
            }
        })
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "HERO_DIED_IN_ROOM") {
            if (event.room === this.dungeonCard) {
                this.use()
            }
        }
    }
}

class HealWoundAndAddItsSoulToScoreWhenHeroDiesInThisDungeonOncePerRound extends DungeonMechanic {
    usedInRound: boolean = false

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        if (this.usedInRound) return

        const heroes = [...this.dungeonCard.owner.heroesThatDefeatedPlayer]
        if (heroes.length === 0) return

        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: heroes,
            selectionMessage: "Wybierz bohatera, który cię pokonał. (Vampire Bordello)",
            metadata: {
                displayType: "mixed"
            },
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([hero]) => {
                this.dungeonCard.owner.health += hero.damageDealt
                this.dungeonCard.owner.defeatedHeroes.push(hero)
                this.dungeonCard.owner.updateScore()
                this.usedInRound = true
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
            }
        })
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "HERO_DIED_IN_ROOM") {
            if (event.room === this.dungeonCard) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class BoostAdjacentMonsterRoomsByOne extends DungeonMechanic {
    previouslyBoosted: DungeonCard[] = []

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        this.previouslyBoosted.forEach(room => room.damage -= 1)
        this.previouslyBoosted = []

        if (!this.dungeonCard.isActive) return
        const dungeonIndex = this.dungeonCard.owner.dungeon.indexOf(this.dungeonCard)
        if (dungeonIndex === -1) return

        const adjacentRooms = [
            ...(this.dungeonCard.owner.dungeon[dungeonIndex - 1] ? [this.dungeonCard.owner.dungeon[dungeonIndex - 1]] : []),
            ...(this.dungeonCard.owner.dungeon[dungeonIndex + 1] ? [this.dungeonCard.owner.dungeon[dungeonIndex + 1]] : [])
        ]
        const adjacentMonsterRooms = adjacentRooms.filter(room => room.type === 'monsters')
        this.previouslyBoosted = adjacentMonsterRooms

        adjacentMonsterRooms.forEach(room => room.damage += 1)
    }

    handleGameEvent(event: GameEvent): void {
        this.use()
    }
}

class DrawRoomCardIfHeroDiesInThisDungeonOncePerRound extends DungeonMechanic {
    usedInRound: boolean = false

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        if (this.usedInRound) return

        this.dungeonCard.owner.drawNotUsedDungeonCard()
        this.usedInRound = true
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "HERO_DIED_IN_ROOM") {
            if (event.room === this.dungeonCard) {
                this.use()
            }
        }
        else if (event.type === "NEW_ROUND_BEGUN") {
            this.usedInRound = false
        }
    }
}

class DrawSpellCardAtRoundStartInsteadOfDungeonCard extends DungeonMechanic {
    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)
    }

    use(): void {
        new SelectionRequestUniversal<'tak' | 'nie'>({
            amount: 1,
            avalibleItemsForSelectArr: ['tak', 'nie'],
            metadata: {
                displayType: "mixed"
            },
            selectionMessage: "Czy chcesz pobrać kartę czarów zamiast karty lochów? (Haunted Library)",
            requestedPlayer: this.dungeonCard.owner,
            onFinish: ([answer]) => {
                if (answer === 'tak') {
                    this.dungeonCard.owner.drawNotUsedSpellCard()
                    this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(this.dungeonCard.owner, this.dungeonCard, this))
                }
                else if (answer === 'nie') {
                    this.dungeonCard.owner.drawNotUsedDungeonCard()
                }
            }
        })
    }

    handleGameEvent(event: GameEvent): void {
        this.dungeonCard.owner.setAutomaticallyDrawNewRoundCards(!this.dungeonCard.isActive)

        if (event.type === "NEW_ROUND_BEGUN" && this.dungeonCard.isActive) {
            this.use()
        }
    }
}

class DiscardMonsterRoomToDrawSpellCardOncePerRound extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            allowUseFor: () => [this.dungeonCard.owner],
            assignTo: this.dungeonCard,
            title: "Użyj",
            onUse: (playerThatUsed) => this.handleUsedByPlayer(playerThatUsed),
            additionalUseValidation: (playerThatUsed) => {
                if (playerThatUsed.dungeonCards.filter(room => room.type === 'monsters').length === 0) {
                    throw new Error("Nie masz żadnych lochów potworów, które możesz odrzucić. (Witch's Kitchen)")
                }
                if (playerThatUsed.trackedGame.notUsedSpellCardsStack.length === 0) {
                    throw new Error("Nie ma więcej kart czarów. (Witch's Kitchen)")
                }
                return true
            }
        })
    }

    handleUsedByPlayer(player: Player) {
        new SelectionRequestUniversal({
            amount: 1,
            avalibleItemsForSelectArr: player.dungeonCards.filter(room => room.type === 'monsters'),
            selectionMessage: "Wybierz loch potworów, który chcesz odrzucić. (Witch's Kitchen)",
            metadata: {
                displayType: "mixed"
            },
            requestedPlayer: player,
            onFinish: ([room]) => {
                player.discardDungeonCard(room)
                player.drawNotUsedSpellCard()
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(player, this.dungeonCard, this))
            }
        })
        this.cardAction.setActionDisabled(true)
    }

    handleGameEvent(event: GameEvent): void {
        if (event.type === "NEW_ROUND_BEGUN") {
            this.cardAction.setActionDisabled(false)
        }
    }
}

class KillHeroInThisRoomOnDestroy extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            title: "Użyj - Zniszcz",
            assignTo: this.dungeonCard,
            allowUseFor: () => [this.dungeonCard.owner],
            onUse: (playerThatUsed) => this.handleUsedByPlayer(playerThatUsed),
        })
    }

    handleUsedByPlayer(player: Player) {
        const heroOnTop = this.dungeonCard.getHeroOnThisDungeon()
        if (heroOnTop) {
            heroOnTop.die()
        }
        this.dungeonCard.setAllowDestroy(true)
        player.destroyDungeonCard(this.dungeonCard.id)
        this.dungeonCard.setAllowDestroy(false)
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(player, this.dungeonCard, this))
    }
}

class DoubleEveryRoomTreasureOnDestroy extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            title: "Użyj - Zniszcz",
            assignTo: this.dungeonCard,
            allowUseFor: () => [this.dungeonCard.owner],
            onUse: (playerThatUsed) => this.handleUsedByPlayer(playerThatUsed),
        })
    }

    handleUsedByPlayer(player: Player) {
        this.dungeonCard.setAllowDestroy(true)
        player.destroyDungeonCard(this.dungeonCard.id)
        this.dungeonCard.setAllowDestroy(false)

        type RoomAffected = {
            addedFaith?: number,
            addedStrength?: number,
            addedFortune?: number,
            addedMagic?: number,
            room: DungeonCard
        }

        let affectedList: RoomAffected[] = []

        this.dungeonCard.owner.dungeon.forEach(room => {
            for (let [key, value] of Object.entries(room.treasure)) {
                let affectedRoom: RoomAffected = { room: room }

                if (key === 'faith') affectedRoom.addedFaith = value
                if (key === 'strength') affectedRoom.addedStrength = value
                if (key === 'fortune') affectedRoom.addedFortune = value
                if (key === 'magic') affectedRoom.addedMagic = value
                room.treasure[key] = value * 2
                affectedList.push(affectedRoom)
            }
        })

        const listener = new EventListener({
            trackedGame: this.dungeonCard.trackedGame,
            eventsHandler: (event) => {
                if (event.type === "NEW_ROUND_BEGUN") {
                    affectedList.forEach((singleAffected) => {
                        for (let [key, value] of Object.entries(singleAffected.room.treasure)) {
                            if (key === 'faith') singleAffected.room.treasure[key] -= singleAffected.addedFaith
                            if (key === 'fortune') singleAffected.room.treasure[key] -= singleAffected.addedFortune
                            if (key === 'magic') singleAffected.room.treasure[key] -= singleAffected.addedMagic
                            if (key === 'strength') singleAffected.room.treasure[key] -= singleAffected.addedStrength
                        }
                    })
                    listener.unMount()
                }
            }
        })

        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(player, this.dungeonCard, this))
    }
}

class OpponentDiscardsRandomDungeonCardOnDestroy extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            title: "Użyj - Zniszcz",
            assignTo: this.dungeonCard,
            allowUseFor: () => [this.dungeonCard.owner],
            onUse: (playerThatUsed) => this.handleUsedByPlayer(playerThatUsed),
        })
    }

    handleUsedByPlayer(player: Player) {
        this.dungeonCard.setAllowDestroy(true)
        player.destroyDungeonCard(this.dungeonCard.id)
        this.dungeonCard.setAllowDestroy(false)

        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed"
            },
            avalibleItemsForSelectArr: this.dungeonCard.trackedGame.players.filter(p => p !== player),
            selectionMessage: "Wybierz przeciwnika, który odrzuci losową kartę lochu. (Torture Chamber)",
            requestedPlayer: player,
            onFinish: ([selectedPlayer]) => {
                if (selectedPlayer.dungeonCards.length === 0) return
                const randomRoom = selectedPlayer.dungeonCards[Math.floor(Math.random() * selectedPlayer.dungeonCards.length)]
                selectedPlayer.discardDungeonCard(randomRoom)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(player, this.dungeonCard, this))
            }
        })

    }
}

class ChooseDefeatedHeroAtAnyOpponentsDungeonAnSendItToHisEntranceAtDestroy extends DungeonMechanic {
    cardAction: CardAction

    constructor(dungeonCard: DungeonCard, mechanicDescription: string, type?: DungeonMechanicTypes) {
        super(dungeonCard, mechanicDescription)

        this.cardAction = new CardAction({
            title: "Użyj - Zniszcz",
            assignTo: this.dungeonCard,
            allowUseFor: () => [this.dungeonCard.owner],
            onUse: (playerThatUsed) => this.handleUsedByPlayer(playerThatUsed),
        })
    }

    handleUsedByPlayer(player: Player) {
        this.dungeonCard.setAllowDestroy(true)
        player.destroyDungeonCard(this.dungeonCard.id)
        this.dungeonCard.setAllowDestroy(false)

        new SelectionRequestUniversal({
            amount: 1,
            metadata: {
                displayType: "mixed"
            },
            avalibleItemsForSelectArr: this.dungeonCard.trackedGame.players.filter(p => p !== player),
            selectionMessage: "Wybierz przeciwnika, którego pokonanego bohatera chcesz wysłać na początek jego lochu. (Zombie Prison)",
            requestedPlayer: player,
            onFinish: ([selectedPlayer]) => {
                if (selectedPlayer.defeatedHeroes.length === 0) return

                new SelectionRequestUniversal({
                    amount: 1,
                    avalibleItemsForSelectArr: [...selectedPlayer.defeatedHeroes],
                    metadata: {
                        displayType: "mixed"
                    },
                    requestedPlayer: player,
                    selectionMessage: "Wybierz pokonanego bohatera, którego chcesz wysłać na początek lochu. (Zombie Prison)",
                    onFinish: ([selectedHero]) => {
                        selectedHero.health = selectedHero.baseHealth
                        selectedPlayer.defeatedHeroes.splice(selectedPlayer.defeatedHeroes.indexOf(selectedHero), 1)
                        selectedPlayer.dungeonEntranceHeroes.push(selectedHero)
                        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_DUNGEON_MECHANIC(player, this.dungeonCard, this))
                    }
                })
            }
        })
    }
}

const dungeonMechanicsMap = {
    'Bezdenna czeluść': EliminateHeroInDungeon,
    'Niestabilna kopalnia': Get3MoneyOnDestroy,
    'Norka kocicy': DrawSpellWhenPlayedSpell,
    'Zgniatarka odpadów': Draw2GoldWhenAnyDungeonDestoryed,
    'Targowisko goblinów': Draw2GoldWhenDungeonBuildNext,
    'Wszystkowidzące Oko': NegateSpellByRemovingYourSpell,
    'Nieprzebyty krużganek': add1TreasureToAnyDungeonForThisRoundOnDestory,
    'Kopiec doppelgangerów': getOneDamageForEveryLuredHero,
    'Skarbiec diabląt': TakeThrownAwayCardByOtherPlayer,
    'Labirynt Minotaura': SendHeroBackToDungeonStart,
    'Czarny rynek': Pay1GoldToDrawSpellWhenAnyDungeonDestroyed,
    'Fabryka golemów': DrawDungeonWhenHeroEliminatedInThisDungeon,
    'Beast Menagerie': DrawDungeonCardWhenYouBuildMonsterDungeonOncePerRound,
    'Boulder Ramp': DestroyOtherRoomToDeal5DamageToHeroOnThisRoom,
    'Brainsucker Hive': MayDrawSpellWhenHeroDiedInRoomOncePerTurn,
    'Centipede Tunnel': SwapAnyTwoRoomsOnBuild,
    'Construction Zone': BuildAnotherDungeonWhenThisDungeonBuild,
    'Mimic Vault': PlaceHeroFromCityAtEntranceAtBuild,
    "Monster's Ballroom": DamageEqualToNumberOfMonsterDungeonsInDungeon,
    'Monstrous Monument': DrawMonsterRoomFromDiscardedPileOnBuild,
    'Neanderthal Cave': DisableBuildOfFancyDungeonOnTopOfThisDungeon,
    "Open Grave": ChooseDungeonCardFromDiscardedDungeonPileWhenHeroDiesInThisDungeonRoomOncePerRound,
    'Dark Altar': DestroyDungeonToTakeOneCardFromDiscardedPile,
    'Dark Laboratory': DrawTwoSpellCardsAndDiscardOneOnRoomBuild,
    'Dizzygas Hallway': BoostNextRoomBy2IfItIsTrapsRoom,
    'Dracolich Lair': DiscardTwoDungeonCardsToTakeOneFromDiscardedPileOnUseOncePerTurn,
    "Dragon Hatchery": ContainsAllFourTreasureTypes,
    'Recycling Center': DrawTwoDungeonRoomCardsWhenDungeonIsDestroyed,
    "Specter's Sanctum": OponnentDiscardRandomSpellCardOnBuild,
    "Succubus Spa": TakeRandomCardFromOpponentWhenHeroDiesInThisDungeonOncePerRound,
    "Vampire Bordello": HealWoundAndAddItsSoulToScoreWhenHeroDiesInThisDungeonOncePerRound,
    "Goblin Armory": BoostAdjacentMonsterRoomsByOne,
    "Golem Factory": DrawRoomCardIfHeroDiesInThisDungeonOncePerRound,
    "Haunted Library": DrawSpellCardAtRoundStartInsteadOfDungeonCard,
    "Witch's Kitchen": DiscardMonsterRoomToDrawSpellCardOncePerRound,
    "Bottomless Pit": KillHeroInThisRoomOnDestroy,
    "Jackpot Stash": DoubleEveryRoomTreasureOnDestroy,
    "Torture Chamber": OpponentDiscardsRandomDungeonCardOnDestroy,
    "Zombie Prison": ChooseDefeatedHeroAtAnyOpponentsDungeonAnSendItToHisEntranceAtDestroy,
}


module.exports = {
    dungeonMechanicsMap,
    // mechanicsTypes
}

export { DungeonMechanic }
