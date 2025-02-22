import React, { useState, useRef, useEffect } from 'react'
import ReactGA from 'react-ga4'

const BuyMeACoffee = ({
  uiProps
}) => {
  const {
    translate,
    modals,
    setModals
  } = uiProps;

  const [copied, setCopied] = useState(false);
  const kbdRef = useRef(null);

  const handleCopy = () => {
    const emailText = 'hjt486@gmail.com'
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailText).then(() => {
        setCopied(true)
      }).catch((error) => {
        console.error('Error copying text:', error)
      })
    } else {
      console.warn('Clipboard API not supported.')
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kbdRef.current && !kbdRef.current.contains(e.target)) {
        setCopied(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <>
      <dialog open={modals.coffee} className='modal'>
        <article>
          <h2>{translate("buyMeACoffeeTitle")}</h2>
          <div>
            <div className="save-option-container">
              <div className="save-option">
                <img src="https://jiataihan.dev/assets/css/hid.hid" width={300} alt="WeChat" className="wechat-logo" />
                <p className="save-text">{translate("buyMeACoffeeWeChat")}</p>
              </div>
              <div className="save-option">
                <img src={process.env.PUBLIC_URL + "/BuyMeACoffee/paypal.png"} width={300} alt="Paypal" className="paypal-logo" />
                <textarea id="emailAddress" hidden="true">hjt486@gmail.com</textarea>
                <div>
                  <kbd onClick={handleCopy} ref={kbdRef} className="save-text">hjt486@gmail.com</kbd>
                  {copied && (
                    <sup>
                      <kbd style={{ fontSize: "xx-small", color: "var(--pico-color)", background: "var(--pico-primary-background)" }}>
                        {translate("buyMeCopied")}
                      </kbd>
                    </sup>
                  )}
                </div>
                <p className="save-text">{translate("buyMeACoffeePaypalZelle")}</p>
              </div>
            </div>
            <p className="save-text">{translate("buyMeACoffeeWords")}</p>
          </div>
          <footer>
            <button onClick={() => setModals((prevModals) => ({ ...prevModals, coffee: false }))}>OK</button>
          </footer>
        </article>
      </dialog>
      <div
        role="button"
        className="outline modal-button"
        onClick={() => {
          setModals((prevModals) => ({ ...prevModals, coffee: true }))
          ReactGA.event({
            action: 'buy_me_a_coffee',
            category: 'Button Click',
            label: 'Buy Me A Coffee',
          })
        }}>
        {translate("buyMeACoffeeButton")}
      </div>
    </>
  )
}

export default BuyMeACoffee