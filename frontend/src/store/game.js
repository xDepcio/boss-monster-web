const LOAD_GAME_INFO = 'TODO_TOGGLED'


// Normal actions creator
export const loadGameInfo = (gameData) => ({
    type: LOAD_GAME_INFO,
    gameData
})


// Thunk actions creator
export const getGameInfo = (lobbyId) => async (dispatch) => {
    const response = await fetch(`/game/${lobbyId}`)

    if (response.ok) {
        const gameData = await response.json()
        dispatch(loadGameInfo(gameData))
    }
}

// Reducer
const gameReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_GAME_INFO: {
            const newState = { ...state }
            newState.info = action.gameData
            return newState
        }
        default: {
            return state
        }
    }
}

export default gameReducer
