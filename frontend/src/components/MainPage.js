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
        <div className='bg-zinc-800 p-4 flex items-center justify-center w-fit fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 '>
            <div>
                <h2>Stwórz lobby</h2>
                <button onClick={handleLobbyStart}>Rozpocznij</button>
            </div>
        </div>
    )
}

export default MainPage
