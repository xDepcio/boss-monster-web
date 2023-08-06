import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { saveResponseError } from '../utils'
import './CardRequestedSelectionHandle.css'


function CardRequestedSelectionHandle({ card = null }) {
    const selectedItems = useSelector(state => state.game?.selfPlayer?.requestedSelection?.selectedItems)
    const requestedSelection = useSelector(state => state.game?.selfPlayer?.requestedSelection)
    const selfPlayer = useSelector(state => state.game.selfPlayer)
    const players = useSelector(state => state.game?.game?.players)
    const dispatch = useDispatch()

    const params = useParams()

    if (!card) {
        return (<></>)
    }

    if (selfPlayer?.requestedSelection?.requestItemType === "UNIVERSAL_SELECTION") {
        return <></>
    }

    function isSelectionValid(clickedCard) {
        return true
        if (requestedSelection.requestItemType.toLowerCase() !== clickedCard.CARDTYPE.toLowerCase()) {
            return false
        }
        if (requestedSelection.choiceScope !== "ANY") {
            switch (card?.CARDTYPE) {
                case 'HERO':
                    if (card.dungeonOwner?.id === requestedSelection.choiceScope.id) {
                        return true
                    }
                    break;
                case 'DUNGEON':
                    if (card.owner.id === requestedSelection.choiceScope.id) {
                        return true
                    }
                    break;
                case 'SPELL':
                    if (card.owner.id === requestedSelection.choiceScope.id) {
                        return true
                    }
                    break;
                default:
                    return false
                    break;
            }
            return false
        }
        return true
    }

    function isSelected(clickedCard) {
        for (const item of selectedItems) {
            if (item.id === clickedCard.id) {
                return true
            }
        }
        return false
    }

    function handleSelectableCardClick(event) {
        event.stopPropagation()
        if (isSelectionValid(card)) {
            const res = fetch(`/game/${params.lobbyId}/select-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: Cookies.get('user'),
                    itemId: card.id
                })
            })
            saveResponseError(res, dispatch)
        }
    }


    return (
        <div onClick={(e) => handleSelectableCardClick(e)} className={`player-item-selectable ${isSelected(card) ? 'card-item-selected' : ''} ${isSelectionValid(card) ? 'item-selection-valid' : 'item-selection-not-valid'}`}></div>
    )
}

export default CardRequestedSelectionHandle
