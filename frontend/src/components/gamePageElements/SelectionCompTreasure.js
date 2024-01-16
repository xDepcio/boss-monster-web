import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { symbolImage } from '../../static/constants'
import { saveResponseError } from '../utils'
import './SelectionCompTreasure.css'
import { BACKEND_URL } from '../../App'


function SelectionCompTreasure() {
    const requestedSelection = useSelector(state => state.game?.selfPlayer?.requestedSelection)
    const dispatch = useDispatch()
    const params = useParams()

    function handleSelectTreasureSymbol(treasureSymbol) {
        const res = fetch(BACKEND_URL + `/game/${params.lobbyId}/select-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                treasureSymbol: treasureSymbol
            })
        })
        saveResponseError(res, dispatch)
    }

    return (
        <div className='treasure-selection-wrapper'>
            <h3 className='treasure-selection-header'>Wybierz symbol skarbu</h3>
            <div className='treasure-sumbol-holder'>
                <div onClick={() => handleSelectTreasureSymbol('fortune')} className='single-treasure'>
                    <p className='single-treasure-name'>Fortune</p>
                    <div className='treausre-img-holder'>
                        <img src={symbolImage['fortune']} />
                    </div>
                </div>
                <div onClick={() => handleSelectTreasureSymbol('magic')} className='single-treasure'>
                    <p className='single-treasure-name'>Magic</p>
                    <div className='treausre-img-holder'>
                        <img src={symbolImage['magic']} />
                    </div>
                </div>
                <div onClick={() => handleSelectTreasureSymbol('faith')} className='single-treasure'>
                    <p className='single-treasure-name'>Faith</p>
                    <div className='treausre-img-holder'>
                        <img src={symbolImage['faith']} />
                    </div>
                </div>
                <div onClick={() => handleSelectTreasureSymbol('strength')} className='single-treasure'>
                    <p className='single-treasure-name'>Strength</p>
                    <div className='treausre-img-holder'>
                        <img src={symbolImage['strength']} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SelectionCompTreasure
