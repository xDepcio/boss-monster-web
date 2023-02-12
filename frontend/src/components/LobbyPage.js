import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getLobbyInfo } from '../store/lobby'

function LobbyPage() {
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const players = useSelector((state) => state.lobby.info.players)
    const gameStarted = useSelector((state) => state.lobby.info.gameStarted)

    useEffect(() => {
        fetch(`/lobby/${params.lobbyId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user')
            })
        })

        const playersSyncInterval = setInterval(() => {
            dispatch(getLobbyInfo(params.lobbyId))
            console.log('t')
        }, 1500)

        return () => {
            clearInterval(playersSyncInterval)
        }

    }, [])

    useEffect(() => {
        if (gameStarted) {
            navigate(`/lobby/${params.lobbyId}/game`)
        }
    }, [gameStarted])

    const handleStartGame = () => {
        fetch(`/lobby/${params.lobbyId}/start`, {
            method: 'POST'
        })
    }

    return (
        <div>
            <h2>Lobby {params.lobbyId}</h2>
            <p>Wyślij url innym aby dołączyli</p>
            {players?.map((player, i) => {
                return (
                    <div key={i}>
                        <p>{player.id}</p>
                    </div>
                )
            })}
            <button onClick={handleStartGame}>Rozpocznij grę</button>
        </div>
    )
}

export default LobbyPage
