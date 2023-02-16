import { useSelector } from 'react-redux'
import './PlayerCards.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faCartShopping, faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import CardDungeon from './CardDungeon'
import CardSpell from './CardSpell'


function PlayerCards() {
    const selfPlayer = useSelector(state => state.game.selfPlayer)

    const [showCards, setShowCards] = useState(false)
    const [cardsShowIcon, setCardsShowIcon] = useState(faCaretLeft)


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


    return (
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
                    width={200}
                    type={dungeon.type}
                    name={dungeon.name}
                    treasure={dungeon.treasure}
                    damage={dungeon.damage}
                    _className={'player-card-in-inv'}
                    isFancy={dungeon.isFancy}
                    key={i}
                />)}
                {selfPlayer?.spellCards.map((spell, i) => <CardSpell
                    width={200}
                    name={spell.name}
                    key={i}
                    phase={spell.playablePhase}
                    _className={'player-card-in-inv'}
                />)}
            </div>
        </div>
    )
}

export default PlayerCards
