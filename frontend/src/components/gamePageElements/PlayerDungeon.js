import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Cookies from 'js-cookie'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { saveResponseError } from '../utils'
import CardBack from './CardBack'
import CardBoss from './CardBoss'
import CardDungeon from './CardDungeon'
import CardHero from './CardHero'
import EmptyDungeon from './EmptyDungeon'
import HeroToMoveMarker from './HeroToMoveMarker'
import './PlayerDungeon.css'


function PlayerDungeon({ player, selectedDungCard, setSelectedDungCard }) {
    const selfPlayer = useSelector(state => state.game.selfPlayer)
    const params = useParams()
    const heroToMove = useSelector(state => state.game.game.heroToMove)
    const dispatch = useDispatch()

    const [clickedCardId, setClickedCardId] = useState(null)

    function handleBuildNewDungeon(index = null) {
        console.log(index)
        if (player.id === selfPlayer.id && selectedDungCard) {
            selectedDungCard.htmlElement.classList.remove('card-selected')
            setSelectedDungCard(null)
            const res = fetch(`/game/${params.lobbyId}/build-dungeon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: Cookies.get('user'),
                    dungeonId: selectedDungCard.id,
                    buildIndex: index
                })
            })
            saveResponseError(res, dispatch)
        }
    }

    function handleDestroyDungeon(dungeonId) {
        const res = fetch(`/game/${params.lobbyId}/destroy-dungeon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                dungeonId
            })
        })
        saveResponseError(res, dispatch)
    }

    function handleBecomeReady() {
        const res = fetch(`/game/${params.lobbyId}/become-ready`, {
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

    function handleAcceptHeroMove() {
        const res = fetch(`/game/${params.lobbyId}/accept-hero-move`, {
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
        <div className="single-player-dungeon">
            <div className='heroes-section'>
                {[...player.dungeonEntranceHeroes].reverse().map((hero, i) => <CardHero
                    card={hero}
                    id={hero.id}
                    baseHealth={hero.baseHealth}
                    health={hero.health}
                    name={hero.name}
                    treasure={hero.treasureSign}
                    width={220}
                    key={i}
                    _className={'player-hero'}
                />)}
            </div>
            <div className='dungeon-section'>
                <div className='player-dungeons-wrapper'>
                    {player.dungeon.map((dungeon, i) => {
                        return (
                            <div key={i} className='single-player-dungeon-wrapper'>
                                {(clickedCardId === dungeon.id && player.id === selfPlayer.id) && (
                                    <div className='clicked-dung-wrapper'>
                                        {dungeon.allowDestroy && (
                                            <button onClick={() => handleDestroyDungeon(dungeon.id)} className='destroy-dung-btn'>
                                                <FontAwesomeIcon icon={faTrashCan} />
                                                <p>Zniszcz loch</p>
                                            </button>
                                        )}
                                    </div>
                                )}
                                {player.declaredBuild?.belowDungeon?.id === dungeon.id ?
                                    <CardBack width={220} text={'TALIA KOMNAT'} /> :
                                    <CardDungeon
                                        _onClick={() => {
                                            handleBuildNewDungeon(i)
                                            if (clickedCardId === dungeon.id) {
                                                setClickedCardId(null)
                                            }
                                            else {
                                                setClickedCardId(dungeon.id)
                                            }
                                        }}
                                        damage={dungeon.damage} width={220}
                                        treasure={dungeon.treasure}
                                        type={dungeon.type}
                                        name={dungeon.name}
                                        id={dungeon.id}
                                        description={dungeon.description}
                                        isFancy={dungeon.isFancy}
                                        _className={'built-dung'}
                                        card={dungeon}
                                    />
                                }
                            </div>
                        )
                    })}
                    {new Array(5 - player.dungeon.length).fill(null).map((e, i) => {
                        return (player.declaredBuild && i === 0 && !player.declaredBuild?.belowDungeon) ? <CardBack key={i} text={'TALIA KOMNAT'} width={220} /> : <EmptyDungeon _className={'empty-dungeon'} key={i} _onClick={() => handleBuildNewDungeon()} width={220} />
                    })}
                </div>
                <div className='player-boss-wrapper'>
                    <CardBoss
                        card={player.selectedBoss}
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
                {selfPlayer.id === player.id && <p>Ty</p>}

                {(selfPlayer.id === player.id && !heroToMove) ? (
                    <button onClick={handleBecomeReady} className='player-ready-button' disabled={selfPlayer.finishedPhase}>
                        <p>{selfPlayer.finishedPhase ? 'Jesteś gotowy' : 'Bądź gotów'}</p>
                    </button>
                ) : player.finishedPhase ? (
                    <button className='player-ready-button' disabled={true}>
                        <p>Gotowy</p>
                    </button>
                ) : !heroToMove && (
                    <button className='player-ready-button btn-red' disabled={true}>
                        <p>Nie gotowy</p>
                    </button>
                )}

                {(selfPlayer.id === player.id && heroToMove) ? (
                    <button onClick={handleAcceptHeroMove} className='player-ready-button' disabled={selfPlayer.acceptedHeroMove}>
                        <p>{selfPlayer.acceptedHeroMove ? 'Zakceptowałeś' : 'Akceptuj ruch'}</p>
                    </button>
                ) : player.acceptedHeroMove ? (
                    <button className='player-ready-button' disabled={true}>
                        <p>Zaakceptował</p>
                    </button>
                ) : heroToMove && (
                    <button className='btn-red player-ready-button btn-red' disabled={true}>
                        <p>Nie akceptował</p>
                    </button>
                )}
            </div>
        </div>
    )
}

export default PlayerDungeon
