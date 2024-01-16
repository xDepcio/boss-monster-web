import { parse, stringify } from "flatted"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { HiSwitchVertical } from 'react-icons/hi'
import { ImExit } from 'react-icons/im'
import { BACKEND_URL } from "../../static/constants"


export default function DevMenu() {
    const [toInjectMovesStr, setToInjectMovesStr] = useState('')
    const [currentMovesStr, setCurrentMovesStr] = useState('')
    const currentMoves = useSelector(state => state.game?.game?.inputsTracker?.inputs)
    const params = useParams()
    const [opened, setOpened] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (currentMoves) {
            setCurrentMovesStr(JSON.stringify(currentMoves, undefined, 4))
        }
    }, [currentMoves])

    const handleStartWithInjectedMoves = async () => {
        // console.log(toInjectMovesStr)
        // console.log(JSON.parse(toInjectMovesStr))
        const res = await fetch(BACKEND_URL + `/lobby/${params.lobbyId}/start-prefab-with-injected-moves`, {
            method: 'POST',
            body: toInjectMovesStr,
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const data = await res.json()
        console.log(data)
    }

    const copyFromCurrentToNew = () => {
        setToInjectMovesStr(currentMovesStr)
    }

    const handleExitToMenu = () => {
        navigate('/')
    }

    return (
        <div data-opened={String(opened)} className="bg-zinc-600/75 h-full text-zinc-950 p-4 pl-8 data-[opened=false]:-translate-x-[100%] duration-[0.3s] fixed left-0 top-0 z-10">
            <div onClick={() => setOpened(!opened)} className="cursor-pointer absolute flex flex-col bg-blue-900 w-fit right-[-35px] p-3 rounded-r-lg">
                <p>D</p>
                <p>E</p>
                <p>V</p>
            </div>
            <div>
                <button
                    onClick={handleExitToMenu}
                    className="flex items-center bg-red-900 mb-4 cursor-pointer hover:bg-red-800/80 transition-all text-zinc-300 gap-2 py-2 px-6 border-none rounded-md"
                >
                    <ImExit className="text-[1.5rem]" />
                    <p className="text-sm font-semibold">Exit</p>
                </button>
                <p className="text-lg font-medium text-center text-zinc-300 mb-2 border-solid border-t-[1px] border-b-0 border-r-0 border-l-0 pt-1 border-t-zinc-500">Moves injector</p>
                <p className="bg-zinc-500 p-2 rounded-t-lg font-medium">New Game inputs</p>
                <textarea
                    className="min-w-[467px] min-h-[400px] bg-zinc-600 border-solid border-zinc-500 p-1"
                    value={toInjectMovesStr}
                    onChange={(e) => setToInjectMovesStr(e.target.value)}
                />
                <div className="flex items-center justify-center gap-2 my-2">
                    <HiSwitchVertical onClick={copyFromCurrentToNew} className="border-solid border-yellow-600 hover:bg-yellow-700 hover:border-yellow-700 transition-all cursor-pointer border-[1px] p-2 rounded-lg text-[1.5rem] text-zinc-200" />
                    <button
                        onClick={handleStartWithInjectedMoves}
                        className="text-sm border-[1px] rounded-md hover:bg-yellow-700 hover:border-yellow-700 transition-all cursor-pointer font-semibold px-6 py-[0.7rem] text-zinc-200 bg-yellow-600/0 border-yellow-600 border-solid"
                    >inject
                    </button>
                </div>

                <p className="bg-zinc-500 p-2 rounded-t-lg font-medium">Current game inputs</p>
                <textarea
                    className="min-w-[467px] min-h-[200px] bg-zinc-600 border-solid border-zinc-500 p-1"
                    value={currentMovesStr}
                    onChange={(e) => setCurrentMovesStr(e.target.value)}
                />
            </div>
        </div>
    )
}
