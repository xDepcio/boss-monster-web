// In Game errors
class PlayerAlreadyDeclaredBuild extends Error {
    constructor(message) {
        super(message)
    }
}

class HeroesCardsStackEmpty extends Error {
    constructor(message) {
        super(message)
    }
}


// In Player errors
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
    NotAllPlayersAcceptedHeroMove
}
