import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from 'react-router-dom'
import { getGameInfo, loadGameInfo } from '../store/game'
import './GamePage.css'
import Card from './gamePageElements/card'
import Cookies from 'js-cookie'
import Chat from './gamePageElements/Chat'
import City from './gamePageElements/City'
import PlayerCards from './gamePageElements/PlayerCards'
import PlayerDungeon from './gamePageElements/PlayerDungeon'
import ChooseBoss from './gamePageElements/ChooseBoss'
import { socket } from '../App'

function GamePage() {
    const params = useParams()
    const dispatch = useDispatch()

    const players = useSelector(state => state.game.players)
    const game = useSelector(state => state.game.game)

    const [selectedDungCard, setSelectedDungCard] = useState(null)

    useEffect(() => {
        dispatch(getGameInfo(params.lobbyId))
        socket.on('gameSync', (data) => {
            dispatch(loadGameInfo(data))
        })
    }, [])

    return (
        <>
            <City />
            <Chat />
            <PlayerCards selectedDungCard={selectedDungCard} setSelectedDungCard={setSelectedDungCard} />
            {game?.roundPhase === 'start' && <ChooseBoss />}
            <div className='players-dungeons-wrapper'>
                {players?.map((player, i) => <PlayerDungeon setSelectedDungCard={setSelectedDungCard} selectedDungCard={selectedDungCard} key={i} player={player} />)}
            </div>
        </>
    )

}

export default GamePage
