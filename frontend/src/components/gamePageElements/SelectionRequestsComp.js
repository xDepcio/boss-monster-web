import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SelectionCompPlayers from './SelectionCompPlayers'
import SelectionCompTreasure from './SelectionCompTreasure'
import './SelectionRequestsComp.css'


function SelectionRequestsComp() {
    const requestedSelectionType = useSelector(state => state.game?.selfPlayer?.requestedSelection?.requestItemType)
    const [displayedSelectionComp, setDisplayedSelectionComp] = useState(null)

    useEffect(() => {
        switch (requestedSelectionType) {
            case 'treasure':
                setDisplayedSelectionComp('treasure')
                break;
            case 'player':
                setDisplayedSelectionComp('player')
                break;
            default:
                setDisplayedSelectionComp(null)
                break;
        }
    }, [requestedSelectionType])

    if (!displayedSelectionComp) {
        return <></>
    }
    else {
        return (
            <>
                {displayedSelectionComp === 'treasure' && <SelectionCompTreasure />}
                {displayedSelectionComp === 'player' && <SelectionCompPlayers />}
            </>
        )
    }
}

export default SelectionRequestsComp
