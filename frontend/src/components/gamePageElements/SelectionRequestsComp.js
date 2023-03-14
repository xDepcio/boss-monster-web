import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SelectionCompOneFromList from './SelectionCompOneFromList'
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
            case 'CHOOSE_FROM_GIVEN_LIST':
                setDisplayedSelectionComp('oneFromList')
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
                {displayedSelectionComp === 'oneFromList' && <SelectionCompOneFromList />}
            </>
        )
    }
}

export default SelectionRequestsComp
