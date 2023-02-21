import Cookies from 'js-cookie'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import CardBack from './CardBack'
import CardBoss from './CardBoss'
import CardDungeon from './CardDungeon'
import CardHero from './CardHero'
import EmptyDungeon from './EmptyDungeon'
import './PlayerDungeon.css'


function PlayerDungeon({ player, selectedDungCard, setSelectedDungCard }) {
    const selfPlayer = useSelector(state => state.game.selfPlayer)
    const params = useParams()

    function handleBuildNewDungeon() {
        console.log('dddddd')
        console.log(player.id)
        console.log(selfPlayer.id)
        console.log(selectedDungCard)
        if (player.id === selfPlayer.id && selectedDungCard) {
            selectedDungCard.htmlElement.classList.remove('card-selected')
            setSelectedDungCard(null)
            fetch(`/game/${params.lobbyId}/build-dungeon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: Cookies.get('user'),
                    dungeonId: selectedDungCard.id,
                    buildIndex: null
                })
            })
        }
    }

    function handleBecomeReady() {
        fetch(`/game/${params.lobbyId}/become-ready`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
            })
        })
    }

    return (
        <div className="single-player-dungeon">
            <div className='heroes-section'>
                {[...player.dungeonEntranceHeroes].reverse().map((hero, i) => <CardHero
                    id={hero.id}
                    baseHealth={hero.baseHealth}
                    health={hero.health}
                    name={hero.name}
                    treasure={hero.treasureSign}
                    width={220}
                    _className={'player-hero'}
                />)}
            </div>
            <div className='dungeon-section'>
                <div className='player-dungeons-wrapper'>
                    {player.dungeon.map((dungeon, i) => <CardDungeon damage={dungeon.damage} width={220} treasure={dungeon.treasure} type={dungeon.type} name={dungeon.name} key={i} />)}
                    {new Array(5 - player.dungeon.length).fill(null).map((e, i) => {
                        return player.declaredBuild && i === 0 ? <CardBack key={i} text={'TALIA KOMNAT'} width={220} /> : <EmptyDungeon _className={'empty-dungeon'} key={i} _onClick={() => handleBuildNewDungeon()} width={220} />
                    })}
                </div>
                <div className='player-boss-wrapper'>
                    <CardBoss
                        treasure={player.selectedBoss?.treasure}
                        width={220}
                        pd={player.selectedBoss?.pd}
                        name={player.selectedBoss?.name}
                    />
                </div>
            </div>
            <div className='info-section'>
                <p>Gracz: {player.name || 'olek'}</p>
                <p>Gold: {player.money}</p>
                <p>Zebrane dusze: {player.totalScore}</p>
                <p>Życie: {player.health}</p>
                {selfPlayer.id === player.id ? (
                    <>
                        <p>Ty</p>
                        <button onClick={handleBecomeReady} className='player-ready-button' disabled={selfPlayer.finishedPhase}>
                            <p>{selfPlayer.finishedPhase ? 'Jesteś gotowy' : 'Bądź gotów'}</p>
                        </button>
                    </>
                ) : player.finishedPhase && (
                    <button className='player-ready-button' disabled={true}>
                        <p>Gotowy</p>
                    </button>
                )}
            </div>
        </div>
    )
}

export default PlayerDungeon
