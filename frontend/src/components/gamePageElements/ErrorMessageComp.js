import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadErrorMessage } from '../../store/game'
import './ErrorMessageComp.css'


function ErrorMessageComp() {
    const errorMessage = useSelector(state => state.game.userError)
    const dispatch = useDispatch()

    const [showErrorMessage, setShowErrorMessage] = useState(false)

    useEffect(() => {
        console.log('showErrorMessage', showErrorMessage)
        if (errorMessage) {
            setShowErrorMessage(true)
            setTimeout(() => {
                animateHideErrorMessage()
            }, 5000)
        }
    }, [errorMessage])

    useEffect(() => {
        if (showErrorMessage) {
            animateShowErrorMessage()
        }
    }, [showErrorMessage])

    function animateShowErrorMessage() {
        const errorPopup = document.getElementById('error-popup')
        const bringError = errorPopup.animate([
            {
                opacity: 0,
                transform: 'translateY(-100%) translateX(-50%)'
            },
            {
                opacity: 1,
                transform: 'translateY(0) translateX(-50%)'
            }
        ], 300)
        // bringError.onfinish = () => console.log('konczone')
    }

    function animateHideErrorMessage() {
        const errorPopup = document.getElementById('error-popup')
        const hideError = errorPopup.animate([
            {
                opacity: 1
            },
            {
                opacity: 0
            }
        ], 300)
        hideError.onfinish = () => {
            // console.log('koniec')
            setShowErrorMessage(false)
            dispatch(loadErrorMessage(''))
        }
    }

    if (!errorMessage) {
        return <></>
    }

    return (
        <>
            {showErrorMessage && (
                <div id='error-popup' className='user-error-message-wrapper'>
                    <p className='user-error-msg'>{errorMessage}</p>
                </div>
            )}
        </>
    )
}

export default ErrorMessageComp
