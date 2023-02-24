import './HeroToMoveMarker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'


function HeroToMoveMarker() {
    return (
        <div className="hero-to-move-marker-wrapper">
            {/* <FontAwesomeIcon icon={faClose} /> */}
            <img className='hero-marker-img' src='/images/hero/hero_marker_color.png' />
        </div>
    )
}

export default HeroToMoveMarker
