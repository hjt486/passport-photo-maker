import React, { useState, useCallback, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import GuideDrawer from './GuideDrawer'
import { useLanguage } from './translate'
import { resizeAndCompressImage } from './ImageUtils'
import PRC_Passport_Photo from './Templates/PRC_Passport_Photo.json'
import US_Passport_Photo from './Templates/US_Passport_Photo.json'
import './App.css'

const INITIAL_ZOOM = 1.5
const INITIAL_ROTATION = 0
const ZOOM_FACTOR = 0.01
const MOVE_FACTOR = 0.01
const PAN_FACTOR = 0.5
const EXPORT_WIDTH_LIMIT = 2000
const EXPORT_HEIGHT_LIMIT = 2000
const EXPORT_SIZE_LIMIT = 2000
const TEMPLATES = [
  PRC_Passport_Photo,
  US_Passport_Photo,
]

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

const SaveFileButton = ({
  exportPhoto,
  croppedImage,
  editorDimensions,
  setEditorDimentions,
  translate
}) => {
  const handleSave = () => {
    if (croppedImage) {
      resizeAndCompressImage(croppedImage, exportPhoto.width, exportPhoto.height, exportPhoto.size)
        .then((resizedBlob) => {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(resizedBlob)
          a.download = 'resized-image.jpeg'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  return (
    <div
      disabled={!(exportPhoto.width_valid && exportPhoto.height_valid && exportPhoto.size_valid)}
      role="button"
      className="save-button"
      style={{ width: `${editorDimensions.width / 2}px` }}
      onClick={handleSave}
    >{translate("saveButton")}</div>
  )
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
  translateGuide,
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
        width: parseInt(selectedTemplate.width),
        height: parseInt(selectedTemplate.height),
        size: parseInt(selectedTemplate.size),
        ratio: parseInt(selectedTemplate.width) / parseInt(selectedTemplate.height),
        width_valid: true,
        height_valid: true,
        size_valid: true,
      })
      setEditorDimensions({
        width: parseInt(selectedTemplate.width),
        height: parseInt(selectedTemplate.height),
      })
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
            value={translateGuide(template.title)}
            onChange={handleTemplateChange}
          >
            {TEMPLATES.map((template, index) => (
              <option key={index} value={translateGuide(template.title)}> {translateGuide(template.title)}  </option>
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
  setEditorDimentions,
  photoGuides,
  translate,
  translateGuide,
}) => {
  const { guide, instruction } = photoGuides
  return (
    photo && (<div className="left-column" style={{ width: `${editorDimensions.width}px` }}>
      <article className="guides-section guide-instruction">
        <small dangerouslySetInnerHTML={{ __html: translateGuide(instruction) }} />
      </article>
      <article className="guides-section guide-details">
        {guide.map((guide, index) => (
          <div key={index} className="guide-item">
            <kbd className="color-block" style={{ backgroundColor: guide.color, color: "black" }}><small>{guide.index}</small></kbd>
            <small>{translateGuide(guide.instruction)}</small>
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
  setEditorDimentions,
  photoGuides,
  translate
}) => {
  const { guide } = photoGuides
  const touchStartRef = useRef({ x: null, y: null })
  const lastTouchDistance = useRef(null)
  const [position, setPosition] = useState({ x: editorDimensions.width * 100, y: editorDimensions.height * 100 }) // Weirdly, have to set a out-of-boundary number to make moving working when page is loaded.
  const [isDragging, setIsDragging] = useState(false)
  const mouseStartRef = useRef({ x: null, y: null })

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const dx = (e.clientX - mouseStartRef.current.x) / editorDimensions.width * PAN_FACTOR
      const dy = (e.clientY - mouseStartRef.current.y) / editorDimensions.height * PAN_FACTOR
      setPosition((prevPosition) => ({
        x: Math.min(1, Math.max(0, prevPosition.x - dx)),
        y: Math.min(1, Math.max(0, prevPosition.y - dy))
      }))
      mouseStartRef.current = { x: e.clientX, y: e.clientY }
      updatePreview(editorRef, setCroppedImage)
    }
  }, [editorRef, setCroppedImage, isDragging, editorDimensions.width, editorDimensions.height, setPosition])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    mouseStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMoveLeft = (e) => {
    setPosition((prevPosition) => ({
      x: prevPosition.x + MOVE_FACTOR * 1 / zoom,
      y: prevPosition.y
    }))
    updatePreview(editorRef, setCroppedImage)
  }

  const handleMoveRight = (e) => {
    setPosition((prevPosition) => ({
      x: prevPosition.x - MOVE_FACTOR * 1 / zoom,
      y: prevPosition.y
    }))
    updatePreview(editorRef, setCroppedImage)
  }

  const handleMoveUp = (e) => {
    setPosition((prevPosition) => ({
      x: prevPosition.x,
      y: prevPosition.y + MOVE_FACTOR * 1 / zoom,
    }))
    updatePreview(editorRef, setCroppedImage)
  }

  const handleMoveDown = (e) => {
    setPosition((prevPosition) => ({
      x: prevPosition.x,
      y: prevPosition.y - MOVE_FACTOR * 1 / zoom,
    }))
    updatePreview(editorRef, setCroppedImage)
  }

  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value))
    updatePreview(editorRef, setCroppedImage)
  }

  const handleZoomIn = (e) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom + ZOOM_FACTOR
      updatePreview(editorRef, setCroppedImage)
      return newZoom
    })
  }

  const handleZoomOut = (e) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom - ZOOM_FACTOR
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
    if (delta > 0) {
      setZoom((prevZoom) => Math.max(1, prevZoom - ZOOM_FACTOR * 3))
    } else {
      setZoom((prevZoom) => Math.min(10, prevZoom + ZOOM_FACTOR * 3))
    }

    updatePreview(editorRef, setCroppedImage)
  }

  const calculatePinchDistance = (touches) => {
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch1.clientX - touch2.clientX, 2) +
      Math.pow(touch1.clientY - touch2.clientY, 2)
    )
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      // Handle pinch start
    }
  }

  const handleTouchMove = useCallback((e) => {
    //e.preventDefault()
    if (e.touches.length === 1) {
      // Single finger touch does panning
      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y

      // Normalize the change relative to the editor size
      const normalizedDx = dx / editorDimensions.width * PAN_FACTOR
      const normalizedDy = dy / editorDimensions.height * PAN_FACTOR

      setPosition((prevPosition) => {
        // Ensure the position stays within the bounds [0, 1]
        const newX = Math.min(1, Math.max(0, prevPosition.x - normalizedDx))
        const newY = Math.min(1, Math.max(0, prevPosition.y - normalizedDy))
        return { x: newX, y: newY }
      })

      // Update initial touch position for next move
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      // Two fingers touch does pinch zooming
      const distance = calculatePinchDistance(e.touches)
      if (lastTouchDistance.current !== null) {
        const zoomChange = distance - lastTouchDistance.current
        setZoom((prevZoom) => Math.max(1, prevZoom + zoomChange * ZOOM_FACTOR))
      }
      lastTouchDistance.current = distance
    }
    updatePreview(editorRef, setCroppedImage)
  }, [setZoom, editorDimensions.width, editorDimensions.height, setCroppedImage, editorRef])

  const handleTouchEnd = useCallback((e) => {
    lastTouchDistance.current = null
  }, [])

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
      style={{
        width: `${editorDimensions.width + 40}px`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        className="photo-area"
        style={{
          position: 'relative',
          width: `${editorDimensions.width}px`,
          height: `${editorDimensions.height}px`,
        }}
      >
        {!photo && <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("selectPhotoButton")} />}
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
          />
        )}
        {options.example && (
          <img src="/Example.png" alt="Example" className="example-photo" />
        )}
      </div>
      {photo && options.guide && (
        <GuideDrawer
          guides={guide}
          editorDimensions={{ width: editorDimensions.width, height: editorDimensions.height }} />
      )}
      {photo && (
        <div className="control-container">
          <div className="control-row1">
            <input
              className="slide-control"
              type="range"
              min="1"
              max="5"
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
            />
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
    </article>
  )
}

const RightColumn = ({
  photo,
  options,
  onOptionChange,
  onPhotoLoad,
  croppedImage,
  editorDimensions,
  setEditorDimensions,
  photoGuides,
  exportPhoto,
  setExportPhoto,
  translate,
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
    photo && (<div className="right-column" style={{ width: `${editorDimensions.width / 2}px` }}>
      {croppedImage && (
        <>
          <article className="guides-section guide-instruction">
            <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("loadNewPhotoButton")} />
          </article>
          <article className="preview-container">
            <img src={croppedImage} alt="Cropped preview" className="cropped-preview" height={editorDimensions.height / 2} width={editorDimensions.width / 2} />
            <div className='export-container' style={{ width: `${editorDimensions.width / 2}px` }}>
              <label className="export-label">{translate("widthLabel")}<br />(px)</label>
              <input
                type="number"
                value={exportPhoto.width}
                aria-invalid={!exportPhoto.width_valid}
                onChange={handleWidthChange}
                className="export-input"
                style={{ width: `${editorDimensions.width / 2.9}px` }}
              />
            </div>
            <div className='export-container' style={{ width: `${editorDimensions.width / 2}px` }}>
              <label className="export-label">{translate("heightLabel")}<br />(px)</label>
              <input
                type="number"
                value={exportPhoto.height}
                aria-invalid={!exportPhoto.height_valid}
                onChange={handleHeightChange}
                className="export-input"
                style={{ width: `${editorDimensions.width / 2.9}px` }}
              />
            </div>
            <div className='export-container' style={{ width: `${editorDimensions.width / 2}px` }}>
              <label className="export-label" >{translate("sizeLabel")}<br />(KB)</label>
              <input
                type="number"
                value={exportPhoto.size}
                aria-invalid={!exportPhoto.size_valid}
                onChange={handleSizeChange}
                className="export-input"
                style={{ width: `${editorDimensions.width / 2.9}px` }}
              />
            </div>
            <SaveFileButton
              exportPhoto={exportPhoto}
              croppedImage={croppedImage}
              editorDimensions={editorDimensions}
              translate={translate}
            />
          </article>
        </>
      )}
    </div>)
  )
}

const BuyMeACoffee = ({
  translate,
  coffee,
  setCoffee,
}) => {
  return (<>
    <dialog open={coffee} className='coffee-modal'>
      <article>
        <h2>{translate("buyMeACoffeeTitle")}</h2>
        <div class="grid coffee-method">
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
          <button onClick={() => { setCoffee(false) }}>OK</button>
        </footer>
      </article>
    </dialog>
    <div
      role="button"
      class="outline coffee-button"
      onClick={() => { setCoffee(true) }}>
      {translate("buyMeACoffeeButton")}
    </div>
  </>)
}

// Main App component
const App = () => {
  const [template, setTemplate] = useState(TEMPLATES[0])
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
    width: parseInt(template.width),
    height: parseInt(template.height),
    size: parseInt(template.size),
    ratio: parseInt(template.width) / parseInt(template.height),
    width_valid: true,
    height_valid: true,
    size_valid: true,
  })
  const [coffee, setCoffee] = useState(false)
  const [editorDimensions, setEditorDimentions] = useState({
    width: parseInt(template.width),
    height: parseInt(template.height)
  })

  const editorRef = React.createRef()
  const { translate, translateGuide, setLanguage, getLanguage } = useLanguage()

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
            translateGuide={translateGuide}
            setEditorDimensions={setEditorDimentions}
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
            setEditorDimentions={setEditorDimentions}
            photoGuides={photoGuides}
            translate={translate}
            translateGuide={translateGuide}
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
            setEditorDimentions={setEditorDimentions}
            photoGuides={photoGuides}
            translate={translate}
          />
          <RightColumn
            photo={photo}
            options={options}
            onOptionChange={handleOptionChange}
            onPhotoLoad={handlePhotoLoad}
            croppedImage={croppedImage}
            editorDimensions={editorDimensions}
            setEditorDimentions={setEditorDimentions}
            photoGuides={photoGuides}
            exportPhoto={exportPhoto}
            setExportPhoto={setExportPhoto}
            translate={translate}
          />
        </div>
        <div className="container">
          <BuyMeACoffee
            translate={translate}
            coffee={coffee}
            setCoffee={setCoffee}
          />
        </div>
      </div>
    </div>
  )
}

export default App