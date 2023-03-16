const Player = require('../player/player')
const { getShuffledDungeonCards, getShuffledHeroCards, getShuffledSpellCards, getShuffledBossesCards } = require('./utils')
const { PlayerAlreadyDeclaredBuild, HeroesCardsStackEmpty, NotAllPlayersAcceptedHeroMove } = require('../errors')
const { feedback } = require('./actionFeedbacks')
const { mechanicsTypes } = require('./unique_mechanics/dungeonMechanics')


const phase = {
    BUILD: 'build',
    FIGHT: 'fight',
    START: 'start'
}


class Game {
    static games = {}

    constructor(id, players = null) {
        this.id = id
        this.players = players || []
        this.notUsedSpellCardsStack = getShuffledSpellCards(this)
        this.notUsedDungeonCardsStack = getShuffledDungeonCards(this)
        this.notUsedHeroCardsStack = getShuffledHeroCards(this)
        this.notUsedBossesStack = getShuffledBossesCards(this)
        this.usedCardsStack = []
        this.gameRound = 1
        this.roundPhase = phase.START
        this.city = []
        this.movesHistory = []
        this.heroToMove = null
        this.currentlyPlayedSpell = null
        this.roundModifiers = []
        this.startGame()
    }

    setCurrentlyPlayedSpell(spell) {
        this.currentlyPlayedSpell = spell
    }

    getCurrentlyPlayedSpell() {
        return this.currentlyPlayedSpell
    }

    addRoundModifier(modifer) {
        this.roundModifiers.push(modifer)
    }

    removeRoundModifiers() {
        this.roundModifiers.forEach(modifier => modifier.handleRoundEnded())
        this.roundModifiers = []
    }

    startGame() {
        this.players.forEach((player) => {
            player.trackGame(this)
            player.drawStartingBosses()
        })
    }

    startFirstRound() {
        this.roundPhase = phase.BUILD
        this.saveGameAction(feedback.START_FIRST_ROUND())
        this.players.forEach(player => {
            player.becomeNotReady()
            player.drawStartCards()
        })
        this.fillCityWithHeroes()
    }

    setPlayersOrder() {
        this.players.sort((pl1, pl2) => pl2.selectedBoss.pd - pl1.selectedBoss.pd)
    }

    checkForPhaseEnd() {
        if (this.areAllPlayersReady()) {
            switch (this.roundPhase) {
                case phase.START: {
                    this.setPlayersOrder()
                    this.startFirstRound()
                    break
                }
                case phase.BUILD: {
                    this.startNewFightPhase()
                    break
                }
                case phase.FIGHT: {
                    this.startNewBuildPhase()
                    break
                }
            }
        }
    }

    startNewFightPhase() {
        this.saveGameAction(feedback.START_FIGHT_PHASE())
        this.players.forEach(player => player.becomeNotReady())
        this.roundPhase = phase.FIGHT
        this.players.forEach(player => player.buildDeclaredDungeon())
        // this.buildDeclaredCards()
        // this.city.forEach(hero => hero.goToLuredPlayer())
        // not elegeant fix below
        for (let i = 0; i < this.city.length; i++) {
            const hero = this.city[i]
            const beforeMoveLength = this.city.length
            hero.goToLuredPlayer()
            const AfterMoveLength = this.city.length
            i -= beforeMoveLength - AfterMoveLength
        }
        // Known issue: When hero goes to player it is removed from city and thus
        // this.city gets shorter and next index in this.city array gets skipped
        this.selectNextHeroToMove()
    }

    selectNextHeroToMove() {
        this.heroToMove = this.getHeroAtNextPlayerDungeon()
        this.requestHeroDungeonEntrance()
    }

    startNewBuildPhase() {
        this.incrementGameRound()
        this.saveGameAction(feedback.START_BUILD_PHASE())
        this.players.forEach(player => player.becomeNotReady())
        this.players.forEach(player => player.drawNotUsedDungeonCard())
        this.roundPhase = phase.BUILD
        this.fillCityWithHeroes()
        this.removeRoundModifiers()
    }

    addHeroToCity(hero) {
        this.city.push(hero)
    }

    incrementGameRound() {
        this.gameRound += 1
        this.saveGameAction(feedback.NEW_ROUND_BEGUN(this))
    }

    requestHeroDungeonEntrance() {
        if (!this.heroToMove) {
            this.saveGameAction(feedback.NO_MORE_HEROES_IN_FIGHT_PHASE())
        }
        else {
            try {
                this.heroToMove.moveToNextRoom()
                this.players.forEach(player => player.becomeNotReadyForHeroMove())
            } catch (error) {
                if (error instanceof NotAllPlayersAcceptedHeroMove) {
                    console.log('Not all players ready for hero to move')
                }
                else {
                    throw error
                }
            }
        }
    }

    getHeroAtNextPlayerDungeon() {
        for (let player of this.players) {
            const hero = player.dungeonEntranceHeroes[player.dungeonEntranceHeroes.length - 1]
            if (hero) {
                return hero
            }
        }
        return null
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

    areAllPlayersReady() {
        for (const player of this.players) {
            if (!player.finishedPhase) {
                return false
            }
        }
        return true
    }

    hasAllPlayersAcceptedHeroMove() {
        for (const player of this.players) {
            if (!player.hasAcceptedHeroEntrance()) {
                return false
            }
        }
        return true
    }

    hasAllPlayersAcceptedSpellPlay() {
        for (const player of this.players) {
            if (!player.hasAcceptedSpellPlay()) {
                return false
            }
        }
        return true
    }

    saveGameAction(feedbackObj) {
        this.players.forEach(player => {
            player.dungeon.forEach(dungeon => dungeon.handleGameEvent(feedbackObj))
            if (player.selectedBoss) {
                player.selectedBoss.handleGameEvent(feedbackObj)
            }
        })

        this.movesHistory.push(feedbackObj)
    }

    printHistory() {
        for (let move of this.movesHistory) {
            console.log(move.message)
        }
    }

    getHeroToMove() {
        return this.heroToMove
    }

    static getGame(gameId) {
        return Game.games[gameId]
    }
}


module.exports = {
    Game,
}
