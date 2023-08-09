import './MainPage.css'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom'

function MainPage() {
    const navigate = useNavigate()

    useEffect(() => {

    }, [])

    const handleLobbyStart = () => {
        fetch('/lobby', {
            method: 'POST'
        }).then((res) => res.json()).then((data) => navigate(`/lobby/${data.lobbyId}`))
    }

    return (
        <div className='border-solid rounded-lg shadow-lg border-yellow-600 border-[1px] bg-zinc-900 p-4 flex items-center justify-center w-fit fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 '>
            <div>
                <div>
                    <label>
                        <p className='text-base font-semibold text-zinc-300 mb-1'>Twój Nick</p>
                        <input type="text" defaultValue={"olek"} className='text-zinc-300 bg-zinc-800 p-1 text-base rounded-[0.4rem] border-zinc-400 border-[1px] border-solid outline-zinc-400' />
                    </label>
                </div>
                {/* <h2 className='text-zinc-300'>Stwórz lobby</h2> */}
                <button
                    className='mt-4 px-3 py-2 hover:bg-yellow-600 transition-all cursor-pointer text-sm border-none rounded-full bg-yellow-700 w-full text-zinc-300 font-semibold'
                    onClick={handleLobbyStart}
                >stwórz lobby
                </button>
            </div>
        </div>
    )
}

export default MainPage
