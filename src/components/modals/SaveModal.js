import React, { useState, useEffect } from 'react'
import ReactGA from 'react-ga4'
import { generateSingle, handleSaveSingle, generate4x6, handleSave4x6 } from '../../utils/SaveImage'

const SaveModal = ({
  editorProps,
  photoProps,
  uiProps
}) => {
  const {
    editorRef,
    editorDimensions,
    exportPhoto
  } = editorProps;

  const {
    croppedImage
  } = photoProps;

  const {
    translate,
    modals,
    setModals,
    translateObject
  } = uiProps;

  const [image4x6Src, setImage4x6Src] = useState(null);
  const [imageSingleSrc, setImageSingleSrc] = useState(null);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [loadCounter, setLoadCounter] = useState(0);

  const initiateLoading = () => {
    setIsSaveLoading(true)
    setLoadCounter(2)
  }

  const decrementLoadCounter = () => {
    setLoadCounter(prevCount => {
      const newCount = prevCount - 1
      if (newCount === 0) {
        setIsSaveLoading(false)
      }
      return newCount
    })
  }

  const handleSave = async () => {
    initiateLoading()

    try {
      const single = await generateSingle(croppedImage, exportPhoto)
      setImageSingleSrc(single)
      decrementLoadCounter()

      const fourBySix = await generate4x6(croppedImage, exportPhoto)
      setImage4x6Src(fourBySix)
      decrementLoadCounter()

      ReactGA.event({
        action: 'save_photo',
        category: 'Button Click',
        label: 'Save Photo',
      })
    } catch (error) {
      console.error('Error generating images:', error)
      setIsSaveLoading(false)
    }
  }

  useEffect(() => {
    if (modals.save) {
      handleSave()
    }
  }, [modals.save])

  return (
    <dialog open={modals.save} className='modal'>
      <article>
        <h2>{translate("saveTitle")}</h2>
        {isSaveLoading ? (
          <div aria-busy="true">{translate("generating")}</div>
        ) : (
          <div className="save-option-container">
            <div className="save-option">
              <img src={imageSingleSrc} alt="Single" className="save-preview" />
              <p className="save-text">{translate("saveSingle")}</p>
              <button
                className="save-option-button"
                onClick={() => handleSaveSingle(imageSingleSrc)}
              >
                {translate("saveButton")}
              </button>
            </div>
            <div className="save-option">
              <img src={image4x6Src} alt="4x6" className="save-preview" />
              <p className="save-text">{translate("save4x6")}</p>
              <button
                className="save-option-button"
                onClick={() => handleSave4x6(image4x6Src)}
              >
                {translate("saveButton")}
              </button>
            </div>
          </div>
        )}
        <footer>
          <button onClick={() => setModals((prevModals) => ({ ...prevModals, save: false }))}>
            {translate("closeButton")}
          </button>
        </footer>
      </article>
    </dialog>
  )
}

export default SaveModal