import Cookies from 'js-cookie'
import './MainPage.css'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom'

function MainPage() {
    const navigate = useNavigate()
    const [lobbyToJoin, setLobbyToJoin] = useState('')
    const [nickname, setNickname] = useState(Cookies.get('userNick') ?? '')

    useEffect(() => {

    }, [])

    const handleLobbyStart = () => {
        fetch('/lobby', {
            method: 'POST'
        })
            .then((res) => res.json())
            .then((data) => {
                fetch(`/lobby/${data.lobbyId}/join`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: Cookies.get('user'),
                        name: nickname
                    })
                }).then(() => navigate(`/lobby/${data.lobbyId}`))
                // navigate(`/lobby/${data.lobbyId}`)
            })
    }

    const handleJoinLobby = () => {
        fetch(`/lobby/${lobbyToJoin}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                name: nickname
            })
        }).then(() => navigate(`/lobby/${lobbyToJoin}`))
    }

    return (
        <div className='border-solid rounded-lg shadow-lg border-yellow-600 border-[1px] bg-zinc-900 p-4 flex items-center justify-center w-fit fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 '>
            <div>
                <div>
                    <label>
                        <p className='text-base font-semibold text-zinc-300 mb-1'>Twój Nick</p>
                        <input
                            value={nickname}
                            onChange={(e) => {
                                Cookies.set('userNick', e.target.value)
                                setNickname(Cookies.get('userNick'))
                            }}
                            type="text"
                            placeholder='Nick'
                            className='w-full box-border text-zinc-300 bg-zinc-800 p-1 text-base rounded-[0.4rem] border-zinc-400 border-[1px] border-solid outline-zinc-400'
                        />
                    </label>
                </div>
                {/* <h2 className='text-zinc-300'>Stwórz lobby</h2> */}
                <button
                    className='mt-14 px-3 py-[6px] hover:bg-yellow-600 transition-all cursor-pointer text-sm border-none rounded-md bg-yellow-700 w-full text-zinc-300 font-semibold'
                    onClick={handleLobbyStart}
                >stwórz lobby
                </button>
                <div className='text-zinc-400 flex w-full items-center gap-2 mt-4'>
                    <div className='h-[1px] bg-zinc-400 flex-grow' />
                    <p className='leading-[100%]'>lub dołącz</p>
                    <div className='h-[1px] bg-zinc-400 flex-grow' />
                </div>
                <div className='mt-4 flex gap-2'>
                    <input
                        value={lobbyToJoin}
                        onChange={(e) => setLobbyToJoin(e.target.value)}
                        placeholder='Lobby ID'
                        className='text-zinc-300 bg-zinc-800 p-1 text-base rounded-[0.4rem] border-zinc-400 border-[1px] border-solid outline-zinc-400'
                    />
                    <button
                        className='px-4 py-[6px] hover:bg-yellow-600 transition-all cursor-pointer text-sm border-none rounded-md bg-yellow-700 w-full text-zinc-300 font-semibold'
                        onClick={handleJoinLobby}
                    >dołącz
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MainPage
