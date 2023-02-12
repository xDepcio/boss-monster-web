import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from 'react-router-dom'
import { getGameInfo } from '../store/game'

function GamePage() {
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

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
        <></>
    )

}

export default GamePage
