import { Game } from "./game/game";
import { Id } from "./types";
import axios from "axios";


type Input = {
    route: string;
    userName: string;
    payload: any;
}

export class InputTracker {
    private inputs: Input[] = [];
    trackedGame: Game

    constructor({ game }: { game: Game }) {
        this.trackedGame = game
    }

    public saveInput(input: Input) {
        this.inputs.push(input);
    }

    public async injectMoves(lobbyId: Id, moves: Input[]) {
        for (let move of moves) {
            let path = move.route.replace(':lobbyId', String(lobbyId))
            let payload = {
                ...move.payload,
                userId: this.trackedGame.players.find((player) => player.name === move.userName)?.id
            }
            console.log(path, payload)
            // const payload = {}
            // const data = await axios.post(`http://localhost:3001/lobby/test/xd`, payload, {
            const data = await axios.post(`http://localhost:3001/game${path}`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log(data)
        }
    }

    public getInputs() {
        return this.inputs;
    }
}
