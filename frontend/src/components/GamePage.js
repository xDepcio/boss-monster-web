import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from 'react-router-dom'
import { getGameInfo } from '../store/game'
import './GamePage.css'
import Card from './gamePageElements/card'
import Cookies from 'js-cookie'
import Chat from './gamePageElements/Chat'
import City from './gamePageElements/City'
import PlayerCards from './gamePageElements/PlayerCards'
import PlayerDungeon from './gamePageElements/PlayerDungeon'
import ChooseBoss from './gamePageElements/ChooseBoss'

function GamePage() {
    const params = useParams()
    const dispatch = useDispatch()

    const players = useSelector(state => state.game.players)
    const game = useSelector(state => state.game.game)

    const [selectedDungCard, setSelectedDungCard] = useState(null)

    useEffect(() => {
        const gameSyncInterval = setInterval(() => {
            dispatch(getGameInfo(params.lobbyId))
            console.log('t')
        }, 1500)

        return () => {
            clearInterval(gameSyncInterval)
        }
    })


    return (
        <>
            <City />
            <Chat />
            <PlayerCards selectedDungCard={selectedDungCard} setSelectedDungCard={setSelectedDungCard} />
            {game?.roundPhase === 'start' && <ChooseBoss />}
            {/* {game?.roundPhase === 'start' && (
                <div className='choose-boss-wrapper'>
                    <div className='choose-boss'>
                        {selfPlayer.drawnBosses.map((boss, i) => {
                            return (
                                <>
                                    <Card
                                        _onClick={() => handleBossSelect(boss)}
                                        key={i}
                                        width={280}
                                        name={boss.name}
                                        _className={'boss-choice'}
                                        treasure={boss.treasure}
                                    />
                                </>
                            )
                        })}
                    </div>
                </div>
            )} */}
            <div className='players-dungeons-wrapper'>
                {players?.map((player, i) => <PlayerDungeon setSelectedDungCard={setSelectedDungCard} selectedDungCard={selectedDungCard} key={i} player={player} />)}
            </div>
        </>
    )

}

export default GamePage
