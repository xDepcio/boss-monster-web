import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { symbolImage } from '../../static/constants'
import { saveResponseError } from '../utils'
import './SelectionCompOneFromList.css'
import { BACKEND_URL } from "../../static/constants"


function SelectionCompOneFromList() {
    const avalibleItemsForSelectArr = useSelector(state => state.game?.selfPlayer?.requestedSelection?.avalibleItemsForSelectArr)
    const selectionMessage = useSelector(state => state.game?.selfPlayer?.requestedSelection?.selectionMessage)
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
        <div className='treasure-selection-wrapper'>
            <h3 className='treasure-selection-header'>{selectionMessage}</h3>
            <div className='treasure-sumbol-holder'>
                {avalibleItemsForSelectArr?.map((item, i) => (
                    <div onClick={() => handleSelectItem(item)} className='single-item-holder' key={i}>
                        <p className='single-item-value'>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SelectionCompOneFromList
