const {
    PlayerAlreadyDeclaredBuild,
    DungeonCardsStackEmpty,
    SpellCardsStackEmpty,
    CardCannotBeBuilt,
    DungeonFullError,
    BossCardStackEmpty,
    NoSuchBossInPlayerCards,
    PlayerAlreadySelectedBoss
} = require('../errors')
const feedback = require('../game/actionFeedbacks')


class Player {
    static players = {}

    constructor(id, name) {
        this.id = id
        this.name = name
        this.dungeonCards = []
        this.spellCards = []
        this.trackedGame = null
        this.finishedPhase = false
        this.dungeon = []
        this.dungeonEntranceHeroes = []
        this.acceptedheroMove = false
        this.health = 5
        this.money = 3
        this.defeatedHeroes = []
        this.drawnBosses = []
        this.selectedBoss = null
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

    drawStartingBosses() {
        this.drawNotUsedBossCard()
        this.drawNotUsedBossCard()
    }

    selectBoss(bossId) {
        if (this.selectedBoss) {
            throw new PlayerAlreadySelectedBoss("Cannot select another boss in the same game")
        }
        const foundBoss = this.drawnBosses.find(boss => boss.id === bossId)
        if (!foundBoss) {
            throw new NoSuchBossInPlayerCards("Tried to select boss that wasn't in player cards")
        }
        this.selectedBoss = foundBoss
        this.trackedGame.saveGameAction(feedback.PLAYER_SELECTED_BOSS(this, foundBoss))
        this.becomeReady()
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

    drawNotUsedBossCard() {
        const boss = this.trackedGame.notUsedBossesStack.pop()
        if (!boss) {
            throw new BossCardStackEmpty("Can;t draw from empty boss stack")
        }
        this.drawnBosses.push(boss)
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
                // ...TODO when players tries to build a 2nd dungeon in the same round
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
