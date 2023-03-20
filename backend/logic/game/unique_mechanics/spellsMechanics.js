const { feedback } = require("../actionFeedbacks")
const { SelectionRequest } = require("../playerRequestSelections")


class SpellMechanic {
    constructor(spellCard, mechanicDescription) {
        this.spellCard = spellCard
        this.mechanicDescription = mechanicDescription
        if (!this.spellCard.getDescription()) {
            this.spellCard.setDescription(this.mechanicDescription)
        }
    }

    getDescription() {
        return this.mechanicDescription
    }
}


// Wyczerpanie
class Exhaustion extends SpellMechanic {
    constructor(spellCard, mechanicDescription, targetHero = null) {
        super(spellCard, mechanicDescription)
        this.targetHero = targetHero
    }

    use() {
        if (!this.targetHero) {
            this.requestPlayerSelect()
        }
        else {
            const damageToDeal = this.calculateDamageDealt()
            this.targetHero.getDamaged(damageToDeal)
            this.spellCard.trackedGame.saveGameAction(feedback.HERO_DAMAGED_BY_SPELL(this.targetHero, damageToDeal, this.spellCard.name, this.spellCard.owner))
            if (this.targetHero.checkDeath()) {
                this.targetHero.die()
            }

            //code if valid TODO...
            this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
            this.spellCard.completeUsage()
        }
    }

    receiveSelectionData(data) {
        this.targetHero = data[0]
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.spellCard.owner, SelectionRequest.requestItemTypes.HERO, 1, this.spellCard.owner, this)
        this.spellCard.owner.setRequestedSelection(selectionReq)
    }

    calculateDamageDealt() {
        return this.spellCard.owner.dungeon.length
    }
}

// Przerażenie
class Fear extends SpellMechanic {
    constructor(spellCard, mechanicDescription, targetHero = null) {
        super(spellCard, mechanicDescription)
        this.targetHero = targetHero
    }

    use() {
        if (!this.targetHero) {
            this.requestPlayerSelect()
        }
        else {
            this.targetHero.goBackToCity()
            // this.spellCard.trackedGame.addHeroToCity(this.targetHero)
            // this.targetHero.finishMoving()
            // this.targetHero.setDungeonOwner(null)
            this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
            this.spellCard.completeUsage()
        }
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.spellCard.owner, SelectionRequest.requestItemTypes.HERO, 1, SelectionRequest.scopeAny, this)
        this.spellCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.targetHero = data[0]
    }
}


// Na ratuenk
class PlaceHeroFromCityInOwnedDungeon extends SpellMechanic {
    constructor(spellCard, mechanicDescription, targetHero = null) {
        super(spellCard, mechanicDescription)
        this.targetHero = targetHero
    }

    use() {
        if (!this.targetHero) {
            this.requestPlayerSelect()
        }
        else {
            this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
            this.targetHero.goToPlayer(this.spellCard.owner)
            this.spellCard.completeUsage()
        }
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.spellCard.owner, SelectionRequest.requestItemTypes.HERO, 1, SelectionRequest.scopeAny, this)
        this.spellCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.targetHero = data[0]
    }
}

// Atak żywych trupów
class ReviveDeadHeroAndPlaceInFrontOfDungeonAndAdd2HpFoHim extends SpellMechanic {
    constructor(spellCard, mechanicDescription) {
        super(spellCard, mechanicDescription)
        this.targetHero = null
    }

    use() {
        if (!this.targetHero) {
            this.requestPlayerSelect()
        }
        else {
            this.targetHero.health = this.targetHero.baseHealth + 2
            this.targetHero.finishedMoving = false
            this.targetHero.dungeonRoom = null
            this.spellCard.trackedGame.saveGameAction(feedback.PLAYER_USED_MECHANIC(this.spellCard.owner, this))
            this.spellCard.completeUsage()
        }
    }

    requestPlayerSelect() {
        const selectionReq = new SelectionRequest(this.spellCard.owner, SelectionRequest.requestItemTypes.HERO, 1, SelectionRequest.scopeDeadHeroes, this)
        this.spellCard.owner.setRequestedSelection(selectionReq)
    }

    receiveSelectionData(data) {
        this.targetHero = data[0]
    }
}

const spellsMechanicsMap = {
    'Wyczerpanie': Exhaustion,
    'Przerażenie': Fear,
    'Na ratunek': PlaceHeroFromCityInOwnedDungeon,
    'Atak żywych trupów': ReviveDeadHeroAndPlaceInFrontOfDungeonAndAdd2HpFoHim
}

module.exports = {
    spellsMechanicsMap,
}
