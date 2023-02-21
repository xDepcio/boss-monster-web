import { useSelector } from 'react-redux'
import './Chat.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { } from '@fortawesome/fontawesome-svg-core'
import { faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faCartShopping, faClose } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

function Chat() {
    const gameMessages = useSelector(state => state.game.game?.movesHistory)
    const [showChat, setShowChat] = useState(false)
    const [chatBtnText, setChatBtnText] = useState("Ukryj czat")
    const [chatBtnIcon, setChatBtnIcon] = useState(faCaretLeft)

    function handleToggleChat() {
        if (showChat) {
            document.getElementById('chat').classList.remove('expand-chat')
            setChatBtnText("Ukryj czat")
            setChatBtnIcon(faCaretLeft)
        }
        else {
            document.getElementById('chat').classList.add('expand-chat')
            setChatBtnText("Pokaż czat")
            setChatBtnIcon(faCaretRight)
        }
        setShowChat(!showChat)
    }

    return (
        <div id='chat' className='chat-wrapper'>
            <div className='chat-header'>
                <button onClick={handleToggleChat} className='close-chat-btn'>
                    <FontAwesomeIcon icon={chatBtnIcon} />
                    <p>C</p>
                    <p>z</p>
                    <p>a</p>
                    <p>t</p>
                </button>
            </div>
            <div className='chat'>
                {gameMessages?.map((msg, i) => {
                    return (
                        <div key={i} className='single-message'>
                            <p>{msg.message}</p>
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default Chat
