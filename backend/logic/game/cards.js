const { NotAllPlayersAcceptedHeroMove } = require('../errors')
const feedback = require('./actionFeedbacks')


class Card {
    constructor(id, name, CARDTYPE, trackedGame) {
        this.id = id
        this.name = name
        this.CARDTYPE = CARDTYPE
        this.trackedGame = trackedGame
    }
}


class HeroCard extends Card {
    constructor(id, name, CARDTYPE, trackedGame, health, treasureSign, damageDealt) {
        super(id, name, CARDTYPE, trackedGame)
        this.health = health
        this.treasureSign = treasureSign
        this.damageDealt = damageDealt
        this.dungeonRoom = null
        this.dungeonOwner = null
    }

    goToLuredPlayer() {
        const mostValuablePlayer = this.getMostValuablePlayer(this.trackedGame.players)
        if (mostValuablePlayer) {
            this.trackedGame.saveGameAction(feedback.HERO_GOTO_PLAYER(this, mostValuablePlayer))
            this.removeSelfFromCity()
            mostValuablePlayer.dungeonEntranceHeroes.push(this)
            this.dungeonOwner = mostValuablePlayer
        }
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
                this.dungeonRoom = this.dungeonOwner.dungeon[this.dungeonOwner.dungeon.length - 1]
                this.triggerCurrentDungeonCard()
            }
            else {
                const newDungeonIndex = this.dungeonOwner.dungeon.findIndex(dung => dung.id = this.dungeonRoom.id) - 1
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

    triggerCurrentDungeonCard() {
        this.dungeonRoom.heroEnteredRoom(this)
    }

    checkDeath() {
        return this.health <= 0
    }

    die() {
        this.trackedGame.saveGameAction(feedback.PLAYER_KILLED_HERO(this.dungeonOwner, this))
        this.dungeonOwner.defeatedHeroes.push(this)
        this.removeSelfFromDungeonEntrance()
        this.dungeonOwner.updateScore()
    }

    finishPlayerDungeon() {
        this.dungeonOwner.heroesThatDefeatedPlayer.push(this)
        this.damageCurrentPlayer()
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
}


class DungeonCard extends Card {
    constructor(id, name, CARDTYPE, trackedGame, damage, treasure, type, isFancy) {
        super(id, name, CARDTYPE, trackedGame)
        this.damage = damage
        this.treasure = treasure
        this.type = type
        this.isFancy = isFancy
    }

    heroEnteredRoom(hero) {
        this.damageHero(hero)
    }

    damageHero(hero) {
        hero.health -= this.damage
        if (hero.checkDeath()) {
            hero.die()
            this.handleHeroDiedInRoom()
        }
    }

    handleHeroDiedInRoom() {
        // ...TODO something when hero died in this dungeon room
    }
}


class SpellCard extends Card {
    constructor(id, name, CARDTYPE, trackedGame, playablePhase) {
        super(id, name, CARDTYPE, trackedGame)
        this.playablePhase = playablePhase
    }
}


class BossCard extends Card {
    constructor(id, name, CARDTYPE, trackedGame, pd, treasure) {
        super(id, name, CARDTYPE, trackedGame)
        this.pd = pd
        this.treasure = treasure
    }
}


module.exports = {
    Card,
    HeroCard,
    DungeonCard,
    SpellCard,
    BossCard
}
