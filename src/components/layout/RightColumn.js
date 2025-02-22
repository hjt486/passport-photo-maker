import React from 'react'
import ReactGA from 'react-ga4'
import LoadPhotoButton from '../LoadPhotoButton'
import { EXPORT_WIDTH_LIMIT, EXPORT_HEIGHT_LIMIT } from '../../constants'
import { EXPORT_SIZE_LIMIT } from '../../constants'

const RightColumn = ({ editorProps, photoProps, exportProps, uiProps }) => {
  const { onPhotoLoad } = photoProps
  const {
    editorRef,
    editorDimensions,
    setEditorDimensions
  } = editorProps

  const {
    photo,
    croppedImage,
    setCroppedImage
  } = photoProps

  const {
    exportPhoto,
    setExportPhoto
  } = exportProps

  const {
    translate,
    setModals
  } = uiProps

  const handleWidthChange = (e) => {
    const newWidth = e.target.value
    if (newWidth > 0 && newWidth <= EXPORT_WIDTH_LIMIT && !isNaN(newWidth)) {
      const newHeight = Math.round(newWidth / exportPhoto.ratio)
      setExportPhoto((prevState) => ({
        ...prevState, 
        height: newHeight, 
        width: newWidth, 
        width_valid: true
      }))
    } else {
      setExportPhoto((prevState) => ({
        ...prevState, 
        width: newWidth, 
        width_valid: false
      }))
    }
    ReactGA.event({
      action: 'change_width',
      category: 'Export Area',
      label: 'Change width',
    })
  }

  const handleHeightChange = (e) => {
    const newHeight = e.target.value
    if (newHeight > 0 && newHeight <= EXPORT_HEIGHT_LIMIT && !isNaN(newHeight)) {
      const newWidth = Math.round(newHeight * exportPhoto.ratio)
      setExportPhoto((prevState) => ({
        ...prevState, 
        height: newHeight, 
        width: newWidth, 
        height_valid: true
      }))
    } else {
      setExportPhoto((prevState) => ({
        ...prevState, 
        height: newHeight, 
        height_valid: false
      }))
    }
    ReactGA.event({
      action: 'change_height',
      category: 'Export Area',
      label: 'Change height',
    })
  }

  const handleSizeChange = (e) => {
    const newSize = e.target.value
    if (newSize > 0 && EXPORT_SIZE_LIMIT <= 2000 && !isNaN(newSize)) {
      setExportPhoto((prevState) => ({
        ...prevState, 
        size: newSize, 
        size_valid: true
      }))
    } else {
      setExportPhoto((prevState) => ({
        ...prevState, 
        size: newSize, 
        size_valid: false
      }))
    }
    ReactGA.event({
      action: 'change_size',
      category: 'Export Area',
      label: 'Change size',
    })
  }

  return (
    photo && (
      <div className="right-column" style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}>
        {croppedImage && (
          <>
            <article className="preview-container">
              <img 
                src={croppedImage} 
                alt="Cropped preview" 
                className="cropped-preview" 
                height={editorDimensions.height * editorDimensions.zoom / 2} 
                width={editorDimensions.width * editorDimensions.zoom / 2} 
              />
              <div className='export-container' style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}>
                <label className="export-label">{translate("widthLabel")}<br />(px)</label>
                <input
                  type="number"
                  value={exportPhoto.width}
                  aria-invalid={!exportPhoto.width_valid}
                  onChange={handleWidthChange}
                  className="export-input"
                  style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2.9}px` }}
                />
              </div>
              <div className='export-container' style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}>
                <label className="export-label">{translate("heightLabel")}<br />(px)</label>
                <input
                  type="number"
                  value={exportPhoto.height}
                  aria-invalid={!exportPhoto.height_valid}
                  onChange={handleHeightChange}
                  className="export-input"
                  style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2.9}px` }}
                />
              </div>
              <div className='export-container' style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}>
                <label className="export-label">{translate("sizeLabel")}<br />(KB)</label>
                <input
                  type="number"
                  value={exportPhoto.size}
                  aria-invalid={!exportPhoto.size_valid}
                  onChange={handleSizeChange}
                  className="export-input"
                  style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2.9}px` }}
                />
              </div>
              <div
                disabled={!(exportPhoto.width_valid && exportPhoto.height_valid && exportPhoto.size_valid)}
                role="button"
                className="save-button"
                style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}
                onClick={() => {
                  setModals((prevModals) => ({ ...prevModals, save: true }))
                  ReactGA.event({
                    action: 'generate_photo',
                    category: 'Button Click',
                    label: 'Generate photo',
                  })
                }}
              >
                {translate("saveTitle")}
              </div>
            </article>
            <article className="guides-section guide-instruction">
              <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("loadNewPhotoButton")} />
            </article>
          </>
        )}
      </div>
    )
  )
}

export default RightColumn