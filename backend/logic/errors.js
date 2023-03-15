// In Game errors

class HeroesCardsStackEmpty extends Error {
    constructor(message) {
        super(message)
    }
}


// In Player errors
class PlayerAlreadyAcceptedHeroMove extends Error {
    constructor(message) {
        super(message)
    }
}

class PlayerAlreadyReady extends Error {
    constructor(message) {
        super(message)
    }
}

class PhaseNotFinished extends Error {
    constructor(message) {
        super(message)
    }
}

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

class CardCannotBeDestroyed extends Error {
    constructor(message) {
        super(message)
    }
}

class NoSuchDungeonCardInPlayerDungeon extends Error {
    constructor(message) {
        super(message)
    }
}

class WrongRoundPhase extends Error {
    constructor(message) {
        super(message)
    }
}

class NoSuchSpellInPlayerHand extends Error {
    constructor(message) {
        super(message)
    }
}

class OtherSpellCurrentlyAtPlay extends Error {
    constructor(message) {
        super(message)
    }
}

class NoSpellCurrentylAtPlay extends Error {
    constructor(message) {
        super(message)
    }
}

class PlayerAlreadyAcceptedSpellPlay extends Error {
    constructor(message) {
        super(message)
    }
}

class DungeonEffectCannotBeUsed extends Error {
    constructor(message) {
        super(message)
    }
}

class PlayerHasNotEnoughMoney extends Error {
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

class HeroAlreadyInCity extends Error {
    constructor(message) {
        super(message)
    }
}


// In dungeon mechanic
class OncePerRoundMechanicUsedAlready extends Error {
    constructor(message) {
        super(message)
    }
}

class DungeonMechanicUseConditionError extends Error {
    constructor(message) {
        super(message)
    }
}


// In player request selections
class HeroNotFoundInCity extends Error {
    constructor(message) {
        super(message)
    }
}

class InvalidTreasureType extends Error {
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
    WrongPhaseToBuild,
    PhaseNotFinished,
    PlayerAlreadyReady,
    PlayerAlreadyAcceptedHeroMove,
    CardCannotBeDestroyed,
    NoSuchDungeonCardInPlayerDungeon,
    WrongRoundPhase,
    NoSuchSpellInPlayerHand,
    HeroAlreadyInCity,
    OncePerRoundMechanicUsedAlready,
    HeroNotFoundInCity,
    OtherSpellCurrentlyAtPlay,
    NoSpellCurrentylAtPlay,
    PlayerAlreadyAcceptedSpellPlay,
    DungeonEffectCannotBeUsed,
    DungeonMechanicUseConditionError,
    InvalidTreasureType,
    PlayerHasNotEnoughMoney
}
