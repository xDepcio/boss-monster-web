import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { symbolImage } from '../../static/constants'
import { saveResponseError } from '../utils'
import './SelectionCompOneFromList.css'
import { BACKEND_URL } from '../../App'


function SelectionCompMessage() {
    const selectionMessage = useSelector(state => state.game?.selfPlayer?.requestedSelection?.message)
    const dispatch = useDispatch()
    const params = useParams()

    function handleSelectItem(item) {
        const res = fetch(BACKEND_URL + `/game/${params.lobbyId}/select-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                selectedItem: item
            })
        })
        saveResponseError(res, dispatch)
    }

    return (
        <>
            {selectionMessage ? <div className='selection-message'>{selectionMessage}</div> : <></>}
        </>
    )
}

export default SelectionCompMessage
