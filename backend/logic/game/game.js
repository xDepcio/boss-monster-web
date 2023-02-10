const Player = require('../player/player')
const { getShuffledDungeonCards, getShuffledHeroCards, getShuffledSpellCards } = require('./utils')
const { PlayerAlreadyDeclaredBuild, HeroesCardsStackEmpty } = require('../errors')


class Game {
    static games = {}

    constructor(id, players = null) {
        this.id = id
        this.players = players || []
        this.notUsedSpellCardsStack = getShuffledSpellCards()
        this.notUsedDungeonCardsStack = getShuffledDungeonCards()
        this.notUsedHeroCardsStack = getShuffledHeroCards()
        this.usedCardsStack = []
        this.gameRound = 1
        this.roundPhase = 'build'
        this.buildPhaseDeclaredBuilds = {}
        this.city = []
        this.startGame()
    }

    startGame() {
        this.players.forEach((player) => {
            player.trackGame(this)
            player.drawStartCards()
        })
        this.fillCityWithHeroes()
    }

    handlePlayerBuildDeclaration(player, card) {
        if (this.buildPhaseDeclaredBuilds[player.id]) {
            throw new PlayerAlreadyDeclaredBuild("Player already declared card to build in this round")
        }
        this.buildPhaseDeclaredBuilds[player.id] = card
    }

    checkForPhaseEnd() {
        if (this.areAllPlayersReady()) {
            switch (this.roundPhase) {
                case 'build': {
                    this.startNewFightPhase()
                    break
                }
                case 'fight': {
                    this.startNewBuildPhase()
                    break
                }
            }
        }
    }

    startNewFightPhase() {
        this.players.forEach(player => player.becomeNotReady())
        this.roundPhase = 'fight'
        this.buildDeclaredCards()
    }

    fillCityWithHeroes() {
        const missingHeroesNum = 4 - this.city.length
        for (let i = 0; i < missingHeroesNum; i++) {
            const hero = this.drawHeroCard()
            this.city.push(hero)
        }
    }

    drawHeroCard() {
        const card = this.notUsedHeroCardsStack.pop()
        if (!card) {
            throw new HeroesCardsStackEmpty("Can't draw from empty hero cards stack")
        }
        return card
    }

    buildDeclaredCards() {
        for (const [playerId, card] of Object.entries(this.buildPhaseDeclaredBuilds)) {
            const player = Player.getPlayer(playerId)
            player.buildDungeon(card)
        }
    }

    areAllPlayersReady() {
        for (const player of this.players) {
            if (!player.finishedPhase) {
                return false
            }
        }
        return true
    }

    static getGame(gameId) {
        return Game.games[gameId]
    }
}


module.exports = {
    Game,
}
