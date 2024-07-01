import { Player } from "../logic/player/player.js"


function assignPlayer(req, res, next) {
    const userId = req.body.userId
    const player = Player.getPlayer(userId)
    if (!player) {
        console.log('NP SUCH PLAYER IN ...ASSIGNPLAYER')
    }
    else {
        req.player = player
        next()
    }
}


module.exports = {
    assignPlayer
}

export { assignPlayer }
