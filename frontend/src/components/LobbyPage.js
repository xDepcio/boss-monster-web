import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getLobbyInfo } from '../store/lobby'
import { LuClipboard, LuUser } from 'react-icons/lu'
import { toast } from 'react-hot-toast'
import { BACKEND_URL } from "../static/constants"

function LobbyPage() {
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const players = useSelector((state) => state.lobby.info.players)
    const gameStarted = useSelector((state) => state.lobby.info.gameStarted)

    useEffect(() => {
        // fetch(BACKEND_URL + `/lobby/${params.lobbyId}/join`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         userId: Cookies.get('user')
        //     })
        // })

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
        fetch(BACKEND_URL + `/lobby/${params.lobbyId}/start`, {
            method: 'POST'
        })
    }

    const handleStartPrefabGame = () => {
        fetch(BACKEND_URL + `/lobby/${params.lobbyId}/start-prefab`, {
            method: 'POST'
        })
    }

    const handleCopyId = () => {
        navigator.clipboard.writeText(params.lobbyId)
        toast.success('Skopiowano ID', {
            icon: '📋'
        })
    }

    return (
        <div className='p-4 bg-zinc-900 border-solid border-yellow-600 border-[1px] rounded-md text-zinc-300 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
            <p className='text-base font-medium'>Wyślij innym ID aby dołączyli</p>
            <div className='mb-8 flex items-center text-zinc-400 gap-1 mt-2 bg-zinc-800/80 rounded-lg pl-3 pr-1 py-1'>
                <p>{params.lobbyId}</p>
                <LuClipboard onClick={handleCopyId} className='hover:bg-zinc-600 text-[1.2rem] cursor-pointer p-2 rounded-lg' />
            </div>
            <div className='flex flex-col gap-1'>
                {players?.map((player, i) => {
                    return (
                        <div key={i} className='flex items-center gap-2'>
                            <LuUser className='text-[1.5rem]' />
                            <p>{player.name}</p>
                        </div>
                    )
                })}
            </div>
            <div className='grid grid-cols-1 mt-6 gap-2'>
                <button
                    className='border-none rounded-md text-zinc-300 hover:bg-yellow-600 transition-all cursor-pointer font-semibold px-2 py-2 bg-yellow-700'
                    onClick={handleStartGame}
                >
                    Rozpocznij grę
                </button>
                <button
                    className='border-none rounded-md text-zinc-300 hover:bg-yellow-600 transition-all cursor-pointer font-semibold px-2 py-2 bg-yellow-700'
                    onClick={handleStartPrefabGame}
                >
                    Rozpocznij grę (suited for tests)
                </button>
            </div>
        </div>
    )
}

export default LobbyPage
