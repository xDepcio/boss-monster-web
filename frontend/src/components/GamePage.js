import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from 'react-router-dom'
import { getGameInfo } from '../store/game'
import './GamePage.css'
import Card from './gamePageElements/card'
import Cookies from 'js-cookie'
import Chat from './gamePageElements/Chat'
import City from './gamePageElements/City'
import PlayerCards from './gamePageElements/PlayerCards'

function GamePage() {
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const players = useSelector(state => state.game.players)
    const game = useSelector(state => state.game.game)
    const selfPlayer = useSelector(state => state.game.selfPlayer)

    const [showPlayerCards, setShowPlayerCards] = useState(false)
    const [selectedDungCard, setSelectedDungCard] = useState(false)

    useEffect(() => {
        const gameSyncInterval = setInterval(() => {
            dispatch(getGameInfo(params.lobbyId))
            console.log('t')
        }, 1500)

        return () => {
            clearInterval(gameSyncInterval)
        }
    })

    function handleBossSelect(boss) {
        console.log(params)
        console.log(boss.id)
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

    function handleShowPlayerCards() {
        setShowPlayerCards(true)
    }

    function handleSelectDungCard(card) {
        setSelectedDungCard(card)
        setShowPlayerCards(false)
    }

    function handlePlaceNewDungeon() {
        if (selectedDungCard) {
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

    return (
        <>
            {!!selectedDungCard && (
                <div className='dung-card-to-play-wrapper'>
                    <div className='play-dung-card'>
                        <Card
                            name={selectedDungCard.name}
                            width={350}
                        />
                    </div>
                    <div className='play-dung-header'>
                        <button className='play-dung-card-btn' onClick={() => setSelectedDungCard(null)}>Anuluj</button>
                    </div>
                </div>
            )}
            {showPlayerCards && (
                <div onClick={() => setShowPlayerCards(false)} className='player-cards-wrapper'>
                    <div onClick={(e) => e.stopPropagation()} className='player-cards'>
                        {selfPlayer?.dungeonCards.map((dungCard, i) => {
                            return (
                                <Card
                                    _onClick={() => handleSelectDungCard(dungCard)}
                                    name={dungCard.name}
                                    width={250}
                                />
                            )
                        })}
                        {selfPlayer?.spellCards.map((dungCard, i) => {
                            return (
                                <Card
                                    name={dungCard.name}
                                    width={250}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
            <City />
            <Chat />
            <PlayerCards />
            {game?.roundPhase === 'start' && (
                <div className='choose-boss-wrapper'>
                    <div className='choose-boss'>
                        {selfPlayer.drawnBosses.map((boss, i) => {
                            return (
                                <>
                                    <Card
                                        _onClick={() => handleBossSelect(boss)}
                                        key={i}
                                        width={280}
                                        name={boss.name}
                                        _className={'boss-choice'}
                                        treasure={boss.treasure}
                                    />
                                    {/* <div className='choose-boss-card card'>
                                        <h3 className='card-info'>{boss.name}</h3>
                                        <img className='card-info card-img card card-type' src={'/images/monsters_symbol.png'} />
                                        <img className='card-info card-img card card-bg' src={'/images/red_bg_canvas.png'} />
                                        {new Array(4).fill(null).map((ele, i) => {
                                            return (
                                                <img style={{
                                                    transform: `translateX(-${50 * i}%)`
                                                }}
                                                    className='card-info card-img card-symbol' src={'/images/strength_sword_cut.png'} />
                                            )
                                        })}
                                    </div> */}
                                </>
                            )
                        })}
                    </div>
                </div>
            )}
            <div className='game-page-wrapper'>
                <div className='players-wrapper'>
                    {players?.map((player, i) => {
                        return (
                            <div className='single-player-wrapper' key={i}>
                                <h3>{player.id === selfPlayer.id ? 'Ty' : player.id}</h3>
                                <div className='dungeon-wrapper'>
                                    <div className='lured-heroes-wrapper'>
                                        {new Array(3).fill(null).map((hero, i) => {
                                            return (
                                                <div key={i} className='lured-hero-card'>
                                                    <Card
                                                        width={'100%'}
                                                        fontHelp={'15px'}
                                                        _className={'card-hover'}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className='dungeons-holder'>
                                        {new Array(5 - player.dungeon.length).fill(null).map((ele, i) => {
                                            return (
                                                <div onClick={handlePlaceNewDungeon} className='dungeon dungeon-empty' key={i}>
                                                    <h4 className='dung-name'>Puste miejsce na loch</h4>
                                                </div>
                                            )
                                        })}
                                        {player.dungeon.map((ele, i) => {
                                            <Card
                                                _className={'card-hover'}
                                                width={140}
                                                name={player.selectedBoss.name}
                                                treasure={player.selectedBoss.treasure}
                                            />
                                            // <div key={i} className='dungeon'>
                                            //     <h4 className='dung-name'>{ele.name}</h4>
                                            // </div>
                                        })}
                                    </div>
                                    <div className='boss-holder'>
                                        {!!player.selectedBoss && (
                                            <Card
                                                _className={'card-hover'}
                                                width={140}
                                                name={player.selectedBoss.name}
                                                treasure={player.selectedBoss.treasure}
                                            />
                                            // <div className='boss-holder'>
                                            //     <h3>{player.selectedBoss.name}</h3>
                                            // </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* <div className='game-info-wrapper'>
                    <div className='game-header'>
                        <h2>Runda: {game?.gameRound}</h2>
                        <h3>Faza: {game?.roundPhase}</h3>
                    </div>
                    <div className='game-content'>
                        <div className='city-wrapper'>
                            <button onClick={handleShowPlayerCards} className='player-cards-btn'>Twoje karty</button>
                            <h3 className='city-header'>Miasto</h3>
                            <div className='game-city'>
                                {game?.city.map((hero, i) => {
                                    return (
                                        <Card
                                            _className={'card-hover'}
                                            width={160}
                                            name={hero.name}
                                            treasure={hero.treasure}
                                        />
                                        // <div key={i} className='city-hero-wrapper'>
                                        //     {hero.name}
                                        // </div>
                                    )
                                })}
                            </div>

                        </div>
                        <div className='game-cards'>
                            <div className='cards-stack hero-cards'>
                                <p>
                                    {game?.notUsedHeroCardsStack.length}
                                </p>
                            </div>
                            <div className='cards-stack spell-cards'>
                                {game?.notUsedSpellCardsStack.length}
                            </div>
                            <div className='cards-stack dungeon-cards'>
                                {game?.notUsedDungeonCardsStack.length}
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </>
    )

}

export default GamePage
