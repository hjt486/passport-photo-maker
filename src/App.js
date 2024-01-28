import React, { useState, useCallback, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import GuideDrawer from './GuideDrawer'
import { useLanguage } from './translate'
import { generateSingle, handleSaveSingle, generate4x6, handleSave4x6 } from './SaveImage'
import PRC_Passport_Photo from './Templates/PRC_Passport_Photo.json'
import US_Passport_Photo from './Templates/US_Passport_Photo.json'
import Canada_Passport_Photo from './Templates/Canada_Passport_Photo.json'
import Canada_Visa_Photo from './Templates/Canada_Visa_Photo.json'
import './App.css'
import ChangeLog from './changelog.json'

const INITIAL_ZOOM = 1
const INITIAL_ROTATION = 0
const ZOOM_FACTOR = 1.01
const MOVE_FACTOR = 0.005
const MIN_ZOOM = 0.5
const MAX_ZOOM = 10
const EXPORT_WIDTH_LIMIT = 2000
const EXPORT_HEIGHT_LIMIT = 2000
const EXPORT_SIZE_LIMIT = 2000
const TEMPLATES = [
  PRC_Passport_Photo,
  US_Passport_Photo,
  Canada_Passport_Photo,
  Canada_Visa_Photo,
]
const MAX_EDITOR_WIDTH = 330
const MAX_EDITOR_HEIGHT = 480
const MM2INCH = 25.4 // Convert millimeter to inch

// Function to update the preview
const updatePreview = (editorRef, setCroppedImage) => {
  if (editorRef.current) {
    const canvas = editorRef.current.getImageScaledToCanvas()
    canvas.style.touchAction = 'none'
    setCroppedImage(canvas.toDataURL())
  }
}

// LoadPhotoButton component
const LoadPhotoButton = ({ onPhotoLoad, title }) => {
  const MAX_FILE_SIZE = 20000000
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]

    if (file) {
      // Check the file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size should be less than ${MAX_FILE_SIZE / 1000000}MB`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        onPhotoLoad(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClickBrowse = () => {
    // Trigger the file input when the "Browse..." button is clicked
    document.getElementById('selectedFile').click()
  }

  return (
    <>
      <input
        type="file"
        id="selectedFile"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
        accept="image/png, image/jpeg, image/jpg"
      />
      <div
        role="button"
        tabIndex="0"
        className="load-file-button"
        onClick={handleClickBrowse}
      >{title}</div>
    </>
  )
}

const calculateEditorZoom = (originalWidth, originalHeight) => {
  return Math.min(MAX_EDITOR_WIDTH / originalWidth, MAX_EDITOR_HEIGHT / originalHeight)
}

const NavBar = ({
  template,
  setTemplate,
  exportPhoto,
  setExportPhoto,
  language,
  getLanguage,
  setLanguage,
  translate,
  translateObject,
  setEditorDimensions,
  editorRef,
  setCroppedImage
}) => {

  const handleTemplateChange = (event) => {
    const selectedTemplateTitle = event.target.value

    // Find the template object that matches the selected title
    const selectedTemplate = TEMPLATES.find((t) => t.title[getLanguage()] === selectedTemplateTitle)

    // Set the selected template
    if (selectedTemplate) {
      setTemplate(selectedTemplate)
      setExportPhoto({
        width: parseInt(parseInt(selectedTemplate.width) / MM2INCH * parseInt(selectedTemplate.dpi)),
        height: parseInt(parseInt(selectedTemplate.height) / MM2INCH * parseInt(selectedTemplate.dpi)),
        size: parseInt(selectedTemplate.size),
        ratio: parseInt(selectedTemplate.width) / parseInt(selectedTemplate.height),
        width_mm: selectedTemplate.width,
        height_mm: selectedTemplate.height,
        dpi: selectedTemplate.dpi,
        width_valid: true,
        height_valid: true,
        size_valid: true,
      })
      setEditorDimensions({
        width: parseInt(selectedTemplate.width) / MM2INCH * parseInt(selectedTemplate.dpi),
        height: parseInt(selectedTemplate.height) / MM2INCH * parseInt(selectedTemplate.dpi),
        zoom: calculateEditorZoom(
          parseInt(selectedTemplate.width) / MM2INCH * parseInt(selectedTemplate.dpi),
          parseInt(selectedTemplate.height) / MM2INCH * parseInt(selectedTemplate.dpi)),
        dpi_ratio: selectedTemplate.dpi / (MM2INCH * 10),
      })
      setCroppedImage(null)
      updatePreview(editorRef, setCroppedImage)
    }
  }

  const handleLanguageChange = (event) => {
    const isChecked = event.target.checked
    setLanguage(isChecked ? "zh" : "en")
  }

  return (
    <nav>
      <ul>
        <li><strong>{translate("app.title")}</strong></li>
      </ul>
      <ul>
        <li>
          <select
            aria-label="Templates"
            required
            value={translateObject(template.title)}
            onChange={handleTemplateChange}
          >
            {TEMPLATES.map((template, index) => (
              <option key={index} value={translateObject(template.title)}> {translateObject(template.title)}  </option>
            ))}
          </select>
        </li>
        <li>
          <label>
            <input
              type="checkbox"
              role="switch"
              onChange={handleLanguageChange}
              checked={getLanguage() === "zh"}
            />
            中文</label>
        </li>
      </ul>
    </nav>
  )
}

const LeftColumn = ({
  photo,
  options,
  onOptionChange,
  onPhotoLoad,
  croppedImage,
  editorDimensions,
  setEditorDimensions,
  photoGuides,
  translate,
  translateObject,
}) => {
  const { guide, instruction } = photoGuides
  return (
    photo && (<div className="left-column" style={{ width: `${editorDimensions.width * editorDimensions.zoom}px` }}>
      <article className="guides-section guide-instruction">
        <small dangerouslySetInnerHTML={{ __html: translateObject(instruction) }} />
      </article>
      <article className="guides-section guide-details">
        {guide.map((guide, index) => (
          <div key={index} className="guide-item">
            <kbd className="color-block" style={{ backgroundColor: guide.color, color: "black" }}><small>{guide.index}</small></kbd>
            <small>{translateObject(guide.instruction)}</small>
          </div>
        ))}
      </article>
    </div>)
  )
}

const MiddleColumn = ({
  onPhotoLoad,
  photo,
  setPhoto,
  options,
  zoom,
  setZoom,
  rotation,
  setRotation,
  setCroppedImage,
  editorRef,
  editorDimensions,
  setEditorDimensions,
  photoGuides,
  translate,
  initialDistance,
  setInitialDistance,
  initialAngle,
  setInitialAngle,
}) => {
  const { guide } = photoGuides
  const touchStartRef = useRef({ x: null, y: null })
  const lastTouchDistance = useRef(null)
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 }) // Weirdly, have to set a out-of-boundary number to make moving working when page is loaded.
  const [isDragging, setIsDragging] = useState(false)
  const mouseStartRef = useRef({ x: null, y: null })

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      let dx = (e.clientX - mouseStartRef.current.x) / editorDimensions.width / zoom
      let dy = (e.clientY - mouseStartRef.current.y) / editorDimensions.height / zoom

      const adjusted = adjustPositionForRotation(dx, dy, rotation)
      dx = adjusted.x
      dy = adjusted.y

      setPosition((prevPosition) => ({
        x: prevPosition.x - dx,
        y: prevPosition.y - dy,
      }))
      mouseStartRef.current = { x: e.clientX, y: e.clientY }
      updatePreview(editorRef, setCroppedImage)
    }
  }, [editorRef, setCroppedImage, isDragging, editorDimensions.width, editorDimensions.height, zoom, setPosition, rotation])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    mouseStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMoveLeft = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(MOVE_FACTOR * 1 / zoom, 0, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
    updatePreview(editorRef, setCroppedImage)
  }

  const handleMoveRight = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(-MOVE_FACTOR * 1 / zoom, 0, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
    updatePreview(editorRef, setCroppedImage)
  }

  const handleMoveUp = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(0, MOVE_FACTOR * 1 / zoom, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
    updatePreview(editorRef, setCroppedImage)
  }

  const handleMoveDown = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(0, -MOVE_FACTOR * 1 / zoom, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
    updatePreview(editorRef, setCroppedImage)
  }


  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value))
    updatePreview(editorRef, setCroppedImage)
  }

  const handleZoomIn = (e) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(prevZoom * ZOOM_FACTOR, MAX_ZOOM)
      updatePreview(editorRef, setCroppedImage)
      return newZoom
    })
  }

  const handleZoomOut = (e) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(prevZoom / ZOOM_FACTOR, MIN_ZOOM)
      updatePreview(editorRef, setCroppedImage)
      return newZoom
    })
  }

  const handleRotateClockwise = () => {
    setRotation((prevRotation) => {
      const newRotation = prevRotation + 0.5
      updatePreview(editorRef, setCroppedImage)
      return newRotation
    })
  }

  const handleRotateCounterclockwise = () => {
    setRotation((prevRotation) => {
      const newRotation = prevRotation - 0.5
      updatePreview(editorRef, setCroppedImage)
      return newRotation
    })
  }

  const handleMouseScroll = (event) => {
    const delta = event.deltaY
    setZoom(prevZoom => {
      const zoomStep = Math.pow(ZOOM_FACTOR, 2) // Adjust this step size as needed
      let newZoom = delta > 0 ? prevZoom / zoomStep : prevZoom * zoomStep
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))

      return newZoom
    })

    updatePreview(editorRef, setCroppedImage)
  }

  const adjustPositionForRotation = (dx, dy, rotation) => {
    const radians = rotation * (Math.PI / 180)
    return {
      x: dx * Math.cos(radians) + dy * Math.sin(radians),
      y: dy * Math.cos(radians) - dx * Math.sin(radians)
    }
  }


  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      setInitialDistance(null)
      setInitialAngle(null)
    }
  }

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 1) {
      // Single finger touch does panning
      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y

      const normalizedDx = dx / editorDimensions.width / zoom
      const normalizedDy = dy / editorDimensions.height / zoom

      const adjusted = adjustPositionForRotation(normalizedDx, normalizedDy, rotation)

      setPosition((prevPosition) => {
        const newX = prevPosition.x - adjusted.x
        const newY = prevPosition.y - adjusted.y
        return { x: newX, y: newY }
      })

      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      // Two fingers touch does pinch zooming and rotation
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]

      // Calculate the distance for zoom
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )

      // Calculate the angle for rotation
      const angleRadians = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      )

      if (initialDistance === null) {
        setInitialDistance(currentDistance)
        setInitialAngle(angleRadians)
      } else {
        const scaleChange = currentDistance / initialDistance
        setZoom(prevZoom => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * scaleChange)))

        if (initialAngle !== null) {
          const angleChange = angleRadians - initialAngle
          const angleChangeDeg = angleChange * (180 / Math.PI)
          setRotation(prevRotation => prevRotation + angleChangeDeg)
        }

        setInitialDistance(currentDistance) // Update initial distance for next movement
        setInitialAngle(angleRadians) // Update initial angle for next movement
      }
    }
    updatePreview(editorRef, setCroppedImage)
  }, [editorDimensions.width, editorDimensions.height, setCroppedImage, editorRef, zoom, initialDistance, setInitialDistance, initialAngle, setInitialAngle, setZoom, rotation, setRotation])

  const handleTouchEnd = useCallback((e) => {
    lastTouchDistance.current = null
    setInitialDistance(null)
    setInitialAngle(null)
  }, [setInitialDistance, setInitialAngle])

  const preventDefault = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleMouseEnter = () => {
    // Prevent scroll when the mouse enters
    document.addEventListener('wheel', preventDefault, { passive: false })
  }

  const handleMouseLeave = () => {
    // Allow scroll when the mouse leaves
    document.removeEventListener('wheel', preventDefault, { passive: false })
  }

  useEffect(() => {
    const photoArea = document.querySelector('.photo-area')
    if (photoArea) {
      photoArea.addEventListener('wheel', preventDefault, { passive: false })
      return () => photoArea.removeEventListener('wheel', preventDefault, { passive: false })
    }
  }, [preventDefault])

  useEffect(() => {
    const photoArea = document.querySelector('.photo-area')
    photoArea.addEventListener('mousemove', handleMouseMove)
    if (photoArea) {
      photoArea.addEventListener('mousedown', handleMouseDown)
      photoArea.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        photoArea.removeEventListener('mousedown', handleMouseDown)
        photoArea.removeEventListener('mousemove', handleMouseMove)
        photoArea.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [editorRef, editorDimensions.width, editorDimensions.height, setCroppedImage, handleMouseMove])


  return (
    <article className="middle-column"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        className="photo-area"
        style={{
          position: 'relative',
          width: editorDimensions.width * editorDimensions.zoom,
          height: editorDimensions.height * editorDimensions.zoom,
        }}
      >
        {!photo && <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("selectPhotoButton")} />}
        <div className="photo-transform" style={{
          position: 'absolute', // Adjust positioning as needed
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${editorDimensions.zoom})`,
        }}>
          {photo && (
            <AvatarEditor
              ref={editorRef}
              image={photo}
              width={editorDimensions.width}
              height={editorDimensions.height}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={zoom}
              border={0}
              rotate={rotation}
              position={position}
              onWheel={handleMouseScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              disableBoundaryChecks={true}
            />
          )}
        </div>
      </div>
      {
        photo && options.guide && (
          <GuideDrawer
            guides={guide}
            editorDimensions={editorDimensions}
          />
        )
      }
      {photo && (
        <div
          className="control-container"
          style={{
            width: editorDimensions.width * editorDimensions.zoom,
          }}
        >
          <div className="control-row1">
            <input
              className="slide-control"
              list="slide-markers"
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
            />
            <datalist id="slide-markers">
              <option value="1"></option>
            </datalist>
          </div>
          <div className="control-row2">
            <div role="button" className="control-button" onClick={handleZoomOut}>−</div>
            <div role="button" className="control-button" onClick={handleZoomIn}>+</div>
            <div role="button" className="control-button" onClick={handleRotateCounterclockwise}>↺</div>
            <div role="button" className="control-button" onClick={handleRotateClockwise}>↻</div>
            <div role="button" className="control-button" onClick={handleMoveLeft}>←</div>
            <div role="button" className="control-button" onClick={handleMoveRight}>→</div>
            <div role="button" className="control-button" onClick={handleMoveUp}>↑</div>
            <div role="button" className="control-button" onClick={handleMoveDown}>↓</div>
          </div>
        </div>
      )}
    </article >
  )
}

const RightColumn = ({
  editorRef,
  photo,
  options,
  onOptionChange,
  onPhotoLoad,
  croppedImage,
  setCroppedImage,
  editorDimensions,
  setEditorDimensions,
  photoGuides,
  exportPhoto,
  setExportPhoto,
  translate,
  setModals,
}) => {

  const handleWidthChange = (e) => {
    const newWidth = e.target.value
    if (newWidth > 0 && newWidth <= EXPORT_WIDTH_LIMIT && !isNaN(newWidth)) {
      const newHeight = Math.round(newWidth / exportPhoto.ratio)
      setExportPhoto((prevState) => ({
        ...prevState, height: newHeight, width: newWidth, width_valid: true
      }))
    } else setExportPhoto((prevState) => ({
      ...prevState, width: newWidth, width_valid: false
    }))
  }

  const handleHeightChange = (e) => {
    const newHeight = e.target.value
    if (newHeight > 0 && newHeight <= EXPORT_HEIGHT_LIMIT && !isNaN(newHeight)) {
      const newWidth = Math.round(newHeight * exportPhoto.ratio)
      setExportPhoto((prevState) => ({
        ...prevState, height: newHeight, width: newWidth, height_valid: true
      }))
    } else setExportPhoto((prevState) => ({
      ...prevState, height: newHeight, height_valid: false
    }))
  }

  const handleSizeChange = (e) => {
    const newSize = e.target.value
    if (newSize > 0 && EXPORT_SIZE_LIMIT <= 2000 && !isNaN(newSize)) {
      setExportPhoto((prevState) => ({
        ...prevState, size: newSize, size_valid: true
      }))
    } else setExportPhoto((prevState) => ({
      ...prevState, size: newSize, size_valid: false
    }))
  }

  return (
    photo && (<div className="right-column" style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}>
      {croppedImage && (
        <>
          <article className="guides-section guide-instruction">
            <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("loadNewPhotoButton")} />
          </article>
          <article className="preview-container">
            <img src={croppedImage} alt="Cropped preview" className="cropped-preview" height={editorDimensions.height * editorDimensions.zoom / 2} width={editorDimensions.width * editorDimensions.zoom / 2} />
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
              <label className="export-label" >{translate("sizeLabel")}<br />(KB)</label>
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
              onClick={() => setModals((prevModals) => ({ ...prevModals, save: true }))}
            >{translate("saveTitle")}</div>
          </article>
        </>
      )}
    </div>)
  )
}

const BuyMeACoffee = ({
  translate,
  modals,
  setModals,
}) => {
  return (<>
    <dialog open={modals.coffee} className='modal'>
      <article>
        <h2>{translate("buyMeACoffeeTitle")}</h2>
        <div class="grid modal-method">
          <div><img src="https://jiataihan.dev/assets/css/hid.hid" alt="WeChat" className="wechat-logo" /><p>WeChat</p></div>
          <div>
            <img src={process.env.PUBLIC_URL + "/BuyMeACoffee/zelle.png"} alt="Zelle" className="zelle-logo" />
            <img src={process.env.PUBLIC_URL + "/BuyMeACoffee/paypal.png"} alt="Paypal" className="paypal-logo" />
            <p>Zelle Or Paypal</p>
            <p>hjt486@gmail.com</p>
          </div>
        </div>
        <p>{translate("buyMeACoffeeWords")}</p>
        <footer>
          <button onClick={() => setModals((prevModals) => ({ ...prevModals, coffee: false }))}>OK</button>
        </footer>
      </article>
    </dialog>
    <div
      role="button"
      class="outline modal-button"
      onClick={() => setModals((prevModals) => ({ ...prevModals, coffee: true }))}>
      {translate("buyMeACoffeeButton")}
    </div>
  </>)
}

const Changelog = ({
  translate,
  modals,
  setModals,
  translateObject,
}) => {
  return (<>
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
      class="outline modal-button"
      onClick={() => setModals((prevModals) => ({ ...prevModals, changelog: true }))}>
      {translate("changelog")}
    </div>
  </>)
}

const SaveModal = ({
  translate,
  modals,
  setModals,
  translateObject,
  croppedImage,
  editorDimensions,
  exportPhoto,
  editorRef
}) => {
  const [image4x6Src, setImage4x6Src] = useState(null)
  const [imageSingleSrc, setImageSingleSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [loadCounter, setLoadCounter] = useState(0)

  const initiateLoading = () => {
    setIsLoading(true)
    setLoadCounter(2) // Expecting two async operations
  }

  const decrementLoadCounter = () => {
    setLoadCounter(prevCount => {
      const newCount = prevCount - 1
      if (newCount === 0) {
        setIsLoading(false)
      }
      return newCount
    })
  }

  useEffect(() => {
    if (croppedImage && editorRef.current && modals.save) {
      initiateLoading()
      generateSingle(croppedImage, editorRef, exportPhoto)
        .then(image => setImageSingleSrc(image))
        .catch(error => console.error("Error generating single image:", error))
        .finally(decrementLoadCounter)
    }
  }, [croppedImage, editorRef, exportPhoto, modals.save])

  useEffect(() => {
    if (imageSingleSrc && modals.save) {
      generate4x6(MM2INCH, imageSingleSrc, exportPhoto)
        .then(image => setImage4x6Src(image))
        .catch(error => console.error("Error generating 4x6 image:", error))
        .finally(decrementLoadCounter)
    }
  }, [imageSingleSrc, croppedImage, exportPhoto, modals.save])

  return (
    <>
      <dialog open={modals.save} className='modal'>
        <article>
          <h2>{isLoading? translate("saveGenerating") : translate("saveTitle")}</h2>
          <div aria-busy={isLoading} >
            {!isLoading && (<div className="save-option-container">
              <div className="save-option">
                <img src={imageSingleSrc || croppedImage} alt="Save preview" className="save-preview" height={editorDimensions.height * editorDimensions.zoom / 2} width={editorDimensions.width * editorDimensions.zoom / 2} />
                <p className="save-text" >{translate("saveSingleText")}</p>
                <div
                  role="button"
                  className="save-option-button"
                  disabled={!imageSingleSrc}
                  onClick={() => imageSingleSrc && handleSaveSingle(imageSingleSrc)}
                >{translate("saveSingle")}</div>
              </div>
              <div className="save-option">
                {
                  image4x6Src &&
                  <img src={image4x6Src} alt="Save 4x6 preview" className="save-preview" height={editorDimensions.height * editorDimensions.zoom / 2} width={editorDimensions.width * editorDimensions.zoom / 2} />
                }
                <p className="save-text" >{translate("save4x6Text")}</p>
                <div
                  role="button"
                  disabled={!image4x6Src}
                  className="save-option-button"
                  onClick={() => image4x6Src && handleSave4x6(image4x6Src)}
                >{translate("save4x6")}</div>                
              </div>
            </div>)}
          </div>
          <footer>
            <button onClick={() => setModals((prevModals) => ({ ...prevModals, save: false }))}>OK</button>
          </footer>
        </article>
      </dialog>
    </>
  )
}


// Main App component
const App = () => {
  const [template, setTemplate] = useState(TEMPLATES[0]) // Default is China
  const [photo, setPhoto] = useState(null)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotation, setRotation] = useState(INITIAL_ROTATION)
  const [options, setOptions] = useState({
    guide: true,
    instruction: true,
    example: false,
  })
  const [croppedImage, setCroppedImage] = useState(null)

  const [exportPhoto, setExportPhoto] = useState({
    width: parseInt(parseInt(template.width) / MM2INCH * parseInt(template.dpi)),
    height: parseInt(parseInt(template.height) / MM2INCH * parseInt(template.dpi)),
    size: parseInt(template.size),
    ratio: parseInt(template.width) / parseInt(template.height),
    width_mm: template.width,
    height_mm: template.height,
    dpi: template.dpi,
    width_valid: true,
    height_valid: true,
    size_valid: true,
  })
  const [modals, setModals] = useState({ coffee: false, changelog: false, save: false })
  const [editorDimensions, setEditorDimensions] = useState({
    width: parseInt(template.width) / MM2INCH * parseInt(template.dpi),
    height: parseInt(template.height) / MM2INCH * parseInt(template.dpi),
    zoom: calculateEditorZoom(
      parseInt(template.width) / MM2INCH * parseInt(template.dpi),
      parseInt(template.height) / MM2INCH * parseInt(template.dpi),
    ),
    dpi_ratio: template.dpi / (MM2INCH * 10)
  })
  const [initialDistance, setInitialDistance] = useState(null)
  const [initialAngle, setInitialAngle] = useState(null)


  const editorRef = React.createRef()
  const { translate, translateObject, setLanguage, getLanguage } = useLanguage()

  const photoGuides = template

  const handlePhotoLoad = useCallback((photoData) => {
    setPhoto(photoData)
    setZoom(INITIAL_ZOOM) // Reset zoom to initial value
    setRotation(INITIAL_ROTATION) // Reset rotation to initial value
    setTimeout(() => updatePreview(editorRef, setCroppedImage, rotation), 0)
  }, [editorRef, rotation])

  useEffect(() => {
    if (photo) {
      updatePreview(editorRef, setCroppedImage)
    }
  }, [photo, zoom, rotation, editorRef])

  const handleOptionChange = (event) => {
    const { name, checked } = event.target
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }))
  }

  return (
    <div className="app">
      <div className="frame">
        <div className="container">
          <NavBar
            template={template}
            setTemplate={setTemplate}
            exportPhoto={exportPhoto}
            setExportPhoto={setExportPhoto}
            getLanguage={getLanguage}
            setLanguage={setLanguage}
            translate={translate}
            translateObject={translateObject}
            setEditorDimensions={setEditorDimensions}
            setCroppedImage={setCroppedImage}
            editorRef={editorRef}
          />
        </div>
        <div className="container">
          <LeftColumn
            photo={photo}
            options={options}
            onOptionChange={handleOptionChange}
            onPhotoLoad={handlePhotoLoad}
            croppedImage={croppedImage}
            editorDimensions={editorDimensions}
            setEditorDimensions={setEditorDimensions}
            photoGuides={photoGuides}
            translate={translate}
            translateObject={translateObject}
          />
          <MiddleColumn
            onPhotoLoad={handlePhotoLoad}
            photo={photo}
            setPhoto={setPhoto}
            options={options}
            zoom={zoom}
            setZoom={setZoom}
            rotation={rotation}
            setRotation={setRotation}
            setCroppedImage={setCroppedImage}
            editorRef={editorRef}
            editorDimensions={editorDimensions}
            setEditorDimensions={setEditorDimensions}
            photoGuides={photoGuides}
            translate={translate}
            initialDistance={initialDistance}
            setInitialDistance={setInitialDistance}
            initialAngle={initialAngle}
            setInitialAngle={setInitialAngle}
          />
          <RightColumn
            editorRef={editorRef}
            photo={photo}
            options={options}
            onOptionChange={handleOptionChange}
            onPhotoLoad={handlePhotoLoad}
            croppedImage={croppedImage}
            setCroppedImage={{ setCroppedImage }}
            editorDimensions={editorDimensions}
            setEditorDimensions={setEditorDimensions}
            photoGuides={photoGuides}
            exportPhoto={exportPhoto}
            setExportPhoto={setExportPhoto}
            translate={translate}
            setModals={setModals}
          />
          <SaveModal
            translate={translate}
            modals={modals}
            setModals={setModals}
            translateObject={translateObject}
            croppedImage={croppedImage}
            editorDimensions={editorDimensions}
            exportPhoto={exportPhoto}
            editorRef={editorRef}
          />
        </div>
        <div className="container">
          <BuyMeACoffee
            translate={translate}
            modals={modals}
            setModals={setModals}
          />
          <Changelog
            translate={translate}
            modals={modals}
            setModals={setModals}
            translateObject={translateObject}
          />
          <div
            role="button"
            class="outline modal-button"
          >
            <a target="_blank" rel="noreferrer" href="https://github.com/hjt486/passport-photo-maker/issues">{translate("feedback")}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App