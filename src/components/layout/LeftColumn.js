import React from 'react'
import LoadPhotoButton from '../LoadPhotoButton'

const LeftColumn = ({
  photoProps,
  optionsProps,
  editorProps,
  uiProps
}) => {
  const {
    photo,
    croppedImage,
    onPhotoLoad
  } = photoProps

  const {
    options,
    onOptionChange
  } = optionsProps

  const {
    editorDimensions,
    photoGuides
  } = editorProps

  const {
    translate,
    translateObject
  } = uiProps

  return (
    <div className="left-column">
      {!photo && (
        <article className="guides-section guide-instruction">
          <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("selectPhotoButton")} />
        </article>
      )}
      {photo && !croppedImage && (
        <article className="guides-section guide-instruction">
          <div className="control-row1">
            <h5>{translate("guideTitle")}</h5>
          </div>
          <div className="control-row2">
            <label>
              <input
                type="checkbox"
                name="guide"
                checked={options.guide}
                onChange={onOptionChange}
              />
              {translate("guideLabel")}
            </label>
            <label>
              <input
                type="checkbox"
                name="instruction"
                checked={options.instruction}
                onChange={onOptionChange}
              />
              {translate("instructionLabel")}
            </label>
          </div>
          <div className="control-row3">
            <p>{translateObject(photoGuides.instruction)}</p>
          </div>
          <div className="control-row4">
            <div>
              <small>{translate("defaultWidth")}</small>
              <small>{photoGuides.width}mm</small>
            </div>
            <div>
              <small>{translate("defaultHeight")}</small>
              <small>{photoGuides.height}mm</small>
            </div>
          </div>
        </article>
      )}
    </div>
  )
}

export default LeftColumn