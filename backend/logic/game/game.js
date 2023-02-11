const Player = require('../player/player')
const { getShuffledDungeonCards, getShuffledHeroCards, getShuffledSpellCards } = require('./utils')
const { PlayerAlreadyDeclaredBuild, HeroesCardsStackEmpty, NotAllPlayersAcceptedHeroMove } = require('../errors')
const feedback = require('./actionFeedbacks')


class Game {
    static games = {}

    constructor(id, players = null) {
        this.id = id
        this.players = players || []
        this.notUsedSpellCardsStack = getShuffledSpellCards(this)
        this.notUsedDungeonCardsStack = getShuffledDungeonCards(this)
        this.notUsedHeroCardsStack = getShuffledHeroCards(this)
        this.usedCardsStack = []
        this.gameRound = 1
        this.roundPhase = 'build'
        this.buildPhaseDeclaredBuilds = {}
        this.city = []
        this.movesHistory = []
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
        this.saveGameAction(feedback.PLAYER_DECLARED_BUILD(player))
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
        this.saveGameAction(feedback.START_FIGHT_PHASE())
        this.players.forEach(player => player.becomeNotReady())
        this.roundPhase = 'fight'
        this.buildDeclaredCards()
        this.city.forEach(hero => hero.goToLuredPlayer())
        this.requestHeroDungeonEntrance()
    }

    requestHeroDungeonEntrance() {
        const hero = this.getHeroAtNextPlayerDungeon()
        if (!hero) {
            throw new Error('NO HEROES IN PLAYERS DUNGEONS. TODO...')
        }
        try {
            hero.moveToNextRoom()
        } catch (error) {
            if (error instanceof NotAllPlayersAcceptedHeroMove) {
                console.log('Not all players ready for hero to move')
            }
            else {
                throw error
            }
        }
    }

    getHeroAtNextPlayerDungeon() {
        for (let player of this.players) {
            const hero = player.dungeonEntranceHeroes.pop()
            if (hero) {
                return hero
            }
        }
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

    saveGameAction(feedbackObj) {
        this.movesHistory.push(feedbackObj)
    }

    printHistory() {
        for (let move of this.movesHistory) {
            console.log(move.message)
        }
    }

    static getGame(gameId) {
        return Game.games[gameId]
    }
}


module.exports = {
    Game,
}
