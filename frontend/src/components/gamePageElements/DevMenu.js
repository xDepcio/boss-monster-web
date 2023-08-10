import { parse, stringify } from "flatted"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"

export default function DevMenu() {
    const [toInjectMovesStr, setToInjectMovesStr] = useState('')
    const [currentMovesStr, setCurrentMovesStr] = useState('')
    const currentMoves = useSelector(state => state.game?.game?.inputsTracker?.inputs)
    const params = useParams()

    useEffect(() => {
        if (currentMoves) {
            setCurrentMovesStr(JSON.stringify(currentMoves, undefined, 4))
        }
    }, [currentMoves])

    const handleStartWithInjectedMoves = async () => {
        // console.log(toInjectMovesStr)
        // console.log(JSON.parse(toInjectMovesStr))
        const res = await fetch(`/lobby/${params.lobbyId}/start-prefab-with-injected-moves`, {
            method: 'POST',
            body: toInjectMovesStr,
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const data = await res.json()
        console.log(data)
    }

    return (
        <div className="fixed left-0 top-0 z-10">
            <textarea
                value={toInjectMovesStr}
                onChange={(e) => setToInjectMovesStr(e.target.value)}
            />
            <button onClick={handleStartWithInjectedMoves} >inject</button>

            <p>Game inputs:</p>
            <textarea
                value={currentMovesStr}
                onChange={(e) => setCurrentMovesStr(e.target.value)}
            />
        </div>
    )
}
