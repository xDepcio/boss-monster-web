import { Game } from "../game/game"
import { Player } from "../player/player"
import { Id } from "../types"

class Lobby {
    static lobbies = {}

    id: Id
    players: Player[]
    trackedGame: Game

    constructor(id: Id) {
        this.id = id
        this.players = []
        this.trackedGame = null
        Lobby.lobbies[id] = this
    }

    addPlayer(player: Player) {
        this.players.push(player)
    }

    isPlayerIn(player: Player) {
        let isIn = false
        this.players.forEach(ele => {
            if (ele.id === player.id) {
                isIn = true
            }
        });
        return isIn
    }

    trackGame(game: Game) {
        this.trackedGame = game
    }

    isGameStarted() {
        return this.trackedGame !== null
    }

    static getLobby(lobbyId: Id): Lobby {
        return Lobby.lobbies[lobbyId]
    }
}

// module.exports = Lobby

export { Lobby }
