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
    }

    goToLuredPlayer() {
        const mostValuablePlayer = this.getMostValuablePlayer(this.trackedGame.players)
        if (mostValuablePlayer) {
            this.removeSelfFromCity()
            mostValuablePlayer.dungeonEntranceHeroes.push(this)
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
