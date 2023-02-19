import Cookies from 'js-cookie'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import CardBoss from './CardBoss'
import './ChooseBoss.css'


function ChooseBoss() {
    const params = useParams()
    const selfPlayer = useSelector(state => state.game.selfPlayer)

    function handleBossSelect(boss) {
        fetch(`/game/${params.lobbyId}/choose-boss`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                bossId: boss.id
            })
        })
    }

    return (
        <div className='choose-boss-wrapper'>
            <h3 className='choose-boss-header'>WYBIERZ BOSSA:</h3>
            <div className='choose-boss-holder'>
                {selfPlayer?.drawnBosses.map((boss, i) => <CardBoss _onClick={() => handleBossSelect(boss)} _className={'choose-boss'} treasure={boss.treasure} name={boss.name} pd={boss.pd} width={300} />)}
            </div>
        </div>
    )
}

export default ChooseBoss
