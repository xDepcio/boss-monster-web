import { Player } from "../../player/player"
import { DungeonMechanicTypes, TreasureSign } from "../../types"
import { GameEvent, feedback } from "../actionFeedbacks"
import { DungeonCard, SpellCard } from "../cards"
import { SelectableItem, SelectionRequest, SelectionRequestOneFromGivenList } from "../playerRequestSelections"
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
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        }
        if (newRight !== this.previousRight && newRight !== null) {
            this.dungeonCard.owner.addGold(2)
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
                playedSpell.completeUsage()
                this.selectedSpell.owner.discardSpellCard(this.selectedSpell)
                // this.selectedSpell.owner.throwCardAway(this.selectedSpell)
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
                this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
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
    'Beast Menagerie': DrawDungeonCardWhenYouBuildMonsterDungeonOncePerRound
}


module.exports = {
    dungeonMechanicsMap,
    // mechanicsTypes
}

export { DungeonMechanic }
