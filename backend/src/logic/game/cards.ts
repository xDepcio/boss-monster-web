import { Player } from "../player/player"
import { Id, TreasureSign } from "../types"
import { Game } from "./game"
import { CardAction } from "./unique_mechanics/customCardActions"

const { NotAllPlayersAcceptedHeroMove, HeroAlreadyInCity } = require('../errors')
const { feedback, eventTypes } = require('./actionFeedbacks')
const { mechanicsTypes } = require('./unique_mechanics/dungeonMechanics')

class Card {

    id: Id
    name: string
    CARDTYPE: string
    trackedGame: Game
    customCardActions: CardAction[]

    constructor(id: Id, name: string, CARDTYPE: string, trackedGame: Game) {
        this.id = id
        this.name = name
        this.CARDTYPE = CARDTYPE
        this.trackedGame = trackedGame
        this.customCardActions = []
    }

    addCustomCardAction(action) {
        this.customCardActions.push(action)
    }

    getName() {
        return this.name
    }
}


class HeroCard extends Card {
    static heroes = {}

    health: number
    baseHealth: number
    treasureSign: TreasureSign
    damageDealt: number
    description: string | null
    specialName: string | null
    typeName: string | null
    dungeonRoom: DungeonCard
    dungeonOwner: Player
    finishedMoving: boolean

    constructor(id: Id, name: string, CARDTYPE: string, trackedGame: Game, health: number,
        treasureSign: TreasureSign, damageDealt: number, description: string | null = null,
        specialName: string | null = null, typeName: string | null = null
    ) {
        super(id, name, CARDTYPE, trackedGame)
        this.health = health
        this.baseHealth = health
        this.treasureSign = treasureSign
        this.damageDealt = damageDealt
        this.description = description
        this.specialName = specialName
        this.typeName = typeName
        this.dungeonRoom = null
        this.dungeonOwner = null
        this.finishedMoving = false
        HeroCard.heroes[id] = this
    }

    setDungeonOwner(player) {
        this.dungeonOwner = player
    }

    setDungeonRoom(dungeonCard) {
        this.dungeonRoom = dungeonCard
    }

    goToLuredPlayer() {
        const mostValuablePlayer = this.getMostValuablePlayer(this.trackedGame.players)
        if (mostValuablePlayer) {
            this.goToPlayer(mostValuablePlayer)
            // this.trackedGame.saveGameAction(feedback.HERO_GOTO_PLAYER(this, mostValuablePlayer))
            // this.removeSelfFromCity()
            // mostValuablePlayer.addHeroToDungeonEntrance(this)
            // this.setDungeonOwner(mostValuablePlayer)
        }
    }

    goToPlayer(player) {
        this.trackedGame.saveGameAction(feedback.HERO_GOTO_PLAYER(this, player))
        this.removeSelfFromCity()
        player.addHeroToDungeonEntrance(this)
        this.setDungeonOwner(player)
    }

    getMostValuablePlayer(players) {
        let choosen = null
        let lastMaxPlayer
        for (let player of players) {
            if (!lastMaxPlayer) {
                lastMaxPlayer = player
                choosen = lastMaxPlayer
            }
            else {
                if (player.collectedTreasure[this.treasureSign] === lastMaxPlayer.collectedTreasure[this.treasureSign]) {
                    choosen = null
                }
                else if (player.collectedTreasure[this.treasureSign] > lastMaxPlayer.collectedTreasure[this.treasureSign]) {
                    choosen = player
                    lastMaxPlayer = player
                }
            }
        }
        return choosen
    }

    goBackToCity() {
        if (this.isInCity()) {
            throw new HeroAlreadyInCity("Hero ordered to go back to city, was already in city")
        }
        this.trackedGame.addHeroToCity(this)
        this.removeSelfFromDungeonEntrance()
        this.setDungeonOwner(null)
        this.trackedGame.saveGameAction(feedback.HERO_WENT_BACK_TO_CITY(this))
        this.finishMoving()
    }

    isInCity() {
        for (let hero of this.trackedGame.city) {
            if (hero.id === this.id) {
                return true
            }
        }
        return false
    }

    removeSelfFromCity() {
        const heroIndexInCity = this.trackedGame.city.findIndex((hero) => hero.id === this.id)
        this.trackedGame.city.splice(heroIndexInCity, 1)
    }

    removeSelfFromDungeonEntrance() {
        const heroIndexInEntrance = this.dungeonOwner.dungeonEntranceHeroes.findIndex((hero) => hero.id === this.id)
        this.dungeonOwner.dungeonEntranceHeroes.splice(heroIndexInEntrance, 1)
    }

    moveToNextRoom() {
        if (this.checkAllPlayersAcceptedHeroEntrance()) {
            if (this.dungeonRoom === null) {
                if (this.dungeonOwner.dungeon.length === 0) {
                    this.finishPlayerDungeon()
                }
                else {
                    this.dungeonRoom = this.dungeonOwner.dungeon[this.dungeonOwner.dungeon.length - 1]
                    this.triggerCurrentDungeonCard()
                }
            }
            else {
                const newDungeonIndex = this.dungeonOwner.dungeon.findIndex(dung => dung.id === this.dungeonRoom.id) - 1
                if (newDungeonIndex === -1) {
                    this.finishPlayerDungeon()
                }
                else {
                    this.dungeonRoom = this.dungeonOwner.dungeon[newDungeonIndex]
                    this.triggerCurrentDungeonCard()
                }
            }
        }
        else {
            throw new NotAllPlayersAcceptedHeroMove("All players must accept hero move")
        }
    }

    hasFinishedMoving() {
        return this.finishedMoving
    }

    finishMoving() {
        this.finishedMoving = true
        this.trackedGame.players.forEach(player => player.becomeNotReadyForHeroMove())
        this.trackedGame.selectNextHeroToMove()
    }

    triggerCurrentDungeonCard() {
        this.dungeonRoom.heroEnteredRoom(this)
    }

    checkDeath() {
        return this.health <= 0
    }

    getDamaged(amount) {
        this.health -= amount
    }

    die() {
        this.trackedGame.saveGameAction(feedback.PLAYER_KILLED_HERO(this.dungeonOwner, this))
        this.dungeonOwner.defeatedHeroes.push(this)
        this.removeSelfFromDungeonEntrance()
        this.dungeonOwner.updateScore()
        this.finishMoving()
    }

    finishPlayerDungeon() {
        this.dungeonOwner.heroesThatDefeatedPlayer.push(this)
        this.damageCurrentPlayer()
        this.removeSelfFromDungeonEntrance()
        this.finishMoving()
    }

    damageCurrentPlayer() {
        this.trackedGame.saveGameAction(feedback.HERO_ATTACKED_PLAYER(this, this.dungeonOwner))
        this.dungeonOwner.getDamage(this.damageDealt)
    }

    checkAllPlayersAcceptedHeroEntrance() {
        for (let player of this.trackedGame.players) {
            if (!player.hasAcceptedHeroEntrance()) {
                return false
            }
        }
        return true
    }

    static getHero(heroId) {
        return HeroCard.heroes[heroId]
    }
}


class DungeonCard extends Card {
    static dungeons = {}

    damage
    treasure
    type
    isFancy
    description
    belowDungeon
    isActive
    owner
    allowDestroy
    allowUse
    mechanic

    constructor(id, name, CARDTYPE, trackedGame, damage, treasure, type, isFancy, mechanic, mechanicType, mechanicDescription) {
        super(id, name, CARDTYPE, trackedGame)
        this.damage = damage
        this.treasure = treasure
        this.type = type
        this.isFancy = isFancy
        this.description = null
        this.belowDungeon = null
        this.isActive = true
        this.owner = null
        this.allowDestroy = false
        this.allowUse = false
        this.mechanic = mechanic ? new mechanic(this, mechanicType, mechanicDescription) : null
        DungeonCard.dungeons[id] = this
    }

    setOwner(player) {
        this.owner = player
    }

    getDescription() {
        return this.description
    }

    getMechanic() {
        return this.mechanic
    }

    setDescription(description) {
        this.description = description
    }

    heroEnteredRoom(hero) {
        this.trackedGame.saveGameAction(feedback.HERO_ENTERED_ROOM(hero, this, this.owner))
        this.damageHero(hero)
    }

    damageHero(hero) {
        hero.getDamaged(this.damage)
        this.trackedGame.saveGameAction(feedback.HERO_DAMAGED(hero, this, hero.dungeonOwner))
        if (hero.checkDeath()) {
            hero.die()
            this.handleHeroDiedInRoom(hero)
        }
    }

    setAllowDestroy(bool) {
        this.allowDestroy = bool
    }

    setAllowUse(bool) {
        this.allowUse = bool
    }

    isDestroyable() {
        return this.allowDestroy
    }

    isUsable() {
        return this.allowUse
    }

    handleHeroDiedInRoom(killedHero) {
        this.trackedGame.saveGameAction(feedback.HERO_DIED_IN_ROOM(killedHero, this))
    }

    setCardToBuildOn(dungeonCard) {
        this.belowDungeon = dungeonCard
        this.belowDungeon.isActive = false
    }

    handleCardDestroyedMechanic() {
        if (this.mechanic.getType() === mechanicsTypes.ON_DESTORY) {
            this.mechanic.use()
        }
    }

    handleDungeonUsed() {
        if (this.mechanic.getType() === mechanicsTypes.ON_USE_ONE_PER_ROUND) {
            this.mechanic.use()
        }
    }

    handleGameEvent(event) {
        const dungeonMechanic = this.getMechanic()
        if (dungeonMechanic) {
            dungeonMechanic.handleGameEvent(event)
        }
    }

    canBeBuiltOn(cardToBuildOn) {
        if (!this.isFancy) return true
        if (this.matchesTreasureWith(cardToBuildOn)) return true
        return false
    }

    matchesTreasureWith(anotherCard) {
        if (Object.keys(anotherCard.treasure).length > 1) return false
        if (Object.keys(this.treasure)[0] === Object.keys(anotherCard.treasure)[0]) return true
        return false
    }

    static getDungeon(dungeonId) {
        return DungeonCard.dungeons[dungeonId]
    }
}


class SpellCard extends Card {
    static spells = {}

    playablePhase
    description
    owner
    mechanic

    constructor(id, name, CARDTYPE, trackedGame, playablePhase, mechanic, mechanicDescription) {
        super(id, name, CARDTYPE, trackedGame)
        this.playablePhase = playablePhase
        this.description = null
        this.owner = null
        this.mechanic = mechanic ? new mechanic(this, mechanicDescription) : null
        SpellCard.spells[id] = this
    }

    setOwner(player) {
        this.owner = player
    }

    getDescription() {
        return this.description
    }

    setDescription(description) {
        this.description = description
    }

    play() {
        this.trackedGame.setCurrentlyPlayedSpell(this)
        if (this.trackedGame.hasAllPlayersAcceptedSpellPlay()) {
            this.mechanic.use()
        }
    }

    completeUsage() {
        this.trackedGame.saveGameAction(feedback.PLAYER_PLAYED_SPELL(this.owner, this))
        this.trackedGame.setCurrentlyPlayedSpell(null)
        this.owner.removeSpellFromHand(this)
        this.trackedGame.players.forEach(player => player.becomeNotReadyForSpellPlay())
    }

    static getSpell(spellId) {
        return SpellCard.spells[spellId]
    }
}


class BossCard extends Card {
    static bosses = {}

    pd
    treasure
    rankedUp
    owner
    mechanic

    constructor(id, name, CARDTYPE, trackedGame, pd, treasure, mechanic, mechanicDescription) {
        super(id, name, CARDTYPE, trackedGame)
        this.pd = pd
        this.treasure = treasure
        this.rankedUp = false
        this.owner = null
        this.mechanic = mechanic ? new mechanic(this, mechanicDescription) : null
        BossCard.bosses[id] = this
    }

    getMechanic() {
        return this.mechanic
    }

    setOwner(player) {
        this.owner = player
    }

    setRankedUp(bool) {
        this.rankedUp = bool
    }

    hasRankedUp() {
        return this.rankedUp
    }

    handleGameEvent(event) {
        const mechanic = this.getMechanic()
        if (mechanic) {
            mechanic.handleGameEvent(event)
        }
    }

    static getBoss(bossId) {
        return BossCard.bosses[bossId]
    }
}


module.exports = {
    Card,
    HeroCard,
    DungeonCard,
    SpellCard,
    BossCard
}

export { }
