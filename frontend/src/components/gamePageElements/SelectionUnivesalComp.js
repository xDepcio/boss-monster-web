import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { stringify } from 'flatted'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import CardDungeon from './CardDungeon'
import CardSpell from './CardSpell'
import './SelectionUnivesalComp.css'
import { saveResponseError } from '../utils'
import CardHero from './CardHero'

export default function SelectionUnivesalComp() {
    const avalibleItemsForSelectArr = useSelector(state => state.game?.selfPlayer?.requestedSelection?.avalibleItemsForSelectArr)
    const selectionMessage = useSelector(state => state.game?.selfPlayer?.requestedSelection?.selectionMessage)
    const metadata = useSelector(state => state.game?.selfPlayer?.requestedSelection?.metadata)
    const dispatch = useDispatch()
    const params = useParams()

    function handleSelectItem(item) {
        const res = fetch(`/game/${params.lobbyId}/select-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: Cookies.get('user'),
                selectedItem: stringify(item),
                // displayType: metadata?.displayType
            })
        })
        saveResponseError(res, dispatch)
    }

    if (metadata?.displayType === 'dungeonCard') {
        return (
            <div className='treasure-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder'>
                    {avalibleItemsForSelectArr?.map((dungeon, i) => (
                        <CardDungeon
                            baseDamage={dungeon.baseDamage}
                            _onClick={() => {
                                console.log('dungeon')
                                handleSelectItem(dungeon)
                            }}
                            damage={dungeon.damage} width={150}
                            treasure={dungeon.treasure}
                            type={dungeon.type}
                            name={dungeon.name}
                            id={dungeon.id}
                            description={dungeon.description}
                            isFancy={dungeon.isFancy}
                            _className={'built-dung'}
                            card={dungeon}
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (metadata?.displayType === 'spellCard') {
        return (
            <div className='treasure-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder'>
                    {avalibleItemsForSelectArr?.map((spell, i) => (
                        <CardSpell
                            _onClick={() => handleSelectItem(spell)}
                            width={150}
                            name={spell.name}
                            description={spell.description}
                            key={i}
                            phase={spell.playablePhase}
                            _className={'player-card-in-inv'}
                            card={spell}
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (metadata?.displayType === 'text') {
        return (
            <div className='treasure-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder'>
                    {avalibleItemsForSelectArr?.map((text, i) => (
                        <div className='text-choice-holder'>
                            <p className='text-choice' key={i} onClick={() => handleSelectItem(text)}>{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (metadata?.displayType === 'mixed') {
        return (
            <div className='treasure-selection-wrapper universal-selection-wrapper'>
                <h3 className='treasure-selection-header'>{selectionMessage}</h3>
                <div className='treasure-sumbol-holder universal-selection-choices-holder'>
                    {avalibleItemsForSelectArr?.map((item, i) => {
                        if (typeof item === 'string') return (
                            <div className='text-choice-holder'>
                                <p className='text-choice' key={i} onClick={() => handleSelectItem(item)}>{item}</p>
                            </div>
                        )
                        if (item?.CARDTYPE === 'DUNGEON') return (
                            <CardDungeon
                                baseDamage={item.baseDamage}
                                _onClick={() => {
                                    handleSelectItem(item)
                                }}
                                damage={item.damage} width={150}
                                treasure={item.treasure}
                                type={item.type}
                                name={item.name}
                                id={item.id}
                                description={item.description}
                                isFancy={item.isFancy}
                                _className={'built-dung'}
                                card={item}
                            />
                        )
                        if (item?.CARDTYPE === 'SPELL') return (
                            <CardSpell
                                _onClick={() => handleSelectItem(item)}
                                width={150}
                                name={item.name}
                                description={item.description}
                                key={i}
                                phase={item.playablePhase}
                                _className={'player-card-in-inv'}
                                card={item}
                            />
                        )
                        if (item?.CARDTYPE === 'HERO') return (
                            <CardHero
                                card={item}
                                id={item.id}
                                baseHealth={item.baseHealth}
                                health={item.health}
                                name={item.name}
                                treasure={item.treasureSign}
                                width={150}
                                key={i}
                                _className={''}
                                description={item.description}
                                typeName={item.typeName}
                                specialName={item.specialName}
                                _onClick={() => handleSelectItem(item)}
                            />
                        )
                        if (item?.objectType === 'PLAYER_OBJECT') return (
                            <div key={i} onClick={() => handleSelectItem(item)} className='player-selection-single-player df'>
                                <p className='single-treasure-name'>{item.name}</p>
                                <FontAwesomeIcon className='player-selection-single-player-icon' icon={faUser} />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return <></>
}
