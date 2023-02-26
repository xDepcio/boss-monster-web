const feedback = require("../actionFeedbacks")
const { SelectionRequest } = require("../playerRequestSelections")


class SpellMechanic {
    constructor(spellCard, mechanicDescription) {
        this.spellCard = spellCard
        this.mechanicDescription = mechanicDescription
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


const spellsMechanicsMap = {
    'Wyczerpanie': Exhaustion
}

module.exports = {
    spellsMechanicsMap,
}
