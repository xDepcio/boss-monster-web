import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { symbolImage } from '../../static/constants'
import { saveResponseError } from '../utils'
import './SelectionCompPlayers.css'
import { BACKEND_URL } from '../../App'


function SelectionCompPlayers() {
    const dispatch = useDispatch()
    const params = useParams()
    const players = useSelector(state => state.game.players)

    function handleSelectPlayer(playerId) {
        const res = fetch(BACKEND_URL + `/game/${params.lobbyId}/select-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                itemId: playerId
            })
        })
        saveResponseError(res, dispatch)
    }

    return (
        <div className='treasure-selection-wrapper'>
            <h3 className='treasure-selection-header'>Wybierz gracza</h3>
            <div className='treasure-sumbol-holder'>
                {players.map((player, i) => (
                    <div key={i} onClick={() => handleSelectPlayer(player.id)} className='player-selection-single-player'>
                        <p className='single-treasure-name'>{player.name}</p>
                        <FontAwesomeIcon className='player-selection-single-player-icon' icon={faUser} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SelectionCompPlayers
