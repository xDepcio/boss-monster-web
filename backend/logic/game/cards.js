const { NotAllPlayersAcceptedHeroMove } = require('../errors')


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
        this.health -= this.dungeonRoom.damage
        this.checkDeath()
    }

    checkDeath() {
        if (this.health <= 0) {
            this.dungeonOwner.defeatedHeroes.push(this)
            this.dungeonOwner.updateScore()
        }
    }

    finishPlayerDungeon() {
        this.dungeonOwner.heroesThatDefeatedPlayer.push(this)
        this.damageCurrentPlayer()
    }

    damageCurrentPlayer() {
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
}


class SpellCard extends Card {
    constructor(id, name, CARDTYPE, trackedGame, playablePhase) {
        super(id, name, CARDTYPE, trackedGame)
        this.playablePhase = playablePhase
    }
}


module.exports = {
    Card,
    HeroCard,
    DungeonCard,
    SpellCard
}
