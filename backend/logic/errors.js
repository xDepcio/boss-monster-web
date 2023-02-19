// In Game errors

class HeroesCardsStackEmpty extends Error {
    constructor(message) {
        super(message)
    }
}


// In Player errors

class WrongPhaseToBuild extends Error {
    constructor(message) {
        super(message)
    }
}

class PlayerAlreadyDeclaredBuild extends Error {
    constructor(message) {
        super(message)
    }
}

class DungeonCardsStackEmpty extends Error {
    constructor(message) {
        super(message)
    }
}

class SpellCardsStackEmpty extends Error {
    constructor(message) {
        super(message)
    }
}

class BossCardStackEmpty extends Error {
    constructor(message) {
        super(message)
    }
}

class NoSuchBossInPlayerCards extends Error {
    constructor(message) {
        super(message)
    }
}

class PlayerAlreadySelectedBoss extends Error {
    constructor(message) {
        super(message)
    }
}

class CardCannotBeBuilt extends Error {
    constructor(message) {
        super(message)
    }
}

class DungeonFullError extends Error {
    constructor(message) {
        super(message)
    }
}

class NoSuchDungeonInPlayerCards extends Error {
    constructor(message) {
        super(message)
    }
}

class InvalidFancyDungeonBuild extends Error {
    constructor(message) {
        super(message)
    }
}


// In Hero card
class NotAllPlayersAcceptedHeroMove extends Error {
    constructor(message) {
        super(message)
    }
}



module.exports = {
    CardCannotBeBuilt,
    DungeonCardsStackEmpty,
    PlayerAlreadyDeclaredBuild,
    SpellCardsStackEmpty,
    HeroesCardsStackEmpty,
    DungeonFullError,
    NotAllPlayersAcceptedHeroMove,
    BossCardStackEmpty,
    NoSuchBossInPlayerCards,
    PlayerAlreadySelectedBoss,
    InvalidFancyDungeonBuild,
    NoSuchDungeonInPlayerCards,
    WrongPhaseToBuild
}
