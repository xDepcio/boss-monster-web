import { faCheck, faCon } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Cookies from 'js-cookie'
import { useDrag } from 'react-dnd'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { saveResponseError } from '../utils'
import './AcceptSpellComp.css'
import CardSpell from './CardSpell'
import { BACKEND_URL } from '../../App'


function AcceptSpellComp() {
    const spellAtPlay = useSelector(state => state.game.game.currentlyPlayedSpell)
    const selfPlayer = useSelector(state => state.game.selfPlayer)

    const dispatch = useDispatch()
    const params = useParams()

    function handleAcceptSpell() {
        const res = fetch(BACKEND_URL + `/game/${params.lobbyId}/accept-spell-play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
            })
        })
        saveResponseError(res, dispatch)
    }

    return (
        <div className='accept-spell-popup-wrapper'>
            <h3 className='accept-spell-header'>Gracz {spellAtPlay.owner.name} chce użyć</h3>
            <CardSpell _className={'accept-spell-card'} width={300} phase={spellAtPlay.playablePhase} description={spellAtPlay.description} name={spellAtPlay.name} />
            <div className='accept-spell-btns-wrapper'>
                {!selfPlayer.acceptedSpellPlay ? (
                    <button onClick={handleAcceptSpell} className='accept-spell-btn'>
                        <FontAwesomeIcon icon={faCheck} />
                        <p>Zaakceptuj</p>
                    </button>
                ) : (
                    <button className='accept-spell-btn' disabled={true} >
                        <FontAwesomeIcon icon={faCheck} />
                        <p>Akceptowałeś</p>
                    </button>
                )}
            </div>
        </div>
    )
}

export default AcceptSpellComp
