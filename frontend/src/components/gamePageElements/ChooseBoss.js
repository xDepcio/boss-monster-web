import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { saveResponseError } from '../utils'
import CardBoss from './CardBoss'
import './ChooseBoss.css'
import { BACKEND_URL } from "../../static/constants"


function ChooseBoss() {
    const params = useParams()
    const selfPlayer = useSelector(state => state.game.selfPlayer)
    const dispatch = useDispatch()

    function handleBossSelect(boss) {
        const res = fetch(BACKEND_URL + `/game/${params.lobbyId}/choose-boss`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                bossId: boss.id
            })
        })
        saveResponseError(res, dispatch)
    }

    return (
        <div className='choose-boss-wrapper'>
            <h3 className='choose-boss-header'>WYBIERZ BOSSA:</h3>
            <div className='choose-boss-holder'>
                {selfPlayer?.drawnBosses.map((boss, i) => <CardBoss
                    key={i}
                    _onClick={() => handleBossSelect(boss)}
                    _className={'choose-boss'}
                    treasure={boss.treasure}
                    name={boss.name}
                    pd={boss.pd}
                    width={300}
                    description={boss?.mechanic?.mechanicDescription}
                />)}
            </div>
        </div>
    )
}

export default ChooseBoss
