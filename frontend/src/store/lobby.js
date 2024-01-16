import { parse } from "flatted"
import { BACKEND_URL } from "../App"

const LOAD_LOBBY_INFO = 'loadLobbyInfo'


// Normal actions creator
export const loadLobbyInfo = (info) => {
    info = parse(info)
    return {
        type: LOAD_LOBBY_INFO,
        info
    }
}

// Thunk actions creator
export const getLobbyInfo = (lobbyId) => async (dispatch) => {
    const response = await fetch(BACKEND_URL + `/lobby/${lobbyId}`)

    if (response.ok) {
        // const lobbyData = await response.json()
        const lobbyData = await response.text()
        // console.log(lobbyData)
        // console.log(parse(lobbyData))
        dispatch(loadLobbyInfo(lobbyData))
    }
}

// Reducer
const lobbyReducer = (state = { info: {} }, action) => {
    switch (action.type) {
        case LOAD_LOBBY_INFO: {
            const newState = { ...state }
            newState.info = action.info
            return newState
        }
        default: {
            return state
        }
    }
}

export default lobbyReducer
