import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import Card from './card'
import CardBack from './CardBack'
import CardHero from './CardHero'
import './City.css'


function City() {
    const game = useSelector(state => state.game.game)

    const [showCity, setShowCity] = useState(false)
    const [cityShowIcon, setCityShowIcon] = useState(faCaretLeft)


    function handleToggleShowCity() {
        const cityEle = document.getElementById('city-wrapper')
        if (!showCity) {
            setCityShowIcon(faCaretRight)
            cityEle.classList.add('city-wrapper-expanded')
        }
        else {
            setCityShowIcon(faCaretLeft)
            cityEle.classList.remove('city-wrapper-expanded')
        }

        setShowCity(!showCity)
    }


    return (
        <div id='city-wrapper' className="city-wrapper">
            <div onClick={handleToggleShowCity} className='city-expand-btn'>
                <FontAwesomeIcon icon={cityShowIcon} />
                <p>M</p>
                <p>i</p>
                <p>a</p>
                <p>s</p>
                <p>t</p>
                <p>o</p>
            </div>
            <div className='city-content'>
                <div className='city-heroes-section'>
                    <h3 className='city-heroes-header'>Bohaterowie w mieście</h3>
                    <div className='city-heroes-wrapper'>
                        {game?.city.map((hero, i) => <CardHero
                            name={hero.name}
                            width={190}
                            health={hero.baseHealth}
                            treasure={hero.treasureSign}
                            _className={'city-hero'}
                            key={i}
                            specialName={hero.specialName}
                            description={hero.description}
                            typeName={hero.typeName}
                            card={hero}
                        />)}
                    </div>
                </div>
                <div className='city-cards-section'>
                    <h3 className='city-cards-header'>Talie</h3>
                    <div className='city-cards-wrapper'>
                        <div className='cards-stack-wrapper'>
                            <CardBack
                                width={150}
                                text={'TALIA KOMNAT'}
                                bgImage={'/images/basic/dungeon_back_no_text.png'}
                            />
                            <h4>27 kart</h4>
                        </div>
                        <div className='cards-stack-wrapper'>
                            <CardBack
                                width={150}
                                text={'TALIA CZARÓW'}
                                bgImage={'/images/basic/spell_back_no_text.png'}
                            />
                            <h4>27 kart</h4>
                        </div>
                        <div className='cards-stack-wrapper'>
                            <CardBack
                                width={150}
                                text={'BOHATER'}
                                bgImage={'/images/basic/hero_back_no_text.png'}
                            />
                            <h4>27 kart</h4>
                        </div>
                        <div className='cards-stack-wrapper'>
                            <CardBack
                                width={150}
                                text={'KARTY ODRZUCONE'}
                                bgImage={'/images/basic/dungeon_back_no_text.png'}
                            />
                            <h4>27 kart</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default City
