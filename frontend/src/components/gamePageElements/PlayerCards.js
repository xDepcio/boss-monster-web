import { useDispatch, useSelector } from 'react-redux'
import './PlayerCards.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faCartShopping, faClose, faGamepad, faPlay } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import CardDungeon from './CardDungeon'
import CardSpell from './CardSpell'
import { useParams } from 'react-router-dom'
import Cookies from 'js-cookie'
import { saveResponseError } from '../utils'


function PlayerCards({ setSelectedDungCard, selectedDungCard }) {
    const selfPlayer = useSelector(state => state.game.selfPlayer)
    const params = useParams()
    const dispatch = useDispatch()

    const [showCards, setShowCards] = useState(false)
    const [cardsShowIcon, setCardsShowIcon] = useState(faCaretLeft)
    const [selectedSpellCard, setSelectedSpellCard] = useState()


    function handleToggleShowCards() {
        const cityEle = document.getElementById('player-cards')
        if (!showCards) {
            setCardsShowIcon(faCaretRight)
            cityEle.classList.add('player-cards-expanded')
        }
        else {
            setCardsShowIcon(faCaretLeft)
            cityEle.classList.remove('player-cards-expanded')
        }

        setShowCards(!showCards)
    }

    function handleSelectDungeonToPlay(dungeon, event) {
        if (selectedDungCard) {
            selectedDungCard.htmlElement.classList.remove('card-selected')
        }
        handleToggleShowCards()
        const element = event.currentTarget
        dungeon.htmlElement = element
        // setSelectedCard(dungeon)
        setSelectedDungCard(dungeon)

        element.classList.add('card-selected')
    }

    function handleSelectSpellToPlay(spell, event) {
        if (selectedSpellCard) {
            selectedSpellCard.htmlElement.classList.remove('card-selected')
        }
        handleToggleShowCards()
        const element = event.currentTarget
        spell.htmlElement = element
        setSelectedSpellCard(spell)

        element.classList.add('card-selected')
    }

    function handleCancelSelectedCard() {
        selectedDungCard?.htmlElement.classList.remove('card-selected')
        selectedSpellCard?.htmlElement.classList.remove('card-selected')
        setSelectedDungCard(null)
        setSelectedSpellCard(null)
    }

    function handlePlaySpellCard() {
        const res = fetch(`/game/${params.lobbyId}/play-spell`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                spellId: selectedSpellCard.id
            })
        })
        handleCancelSelectedCard()
        saveResponseError(res, dispatch)
    }

    useEffect(() => {
        if (selectedDungCard === null) {
            handleCancelSelectedCard()
        }
    }, [selectedDungCard])
    console.log(selectedDungCard)

    return (
        <>
            {selectedDungCard && (
                <button onClick={handleCancelSelectedCard} className='play-card-cancel'>
                    <FontAwesomeIcon icon={faClose} />
                    <p>Anuluj</p>
                </button>
            )}
            {selectedSpellCard && (
                <>
                    <button onClick={handleCancelSelectedCard} className='play-card-cancel play-card-btn-in-spell'>
                        <FontAwesomeIcon icon={faClose} />
                        <p>Anuluj</p>
                    </button>
                    <button onClick={handlePlaySpellCard} className='play-card-play'>
                        <FontAwesomeIcon icon={faGamepad} />
                        <p>Zagraj</p>
                    </button>
                </>
            )}
            <div id='player-cards' className="player-cards-wrapper">
                <button onClick={handleToggleShowCards} className='player-cards-expand-btn'>
                    <FontAwesomeIcon icon={cardsShowIcon} />
                    <p>T</p>
                    <p>w</p>
                    <p>o</p>
                    <p>j</p>
                    <p>e</p>
                    <br />
                    <p>k</p>
                    <p>a</p>
                    <p>r</p>
                    <p>t</p>
                    <p>y</p>
                </button>
                <div className='player-cards-main'>
                    {selfPlayer?.dungeonCards.map((dungeon, i) => <CardDungeon
                        _onClick={(e) => handleSelectDungeonToPlay(dungeon, e)}
                        width={200}
                        type={dungeon.type}
                        name={dungeon.name}
                        description={dungeon.description}
                        treasure={dungeon.treasure}
                        damage={dungeon.damage}
                        _className={'player-card-in-inv'}
                        isFancy={dungeon.isFancy}
                        key={i}
                        id={dungeon.id}
                        card={dungeon}
                        baseDamage={dungeon.baseDamage}
                    />)}
                    {selfPlayer?.spellCards.map((spell, i) => <CardSpell
                        _onClick={(e) => handleSelectSpellToPlay(spell, e)}
                        width={200}
                        name={spell.name}
                        description={spell.description}
                        key={i}
                        phase={spell.playablePhase}
                        _className={'player-card-in-inv'}
                        card={spell}
                    />)}
                </div>
            </div>
        </>
    )
}

export default PlayerCards
