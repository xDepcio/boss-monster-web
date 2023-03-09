import { faCaretLeft, faCaretRight, faExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AcceptSpellComp from './AcceptSpellComp'
import './CurrentActionsComp.css'

function CurrentActionsComp() {
    const [currentActionsShowIcon, setCurrentActionsShowIcon] = useState(faCaretLeft)
    const [showAcceptReminder, setShowAcceptReminder] = useState(false)
    const [showCurrentActions, setShowCurrentActions] = useState(false)
    const spellAtPlay = useSelector(state => state.game.game?.currentlyPlayedSpell)

    function handleToggleShowCurrentActions() {
        if (!showCurrentActions) {
            setCurrentActionsShowIcon(faCaretRight)
            document.getElementById('current-actions-wrapper').classList.add('current-actions-wrapper-expanded')
        }
        else {
            setCurrentActionsShowIcon(faCaretLeft)
            document.getElementById('current-actions-wrapper').classList.remove('current-actions-wrapper-expanded')
        }

        setShowCurrentActions(!showCurrentActions)
    }

    useEffect(() => {
        setShowAcceptReminder(false)
        if (spellAtPlay) {
            setShowAcceptReminder(true)
        }
    }, [spellAtPlay])

    return (
        <div id='current-actions-wrapper' className="current-actions-wrapper">
            <div onClick={handleToggleShowCurrentActions} className='current-actions-expand-btn'>
                {showAcceptReminder && <FontAwesomeIcon className='show-accept-reminder-icon' icon={faExclamation} />}
                <FontAwesomeIcon icon={currentActionsShowIcon} />
                <p>P</p>
                <p>o</p>
                <p>t</p>
                <p>w</p>
                <p>i</p>
                <p>e</p>
                <p>r</p>
                <p>d</p>
                <p>z</p>
                <p>i</p>
                <p>e</p>
                <p>n</p>
                <p>i</p>
                <p>a</p>
            </div>
            <div className='current-actions-content'>
                {spellAtPlay && <AcceptSpellComp />}
            </div>
        </div>
    )
}

export default CurrentActionsComp
