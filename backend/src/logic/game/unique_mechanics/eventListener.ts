import { GameEvent } from "../actionFeedbacks.js";
import { Game } from "../game.js";

export class EventListener {
    eventsHandler: (event: GameEvent) => void
    trackedGame: Game

    constructor({ eventsHandler, trackedGame }: { eventsHandler: (event: GameEvent) => void, trackedGame: Game }) {
        this.eventsHandler = eventsHandler
        this.trackedGame = trackedGame

        this.mount()
    }

    handleEvent(event: GameEvent) {
        this.eventsHandler(event)
    }

    mount() {
        this.trackedGame.addEventListener(this)
    }

    unMount() {
        this.trackedGame.removeEventListener(this)
    }
}
