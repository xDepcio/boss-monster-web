import { getPrefabBossesCards, getPrefabDiscardedDungeonCard, getPrefabDiscardedSpells, getPrefabDungeonCards, getPrefabHeroCards, getPrefabSpellCards } from "../../utils/prefabs/gamePrefab"
import { InputTracker } from "../inputTracker"
import { Player } from "../player/player"
import { Id, RoundPhase } from "../types"
import { feedback } from "./actionFeedbacks"
import { BossCard, DungeonCard, HeroCard, SpellCard } from "./cards"
import { RoundModifer } from "./unique_mechanics/roundModifiers"

// const Player = require('../player/player')
const { getShuffledDungeonCards, getShuffledHeroCards, getShuffledSpellCards, getShuffledBossesCards } = require('./utils')
const { PlayerAlreadyDeclaredBuild, HeroesCardsStackEmpty, NotAllPlayersAcceptedHeroMove } = require('../errors')
// const { getPrefabBossesCards, getPrefabDungeonCards, getPrefabHeroCards, getPrefabSpellCards } = require('../../utils/prefabs/gamePrefab')
// const { feedback } = require('./actionFeedbacks')
const { mechanicsTypes } = require('./unique_mechanics/dungeonMechanics')


// const phase = {
//     BUILD: 'build',
//     FIGHT: 'fight',
//     START: 'start'
// }


class Game {
    static games: { [id: Id]: Game } = {}

    id: Id
    players: Player[]
    notUsedSpellCardsStack: SpellCard[]
    notUsedDungeonCardsStack: DungeonCard[]
    notUsedHeroCardsStack: HeroCard[]
    notUsedBossesStack: BossCard[]
    discardedDungeonCardsStack: DungeonCard[]
    discardedSpellCardsStack: SpellCard[]
    gameRound: number
    roundPhase: RoundPhase
    city: HeroCard[]
    movesHistory
    heroToMove: HeroCard | null
    currentlyPlayedSpell: SpellCard | null
    roundModifiers: RoundModifer[]
    inputsTracker: InputTracker

    constructor(id: Id, players: Player[] | null = null, prefab = null) {
        this.id = id
        this.players = players || []
        this.notUsedSpellCardsStack = prefab ? getPrefabSpellCards(this, prefab.spells) : getShuffledSpellCards(this)
        this.notUsedDungeonCardsStack = prefab ? getPrefabDungeonCards(this, prefab.dungeons) : getShuffledDungeonCards(this)
        this.notUsedHeroCardsStack = prefab ? getPrefabHeroCards(this, prefab.heroes) : getShuffledHeroCards(this)
        this.notUsedBossesStack = prefab ? getPrefabBossesCards(this, prefab.bosses) : getShuffledBossesCards(this)
        this.discardedDungeonCardsStack = prefab ? getPrefabDiscardedDungeonCard(this, prefab.discardedDungeons) : []
        this.discardedSpellCardsStack = prefab ? getPrefabDiscardedSpells(this, prefab.discardedSpells) : []
        this.gameRound = 1
        this.roundPhase = "start"
        this.city = []
        this.inputsTracker = new InputTracker()
        this.movesHistory = []
        this.heroToMove = null
        this.currentlyPlayedSpell = null
        this.roundModifiers = []
        this.startGame()
    }

    isModifierAcitve(modifier: RoundModifer) {
        for (let activeModifier of this.roundModifiers) {
            if (activeModifier === modifier) {
                return true
            }
        }
        return false
    }

    setCurrentlyPlayedSpell(spell: SpellCard | null) {
        this.currentlyPlayedSpell = spell
    }

    getCurrentlyPlayedSpell() {
        return this.currentlyPlayedSpell
    }

    addRoundModifier(modifer: RoundModifer) {
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
        this.roundPhase = "build"
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
                case "start": {
                    this.setPlayersOrder()
                    this.startFirstRound()
                    break
                }
                case "build": {
                    // this.startNewFightPhase()
                    this.startNewPostBuildPhase()
                    break
                }
                case "postBuild": {
                    if (this.arePostBuildActionsFinished()) {
                        this.startNewFightPhase()
                    }
                    break
                }
                case "fight": {
                    this.startNewBuildPhase()
                    break
                }
            }
        }
    }

    startNewPostBuildPhase() {
        this.saveGameAction(feedback.START_POST_BUILD_PHASE())
        this.roundPhase = 'postBuild'
        this.players.forEach(player => player.buildDeclaredDungeon())
        this.checkForPhaseEnd()
    }

    arePostBuildActionsFinished() {
        for (let player of this.players) {
            if (player.requestedSelection) {
                return false
            }
        }
        return true
    }

    startNewFightPhase() {
        this.saveGameAction(feedback.START_FIGHT_PHASE())
        this.players.forEach(player => player.becomeNotReady())
        this.roundPhase = "fight"
        // this.players.forEach(player => player.buildDeclaredDungeon())
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
        this.roundPhase = "build"
        this.fillCityWithHeroes()
        this.removeRoundModifiers()
    }

    addHeroToCity(hero: HeroCard) {
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

    getHeroAtNextPlayerDungeon(): HeroCard | null {
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

    drawHeroCard(): HeroCard {
        const card = this.notUsedHeroCardsStack.pop()
        if (!card) {
            throw new HeroesCardsStackEmpty("Can't draw from empty hero cards stack")
        }
        return card
    }

    areAllPlayersReady(): boolean {
        for (const player of this.players) {
            if (!player.finishedPhase) {
                return false
            }
        }
        return true
    }

    hasAllPlayersAcceptedHeroMove(): boolean {
        for (const player of this.players) {
            if (!player.hasAcceptedHeroEntrance()) {
                return false
            }
        }
        return true
    }

    hasAllPlayersAcceptedSpellPlay(): boolean {
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

    static getGame(gameId: Id): Game | undefined {
        return Game.games[gameId]
    }
}

module.exports = {
    Game,
}

export { Game }
