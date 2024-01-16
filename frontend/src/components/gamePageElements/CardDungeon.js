import { useEffect, useMemo, useState } from 'react'
import './Card.css'
import './CardDungeon.css'
import { symbolImage } from '../../static/constants'
import { getBgColor, getDungDescEm, getFontEm } from '../utils'
import { useSelector } from 'react-redux'
import HeroToMoveMarker from './HeroToMoveMarker'
import CardRequestedSelectionHandle from './CardRequestedSelectionHandle'
import { BACKEND_URL } from "../../static/constants"


function CardDungeon({ width, _className, bgImage, isFancy = false, description = '', mainImg, damage = 'X', type, treasure, name = '', _onClick, fontHelp, id, card, baseDamage = 'X' }) {
    const [cardTreasureArr, setCardTreasureArr] = useState([])
    const [subHeader, setSubHeader] = useState('')
    const [typeUrl, setTypeUrl] = useState('')
    const bgUrl = useMemo(() => getBgColor(treasure), [treasure])
    const heroToMove = useSelector(state => state.game?.game.heroToMove)
    const selfPlayer = useSelector(state => state.game?.selfPlayer)
    const [enhance, setEnhance] = useState(false)

    useEffect(() => {
        switch (type) {
            case 'traps': {
                if (isFancy) {
                    setSubHeader('Wypaśna komnata pułapek')
                    setTypeUrl(`${BACKEND_URL}/images/dungeon_types/traps_type_enchanced.png`)
                }
                else {
                    setSubHeader('Komnata pułapek')
                    setTypeUrl(`${BACKEND_URL}/images/dungeon_types/traps_type.png`)
                }
                break
            }
            case 'monsters': {
                if (isFancy) {
                    setSubHeader('Wypaśna komnata potworów')
                    setTypeUrl(`${BACKEND_URL}/images/dungeon_types/monsters_type_enchanced.png`)
                }
                else {
                    setSubHeader('Komnata potworów')
                    setTypeUrl(`${BACKEND_URL}/images/dungeon_types/monsters_type.png`)
                }
                break
            }
            default: {
                break
            }
        }
    }, [type])

    useEffect(() => {
        if (treasure) {
            const arr = []
            for (const [symbol, amount] of Object.entries(treasure)) {
                for (let i = 0; i < amount; i++) {
                    arr.push(symbol)
                }
            }
            setCardTreasureArr(arr)
        }
    }, [treasure])

    return (
        <div onClick={_onClick}
            style={{
                width: typeof width === 'string' ? width : width + 'px',
                fontSize: typeof width === 'string' ? fontHelp : `${width / 18}px`,
                transform: enhance ? 'scale(2) translate(0%, 0%)' : '',
                zIndex: enhance ? '100' : '1',
            }}
            className={`main-card-wrapper card-comp any-card-outer-wrapper ${_className}`}
            onContextMenu={(e) => {
                e.preventDefault()
                setEnhance(!enhance)
            }}
        >
            {selfPlayer?.requestedSelection && <CardRequestedSelectionHandle card={card} />}
            {(heroToMove && heroToMove?.dungeonRoom?.id === id) && <HeroToMoveMarker />}
            <h3 style={{ fontSize: getFontEm(name.length) }} className='card-info-comp card-name dung-card-name'>{name}</h3>
            <p className='card-info-comp card-subname dungeon-card-type'>{subHeader}</p>
            <p className='card-info-comp dungeon-card-damage'
                style={{
                    color: baseDamage === damage ? 'white' : damage > baseDamage ? 'green' : 'red'
                }}
            >{damage}</p>
            <p style={{ fontSize: getDungDescEm(description?.length) }} className='card-info-comp card-comp dung-card-desc'>{description}</p>
            <img className='card-info-comp card-img-comp card-comp card-type-comp' src={typeUrl} />
            <img className='card-info-comp card-img-comp card-comp card-bg-comp' src={bgUrl || `${BACKEND_URL}/images/red_bg_canvas.png`} />
            <img className='card-info-comp card-img-comp card-comp card-main-img-comp' src={mainImg || `${BACKEND_URL}/images/bosses/boss_ROBOBO.png`} />
            <img className='card-info-comp card-img-comp card-comp dungeon-card-damage-img' src={mainImg || `${BACKEND_URL}/images/basic/dungeon_damage_heart.png`} />
            {cardTreasureArr.map((symbol, i) => {
                return (
                    <img key={i} style={{
                        transform: `translateX(-${50 * i}%)`
                    }}
                        className='card-info-comp card-img-comp card-symbol-comp' src={symbolImage[symbol]} />
                )
            })}
        </div>
    )
}

export default CardDungeon
