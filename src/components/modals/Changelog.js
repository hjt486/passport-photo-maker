import React from 'react'
import ReactGA from 'react-ga4'
import ChangeLog from '../../changelog.json'

const Changelog = ({
  uiProps
}) => {
  const {
    translate,
    modals,
    setModals,
    translateObject
  } = uiProps;

  return (
    <>
      <dialog open={modals.changelog} className='modal'>
        <article>
          <h2>{translate("changelog")}</h2>
          <div className='changelog'>
            {ChangeLog.changelog.map((entry, index) => (
              <div key={index}>
                <h4>{entry.date}</h4>
                <ol>
                  {entry.item.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <p>{translateObject(item)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <footer>
            <button onClick={() => setModals((prevModals) => ({ ...prevModals, changelog: false }))}>OK</button>
          </footer>
        </article>
      </dialog>
      <div
        role="button"
        className="outline modal-button"
        onClick={() => {
          setModals((prevModals) => ({ ...prevModals, changelog: true }))
          ReactGA.event({
            action: 'change_log',
            category: 'Button Click',
            label: 'Changelog',
          })
        }}>
        {translate("changelog")}
      </div>
    </>
  )
}

export default Changelog