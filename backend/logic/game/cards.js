class Card {
    constructor(id, name, CARDTYPE) {
        this.id = id
        this.name = name
        this.CARDTYPE = CARDTYPE
    }
}

class HeroCard extends Card {
    constructor(id, name, CARDTYPE, health, treasureSign, damageDealt) {
        super(id, name, CARDTYPE)
        this.health = health
        this.treasureSign = treasureSign
        this.damageDealt = damageDealt
    }
}

class DungeonCard extends Card {
    constructor(id, name, CARDTYPE, damage, treasure, type, isFancy) {
        super(id, name, CARDTYPE)
        this.damage = damage
        this.treasure = treasure
        this.type = type
        this.isFancy = isFancy
    }
}

class SpellCard extends Card {
    constructor(id, name, CARDTYPE, playablePhase) {
        super(id, name, CARDTYPE)
        this.playablePhase = playablePhase
    }
}

module.exports = {
    Card,
    HeroCard,
    DungeonCard,
    SpellCard
}
