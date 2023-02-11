const {
    PlayerAlreadyDeclaredBuild,
    DungeonCardsStackEmpty,
    SpellCardsStackEmpty,
    CardCannotBeBuilt,
    DungeonFullError
} = require('../errors')
const feedback = require('../game/actionFeedbacks')


class Player {
    static players = {}

    constructor(id) {
        this.id = id
        this.dungeonCards = []
        this.spellCards = []
        this.trackedGame = null
        this.finishedPhase = false
        this.dungeon = []
        this.dungeonEntranceHeroes = []
        this.acceptedheroMove = false
        this.health = 5
        this.defeatedHeroes = []
        this.totalScore = 0
        this.heroesThatDefeatedPlayer = []
        this.collectedTreasure = {
            faith: 0,
            strength: 0,
            magic: 0,
            fortune: 0
        }
        Player.players[id] = this
    }

    drawStartCards() {
        this.drawNotUsedDungeonCard()
        this.drawNotUsedDungeonCard()
        this.drawNotUsedSpellCard()
    }

    trackGame(game) {
        this.trackedGame = game
    }

    drawNotUsedDungeonCard() {
        const card = this.trackedGame.notUsedDungeonCardsStack.pop()
        if (!card) {
            throw new DungeonCardsStackEmpty("Can't draw from empty dungeon stack")
        }
        this.dungeonCards.push(card)
        return card
    }

    drawNotUsedSpellCard() {
        const card = this.trackedGame.notUsedSpellCardsStack.pop()
        if (!card) {
            throw new SpellCardsStackEmpty("Can't draw from empty spell stack")
        }
        this.spellCards.push(card)
        return card
    }

    declareBuild(card) {
        if (card.CARDTYPE !== 'DUNGEON') {
            throw new CardCannotBeBuilt("Only dungeon cards can be built")
        }
        if (this.dungeon.length >= 5) {
            throw new DungeonFullError("Cannot build card because player's dungeon is full")
        }
        try {
            this.trackedGame.handlePlayerBuildDeclaration(this, card)
            this.useDungeonCard(card)
        } catch (error) {
            if (error instanceof PlayerAlreadyDeclaredBuild) {
                console.log(error.message)
            } else {
                throw error
            }
        }
    }

    useDungeonCard(card) {
        for (let i = 0; i < this.dungeonCards.length; i++) {
            const posessedCard = this.dungeonCards[i]
            if (posessedCard.id === card.id) {
                this.dungeonCards.splice(i, 1)
                return posessedCard
            }
        }
        return false
    }

    buildDungeon(dungeonCard) {
        this.dungeon.push(dungeonCard)
        this.updateCollectedTreasure()
    }

    updateCollectedTreasure() {
        for (const dungeonCard of this.dungeon) {
            for (const [treasureSign, treasureAmount] of Object.entries(dungeonCard.treasure)) {
                this.collectedTreasure[treasureSign] += treasureAmount
            }
        }
    }

    becomeReady() {
        this.finishedPhase = true
        this.trackedGame.saveGameAction(feedback.PLAYER_BECOME_READY(this))
        this.trackedGame.checkForPhaseEnd()
    }

    becomeNotReady() {
        this.finishedPhase = false
    }

    hasAcceptedHeroEntrance() {
        return this.acceptedheroMove
    }

    acceptHeroMove() {
        this.acceptedheroMove = true
        this.trackedGame.requestHeroDungeonEntrance()
    }

    getDamage(damageAmount) {
        this.health -= damageAmount
        if (this.health <= 0) {
            this.die()
        }
    }

    die() {
        throw new Error('PLAYER DIED. TODO...')
    }

    updateScore() {
        let score = 0
        for (let hero of this.defeatedHeroes) {
            score += hero.damageDealt
        }
        this.totalScore = score
        this.checkWin()
    }

    checkWin() {
        if (this.totalScore >= 10) {
            this.declareWin()
        }
    }

    declareWin() {
        throw new Error("PLAYER HAS WON. TODO...")
    }

    static getPlayer(playerId) {
        return Player.players[playerId]
    }
}

module.exports = Player
