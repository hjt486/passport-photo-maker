import React from 'react'

const Disclaimer = ({
  uiProps
}) => {
  const {
    translate,
    modals,
    setModals
  } = uiProps;

  return (
    <dialog open={modals.disclaimer} className='modal'>
      <article>
        <h4>{translate("disclaimerModalTitle")}</h4>
        <small><b>{translate("disclaimerTitle")}</b></small>
        <small>{translate("disclaimer")}</small>
        <br />
        <small><b>{translate("datePrivacyTitle")}</b></small>
        <small>{translate("disclaimer2")}</small>
        <footer>
          <button onClick={() => setModals((prevModals) => ({ ...prevModals, disclaimer: false }))}>
            {translate("agreeButton")}
          </button>
          <button onClick={() => { window.location.href = 'https://www.google.com' }}>
            {translate("disagreeButton")}
          </button>
        </footer>
      </article>
    </dialog>
  )
}

export default Disclaimer