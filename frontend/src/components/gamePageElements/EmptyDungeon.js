import { BACKEND_URL } from "../../static/constants"
import './EmptyDungeon.css'


function EmptyDungeon({ width, _className, _onClick, fontHelp }) {
    return (
        <div onClick={_onClick} style={{ width: typeof width === 'string' ? width : width + 'px', fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px` }} className={`main-card-wrapper card-comp empty-card ${_className}`}>
            <p className='card-info-comp card-comp empty-card-desc'>Puste miejsce na dungeon</p>
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={`${BACKEND_URL}/images/cards_bgs/empty_dungeon.png`} />
        </div>
    )
}

export default EmptyDungeon
