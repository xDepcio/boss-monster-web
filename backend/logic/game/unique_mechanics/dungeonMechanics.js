const { OncePerRoundMechanicUsedAlready, DungeonMechanicUseConditionError } = require("../../errors")
const { feedback, eventTypes } = require("../actionFeedbacks")
const { SelectionRequest } = require("../playerRequestSelections")

// Inheritance Scheme
// DungeonMechanic --|-- DungeonMechanicOnBuild
//                   |-- DungeonMechanicOnDestory
//                   |-- DungeonMechanicAutomatic --|-- DungeonMechanicAutomaticOnePerRound
//                   |                              |
//                   |                              |
//                   |
//                   |-- DungeonMechanicOnUse ------|-- DungeonMechanicOnUseOnePerRound

const mechanicsTypes = {
    ON_DESTORY: 'onDestroy',
    ON_BUILD: 'onBuild',
    ONE_PER_ROUND: 'onePerRound',
    EVERY_GAME_ACTION: 'everyGameAction',
    ON_USE_ONE_PER_ROUND: 'onUseOnePerRound'
}


class DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
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
}

// class DungeonMechanicOnBuild extends DungeonMechanic {
//     constructor(dungeonCard, type, mechanicDescription) {
//         super(dungeonCard, type, mechanicDescription)
//     }
// }

// class DungeonMechanicOnDestory extends DungeonMechanic {
//     constructor(dungeonCard, type, mechanicDescription) {
//         super(dungeonCard, type, mechanicDescription)
//         this.dungeonCard.setAllowDestroy(true)
//     }
// }

// class DungeonMechanicAutomatic extends DungeonMechanic {
//     constructor(dungeonCard, type, mechanicDescription) {
//         super(dungeonCard, type, mechanicDescription)
//     }
// }

// class DungeonMechanicOnUse extends DungeonMechanic {
//     constructor(dungeonCard, type, mechanicDescription) {
//         super(dungeonCard, type, mechanicDescription)
//         this.dungeonCard.setAllowUse(true)
//     }
// }

class EliminateHeroInDungeon extends DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
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
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        dungeonCard.setAllowDestroy(true)
    }

    use() {
        this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        this.dungeonCard.owner.addGold(3)
        // this.dungeonCard.owner.deleteFromDungeon(this)
    }
}


class DrawSpellWhenPlayedSpell extends DungeonMechanic { // "Raz na rundę: kiedy zagrasz kartę czaru, dociągnij kartę czaru."
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        this.usedInRound = false
    }

    setUsedInRound(bool) {
        this.usedInRound = bool
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

    handleGameEvent(event) {
        if (!this.usedInRound) {
            if (event.type === eventTypes.PLAYER_PLAYED_SPELL) {
                if (event.player === this.dungeonCard.owner) {
                    this.use()
                }
            }
        }
    }
}


class Draw2GoldWhenAnyDungeonDestoryed extends DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        this.usedInRound = false
    }

    setUsedInRound(bool) {
        this.usedInRound = bool
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

    handleGameEvent(event) {
        if (!this.usedInRound) {
            if (event.type === eventTypes.PLAYER_DESTROYED_DUNGEON) {
                this.use()
            }
        }
    }
}


class Draw2GoldWhenDungeonBuildNext extends DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
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
        if (newLeft !== this.previousLeft) {
            this.dungeonCard.owner.addGold(2)
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        }
        if (newRight !== this.previousRight) {
            this.dungeonCard.owner.addGold(2)
            this.dungeonCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.dungeonCard.owner, this))
        }
        this.previousLeft = newLeft
        this.previousRight = newRight
    }

    handleGameEvent(event) {
        if (event.type === eventTypes.PLAYER_BUILD_DUNGEON) {
            this.use()
        }
    }
}

class NegateSpellByRemovingYourSpell extends DungeonMechanic {
    constructor(dungeonCard, type, mechanicDescription) {
        super(dungeonCard, type, mechanicDescription)
        this.usedInRound = false
        this.selectedSpell = null
        this.dungeonCard.setAllowUse(true)
    }

    setUsedInRound(bool) {
        this.usedInRound = bool
    }

    use() {
        if (this.checkMechanicUseValid()) {
            if (!this.selectedSpell) {
                this.requestPlayerSelect()
            }
            else {
                const playedSpell = this.dungeonCard.trackedGame.getCurrentlyPlayedSpell()
                playedSpell.completeUsage()
                this.selectedSpell.owner.removeSpellFromHand(this.selectedSpell)
                this.selectedSpell.setOwner(null)
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

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.dungeonCard.owner, SelectionRequest.requestItemTypes.SPELL, 1, this.dungeonCard.owner, this)
        this.dungeonCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.selectedSpell = data[0]
    }
}


const dungeonMechanicsMap = {
    'Bezdenna czeluść': EliminateHeroInDungeon,
    'Niestabilna kopalnia': Get3MoneyOnDestroy,
    'Norka kocicy': DrawSpellWhenPlayedSpell,
    'Zgniatarka odpadów': Draw2GoldWhenAnyDungeonDestoryed,
    'Targowisko goblinów': Draw2GoldWhenDungeonBuildNext,
    'Wszystkowidzące Oko': NegateSpellByRemovingYourSpell
}


module.exports = {
    dungeonMechanicsMap,
    mechanicsTypes
}
