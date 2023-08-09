import { parse } from "flatted"
import { Player } from "../logic/player/player"
import { NextFunction, Request, Response } from "express"
import { InputTracker } from "../logic/inputTracker"

interface ChangedRequest extends Request {
    player: Player
}

export function saveInput(req: ChangedRequest, res: Response, next: NextFunction) {
    const inputTracker: InputTracker = req.player.trackedGame.inputsTracker
    inputTracker.saveInput({
        route: req.route.path,
        userName: req.player.name,
        payload: req.body
    })
    next()
}
