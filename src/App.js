import React, { useState, useCallback, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import imglyRemoveBackground from "@imgly/background-removal"
import ReactGA from 'react-ga4'
//import { Fireworks } from '@fireworks-js/react'
//import AnimatedText from './AnimatedText'
import GuideDrawer from './GuideDrawer'
import { useLanguage } from './translate'
import { generateSingle, handleSaveSingle, generate4x6, handleSave4x6 } from './SaveImage'
import { DiscussionEmbed } from 'disqus-react'
import { Helmet } from 'react-helmet'
import Color from './Color'
import CookieConsent from "react-cookie-consent"
import PRC_Passport_Photo from './Templates/PRC_Passport_Photo.json'
import PRC_Travel_Document from './Templates/PRC_Travel_Document_Photo.json'
import US_Passport_Photo from './Templates/US_Passport_Photo.json'
import Canada_Passport_Photo from './Templates/Canada_Passport_Photo.json'
import Canada_Visa_Photo from './Templates/Canada_Visa_Photo.json'
import Japan_Visa_Photo from './Templates/Japan_Passport_Photo.json'
import Malaysia_Visa_Photo from './Templates/Malaysia_Passport_Photo.json'
import UK_Passport_Photo from './Templates/UK_Passport_Photo.json'
import Germany_Passport_Photo from './Templates/Germany_Passport_Photo.json'
import Australia_Visa_Photo from './Templates/Australia_Passport_Photo.json'
import Mexico_TN_Visa_Photo from './Templates/Mexico_TN_Visa_Photo.json'
import './App.css'
import ChangeLog from './changelog.json'

const INITIAL_ZOOM = 1
const INITIAL_ROTATION = 0
const ZOOM_FACTOR = 1.01
const MOVE_FACTOR = 0.005
const MIN_ZOOM = 0.5
const MAX_ZOOM = 10
const ROTATION_THRESHOLD_DEG = 2
const EXPORT_WIDTH_LIMIT = 2000
const EXPORT_HEIGHT_LIMIT = 2000
const EXPORT_SIZE_LIMIT = 2000
const DEBOUNCE = 250
const TEMPLATES = [
  PRC_Passport_Photo,
  PRC_Travel_Document,
  US_Passport_Photo,
  UK_Passport_Photo,
  Canada_Passport_Photo,
  Canada_Visa_Photo,
  Australia_Visa_Photo,
  Japan_Visa_Photo,
  Malaysia_Visa_Photo,
  Germany_Passport_Photo,
  Mexico_TN_Visa_Photo,
]
const MAX_EDITOR_WIDTH = 330
const MAX_EDITOR_HEIGHT = 480
const MM2INCH = 25.4 // Convert millimeter to inch

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
    ReactGA.event({
      action: 'browsing_file',
      category: 'Button Click',
      label: 'Load Photo',
    })
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
        style={{
          fill: "red",
          backgroundImage: `url(${process.env.PUBLIC_URL + "/year_of_dragon.svg"})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100%",
          backgroundPosition: "bottom right",
        }}
      ><kbd style={{ opacity: "0.5", fontSize: "x-large" }}>{title}</kbd></div>
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
  setCroppedImage,
  updatePreview
}) => {

  const handleTemplateChange = (event) => {
    const selectedTemplateTitle = event.target.value

    // Find the template object that matches the selected title
    const selectedTemplate = TEMPLATES.find((t) => t.title[getLanguage()] === selectedTemplateTitle)

    // Set the selected template
    if (selectedTemplate) {
      ReactGA.event({
        action: selectedTemplate.title[getLanguage()].toLowerCase().replace(/ /g, "_").replace(/\//g, "_"),
        label: selectedTemplate.title[getLanguage()],
      })
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
    ReactGA.event({
      action: isChecked ? 'chinese' : 'english',
      category: 'Switch Toggle',
      label: isChecked ? 'Language to Chinese' : 'Language to English',
    })
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
            中文/English</label>
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
  const { guide, instruction, width, height } = photoGuides
  return (
    photo && (<div className="left-column" style={{ width: `${editorDimensions.width * editorDimensions.zoom}px` }}>
      <article className="guides-section guide-instruction">
        <small>
          {translate("width")}: {width}mm <br/>
          {translate("height")}: {height}mm <br/><br/>
        </small>
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
  removeBg,
  setRemoveBg,
  loadingModel,
  processedPhoto,
  modals,
  setModals,
  allowAiModel,
  setAllowAiModel,
  updatePreview,
  setColor,
  color,
  position,
  setPosition,
}) => {
  const { guide } = photoGuides
  const touchStartRef = useRef({ x: null, y: null })
  const lastTouchDistance = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const mouseStartRef = useRef({ x: null, y: null })
  const debounceTimer = useRef(null)
  // Debounce function that allows immediate invocation
  const debounce = (func, wait, immediate) => {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

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
    }
  }, [isDragging, editorDimensions.width, editorDimensions.height, zoom, setPosition, rotation])

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
  }

  const handleMoveRight = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(-MOVE_FACTOR * 1 / zoom, 0, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
  }

  const handleMoveUp = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(0, MOVE_FACTOR * 1 / zoom, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
  }

  const handleMoveDown = (e) => {
    setPosition((prevPosition) => {
      const adjusted = adjustPositionForRotation(0, -MOVE_FACTOR * 1 / zoom, rotation)
      return {
        x: prevPosition.x + adjusted.x,
        y: prevPosition.y + adjusted.y
      }
    })
    setIsDragging(true)
    mouseStartRef.current = { x: e.clientX, y: e.clientY }
  }


  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value))
  }

  const handleZoomIn = (e) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(prevZoom * ZOOM_FACTOR, MAX_ZOOM)
      return newZoom
    })
  }

  const handleZoomOut = (e) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(prevZoom / ZOOM_FACTOR, MIN_ZOOM)
      return newZoom
    })
  }

  const handleRotateClockwise = () => {
    setRotation((prevRotation) => {
      const newRotation = prevRotation + 0.5
      return newRotation
    })
  }

  const handleRotateCounterclockwise = () => {
    setRotation((prevRotation) => {
      const newRotation = prevRotation - 0.5
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
          if (Math.abs(angleChangeDeg) > ROTATION_THRESHOLD_DEG) {
            setRotation((prevRotation) => prevRotation + angleChangeDeg)
          }
        }

        setInitialDistance(currentDistance) // Update initial distance for next movement
        setInitialAngle(angleRadians) // Update initial angle for next movement
      }
    }
  }, [editorDimensions.width, editorDimensions.height, zoom, initialDistance, setInitialDistance, initialAngle, setInitialAngle, setZoom, rotation, setRotation, setPosition])

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

  const handleBrightnessChange = (e) => {
    const value = e.target.value
    setColor((prevColor) => ({ ...prevColor, brightness: value }))
  }
  const handleBrightnessChangeDebounced = debounce(handleBrightnessChange, DEBOUNCE, true);

  const handleSaturationChange = (e) => {
    const value = e.target.value
    setColor((prevColor) => ({ ...prevColor, saturation: value }))
  }
  const handleSaturationChangeDebounced = debounce(handleSaturationChange, DEBOUNCE, true);

  const handleWarmthChange = (e) => {
    const value = e.target.value
    setColor((prevColor) => ({ ...prevColor, warmth: value }))
  }
  const handleWarmthChangeDebounced = debounce(handleWarmthChange, DEBOUNCE, true);

  const handleContrastChange = (e) => {
    const value = e.target.value
    setColor((prevColor) => ({ ...prevColor, contrast: value }))
  }
  const handleContrastChangeDebounced = debounce(handleContrastChange, DEBOUNCE, true);

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

  let ua = window.navigator.userAgent
  let iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)

  const [activeControlTab, setActiveControlTab] = useState('tab1')

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
          <nav role="control-tabs-switch">
            <ul>
              <li><label
                onClick={() => setActiveControlTab('tab1')}
                className={`control-tab-label ${activeControlTab === 'tab1' ? "" : "inactive-tab"}`}
              >{translate("controlTab1")}</label></li>
              <li><label
                onClick={() => setActiveControlTab('tab2')}
                className={`control-tab-label ${activeControlTab === 'tab2' ? "" : "inactive-tab"}`}
              >{translate("controlTab2")}</label></li>
            </ul>
          </nav>
          <div role="tabs">
            <section>
              {activeControlTab === 'tab1' && (
                <>
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
                  <div className="control-row3 control-row4">
                    <label className="export-label color-label">{translate("zoom")}</label>
                    <input
                      className="slide-control-color"
                      list="slide-markers"
                      type="range"
                      min={MIN_ZOOM}
                      max={MAX_ZOOM}
                      step="0.01"
                      value={zoom}
                      onChange={handleZoomChange}
                    />
                    <datalist id="slide-markers-1">
                      <option value="1"></option>
                    </datalist>
                    <label
                      role="button"
                      className="export-label color-reset"
                      onClick={() => setZoom((zoom) => (1))}
                    >&#8634;</label>
                  </div>
                </>
              )}
              {activeControlTab === 'tab2' && (
                <>
                  <div className="control-row4">
                    <label className="export-label color-label">{translate("brightness")}</label>
                    <input
                      className="slide-control-color"
                      list="slide-markers"
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={color.brightness}
                      onChange={handleBrightnessChangeDebounced}
                    />
                    <datalist id="slide-markers-2">
                      <option value="0"></option>
                    </datalist>
                    <label
                      role="button"
                      className="export-label color-reset"
                      onClick={() => setColor((prevColor) => ({ ...prevColor, brightness: 0 }))}
                    >&#8634;</label>
                  </div>
                  <div className="control-row4">
                    <label className="export-label color-label">{translate("saturation")}</label>
                    <input
                      className="slide-control-color"
                      list="slide-markers"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={color.saturation}
                      onChange={handleSaturationChangeDebounced}
                    />
                    <datalist id="slide-markers-3">
                      <option value="0"></option>
                    </datalist>
                    <label
                      role="button"
                      className="export-label color-reset"
                      onClick={() => setColor((prevColor) => ({ ...prevColor, saturation: 0 }))}
                    >&#8634;</label>
                  </div>
                  <div className="control-row4">
                    <label className="export-label color-label">{translate("warmth")}</label>
                    <input
                      className="slide-control-color"
                      list="slide-markers"
                      type="range"
                      min="-25"
                      max="25"
                      step="1"
                      value={color.warmth}
                      onChange={handleWarmthChangeDebounced}
                    />
                    <datalist id="slide-markers-4">
                      <option value="0"></option>
                    </datalist>
                    <label
                      role="button"
                      className="export-label color-reset"
                      onClick={() => setColor((prevColor) => ({ ...prevColor, warmth: 0 }))}
                    >&#8634;</label>
                  </div>
                  <div className="control-row4">
                    <label className="export-label color-label">{translate("contrast")}</label>
                    <input
                      className="slide-control-color"
                      list="slide-markers"
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={color.contrast}
                      onChange={handleContrastChangeDebounced}
                    />
                    <datalist id="slide-markers-5">
                      <option value="0"></option>
                    </datalist>
                    <label
                      role="button"
                      className="export-label color-reset"
                      onClick={() => setColor((prevColor) => ({ ...prevColor, contrast: 0 }))}
                    >&#8634;</label>
                  </div>
                </>
              )}
            </section>
          </div>
          <dialog open={modals.aiModel} className='modal'>
            <article>
              <h4>{translate("aiConfirmTitle")}</h4>
              <small>{translate("aiConfirmText")}</small>
              <footer>
                <button onClick={() => {
                  setModals((prevModals) => ({ ...prevModals, aiModel: false }))
                  setAllowAiModel(true)
                }}>
                  {translate("yesButton")}
                </button>
                <button onClick={() => {
                  setModals((prevModals) => ({ ...prevModals, aiModel: false }))
                  setAllowAiModel(false)
                }}>
                  {translate("noButton")}
                </button>
              </footer>
            </article>
          </dialog>
          <div className="control-row1">
            <small>
              <label>
                <input
                  disabled={iOS}
                  type="checkbox"
                  role="switch"
                  checked={removeBg.state && allowAiModel}
                  onChange={(e) => {
                    setRemoveBg({ state: e.target.checked, error: false })
                    if (!allowAiModel) setModals((prevModals) => ({ ...prevModals, aiModel: true }))
                    ReactGA.event({
                      action: e.target.checked ? 'ai_enabled' : 'ai_disabled',
                      category: 'Switch Toggle',
                      label: e.target.checked ? 'AI Enabled' : 'AI Disabled',
                    })
                  }}
                />{removeBg.state && loadingModel ? translate("backgroundRemovalProcessing") : translate("backgroundRemovalLabel")}
              </label>
            </small>
            <div aria-busy={removeBg.state && loadingModel}></div>
          </div>
          {removeBg.state && loadingModel && (<div className="control-row3">
            <small>{translate("backgroundRemovalReminder")}</small>
          </div>)}
          {removeBg.error && !processedPhoto && (<div className="control-row3" style={{ color: "red" }}>
            <small>{translate("backgroundRemovalError")}</small>
          </div>)}
          {iOS && (<div className="control-row3" style={{ color: "red" }}>
            <small>{translate("backgroundRemovalIOS")}</small>
          </div>)}
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
        ...prevState, height: newHeight, width: newWidth, height_valid: true
      }))
    } else setExportPhoto((prevState) => ({
      ...prevState, height: newHeight, height_valid: false
    }))
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
        ...prevState, size: newSize, size_valid: true
      }))
    } else setExportPhoto((prevState) => ({
      ...prevState, size: newSize, size_valid: false
    }))
    ReactGA.event({
      action: 'change_size',
      category: 'Export Area',
      label: 'Change size',
    })
  }

  return (
    photo && (<div className="right-column" style={{ width: `${editorDimensions.width * editorDimensions.zoom / 2}px` }}>
      {croppedImage && (
        <>
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
              onClick={() => {
                setModals((prevModals) => ({ ...prevModals, save: true }))
                ReactGA.event({
                  action: 'generate_photo',
                  category: 'Button Click',
                  label: 'Generate photo',
                })
              }}
            >{translate("saveTitle")}</div>
          </article>
          <article className="guides-section guide-instruction">
            <LoadPhotoButton onPhotoLoad={onPhotoLoad} title={translate("loadNewPhotoButton")} />
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
  const [copied, setCopied] = useState(false)
  const kbdRef = useRef(null)
  const handleCopy = () => {
    const emailText = 'hjt486@gmail.com'
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailText).then(() => {
        setCopied(true)
      }).catch((error) => {
        console.error('Error copying text:', error)
      })
    } else {
      // Clipboard API not supported, provide a fallback action here
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

  return (<>
    <dialog open={modals.coffee} className='modal'>
      <article>
        <h2>{translate("buyMeACoffeeTitle")}</h2>
        <div>
          <div className="save-option-container">
            <div className="save-option">
              <img src="https://jiataihan.dev/assets/css/hid.hid" width={300} alt="WeChat" className="wechat-logo" />
              <p className="save-text" >{translate("buyMeACoffeeWeChat")}</p>
            </div>
            <div className="save-option">
              {/* <img src={process.env.PUBLIC_URL + "/BuyMeACoffee/zelle.png"} width={300} alt="Zelle" className="zelle-logo" /> */}
              <img src={process.env.PUBLIC_URL + "/BuyMeACoffee/paypal.png"} width={300} alt="Paypal" className="paypal-logo" />
              <textarea id="emailAddress" hidden="true">hjt486@gmail.com</textarea>
              <div>
                <kbd onClick={handleCopy} ref={kbdRef} className="save-text">hjt486@gmail.com</kbd>
                {copied && (<sup><kbd style={{ fontSize: "xx-small", color: "var(--pico-color)", background: "var(--pico-primary-background)" }}>{translate("buyMeCopied")}</kbd></sup>)}
              </div>
              <p className="save-text" >{translate("buyMeACoffeePaypalZelle")}</p>
            </div>
          </div>
          <p className="save-text" >{translate("buyMeACoffeeWords")}</p>
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
  const [isSaveLoading, setIsSaveLoading] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [loadCounter, setLoadCounter] = useState(0)

  // fireworks
  // const ref = useRef(null)
  // const startFireworks = () => {
  //   if (ref.current) {
  //     ref.current.start()
  //   }
  // }
  // const stopFireworks = () => {
  //   if (ref.current) {
  //     ref.current.stop()
  //   }
  // }
  // useEffect(() => {
  //   if (modals.save) {
  //     startFireworks()
  //   } else {
  //     stopFireworks()
  //   }
  // }, [modals.save])

  const initiateLoading = () => {
    setIsSaveLoading(true)
    setLoadCounter(2) // Expecting two async operations
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
        {/* <AnimatedText
          text1={translate("anmiatedText1")}
          text2={translate("anmiatedText2")}
        /> */}
        <article>
          <h2>{isSaveLoading ? translate("saveGenerating") : translate("saveTitle")}</h2>
          <div aria-busy={isSaveLoading} >
            {!isSaveLoading && (<div className="save-option-container">
              <div className="save-option">
                <img src={imageSingleSrc || croppedImage} alt="Save preview" className="save-preview" height={editorDimensions.height * editorDimensions.zoom / 2} width={editorDimensions.width * editorDimensions.zoom / 2} />
                <p className="save-text" >{translate("saveSingleText")}</p>
                <div
                  role="button"
                  className="save-option-button"
                  disabled={!imageSingleSrc}
                  onClick={() => {
                    imageSingleSrc && handleSaveSingle(imageSingleSrc)
                    ReactGA.event({
                      action: 'save_single_photo',
                      category: 'Button Click',
                      label: 'Save single photo',
                    })
                  }}
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
                  onClick={() => {
                    image4x6Src && handleSave4x6(image4x6Src)
                    ReactGA.event({
                      action: 'save_4x6_photo',
                      category: 'Button Click',
                      label: 'Save 4x6 Photo',
                    })
                  }}
                >{translate("save4x6")}</div>
              </div>
            </div>)}
          </div>
          <footer>
            <button onClick={() => setModals((prevModals) => ({ ...prevModals, save: false }))}>OK</button>
          </footer>
        </article>
        {/* <Fireworks
          ref={ref}
          options={{
            hue: { min: 0, max: 360 },
            acceleration: 1.05,
            opacity: 0.1,
            particles: 180,
            traceLength: 2,
          }}
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            position: 'fixed',
            zIndex: -1,
          }}
        /> */}
      </dialog>
    </>
  )
}

const Disclaimer = ({
  translate,
  modals,
  setModals,
  croppedImage,
}) => {
  return (
    <>
      <dialog open={modals.disclaimer} className='modal'>
        <article>
          <h4>{translate("disclaimerModalTitle")}</h4>
          <small><b>{translate("disclaimerTitle")}</b></small>
          <small>{translate("disclaimer")}</small>
          <br />
          <small><b>{translate("datePrivacyTitle")}</b></small>
          <small>{translate("disclaimer2")}</small>
          <footer>
            <button onClick={() => setModals((prevModals) => ({ ...prevModals, disclaimer: false }))}>{translate("agreeButton")}</button>
            <button onClick={() => { window.location.href = 'https://www.google.com' }}>{translate("disagreeButton")}</button>
          </footer>
        </article>
      </dialog>
    </>
  )
}

const Disqus = ({
  template,
  getLanguage,
  translateObject
}) => {
  function formatStringForURL(inputString) {
    // Convert the string to lowercase
    let formattedString = inputString.toLowerCase()

    // Replace non-compatible URL characters with underscores
    formattedString = formattedString.replace(/[/\\:,.?!"'(){}[\]<>^*%&@#$+=|~`\s]/g, '_')

    // Remove consecutive underscores
    formattedString = formattedString.replace(/_+/g, '_')

    // Remove leading and trailing underscores
    formattedString = formattedString.replace(/^_+|_+$/g, '')

    return formattedString
  }

  // Function to reload Disqus plugin
  const reloadDisqusPlugin = () => {
    if (typeof window.DISQUS !== 'undefined') {
      window.DISQUS.reset({ reload: true })
    }
  }

  // Effect hook to listen for changes in color scheme and reload Disqus
  useEffect(() => {
    const colorSchemeListener = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => {
      reloadDisqusPlugin()
    }
    colorSchemeListener.addEventListener('change', handleChange)
    return () => {
      colorSchemeListener.removeEventListener('change', handleChange)
    }
  }, [])

  // console.log("DEBUG: url:", 'https://jiataihan.dev/passport-photo-maker/' + formatStringForURL(translateObject(template.title)))
  // console.log("DEBUG: identifier:", formatStringForURL(translateObject(template.title)))

  return (
    <>
      <Helmet>
        <script src="https://YOUR_DISQUS_SHORTNAME.disqus.com/embed.js" async></script>
      </Helmet>
      <DiscussionEmbed
        className="test"
        key={formatStringForURL(translateObject(template.title))}
        shortname='passport-photo-maker'
        config={
          {
            url: 'https://jiataihan.dev/passport-photo-maker/' + formatStringForURL(translateObject(template.title)),
            identifier: 'https://jiataihan.dev/passport-photo-maker/' + formatStringForURL(translateObject(template.title)),
            title: translateObject(template.title),
            language: getLanguage() === "zh" ? 'zh' : 'en_US'
          }
        }
      />
    </>
  )
}

// Main App component
const App = () => {
  // Init Google Analytics
  useEffect(() => {
    ReactGA.initialize('G-V3MNPTJ8CY')
    ReactGA.send({ hitType: "pageview", page: window.location.pathname })
  }, [])

  const [template, setTemplate] = useState(TEMPLATES[0]) // Default is China
  const [photo, setPhoto] = useState(null)
  const [allowAiModel, setAllowAiModel] = useState(false)
  const [removeBg, setRemoveBg] = useState({ state: false, error: false }) // Toggle for background removal
  const [loadingModel, setLoadingModel] = useState(false) // State for loading model 
  const [originalPhoto, setOriginalPhoto] = useState(null)
  const [processedPhoto, setProcessedPhoto] = useState(null)
  const [adjustedPhoto, setAdjustedPhoto] = useState(null)
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
  const [modals, setModals] = useState({ coffee: false, changelog: false, save: false, disclaimer: false, aiModel: false })
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
  const [color, setColor] = useState({
    brightness: 0,
    saturation: 0,
    warmth: 0,
    contrast: 0,
  })
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 }) // Weirdly, have to set a out-of-boundary number to make moving working when page is loaded.

  const editorRef = React.createRef()
  const { translate, translateObject, setLanguage, getLanguage } = useLanguage()

  const photoGuides = template

  // Function to update the preview
  const updatePreview = (editorRef, setCroppedImage) => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas()
      canvas.style.touchAction = 'none'
      setCroppedImage(canvas.toDataURL())
    }
  }

  const processPhotoForBgRemoval = useCallback(async (photoData) => {
    setLoadingModel(true)

    const configs = [
      {
        debug: true,
        model: "medium",
        publicPath: window.location.href + "/ai-assets/dist/"
      },
      { // If can't load local model, try remote one.
        debug: true,
        model: "medium",
      }
    ]

    for (const config of configs) {
      try {
        const resultBlob = await imglyRemoveBackground(photoData, config)
        const url = URL.createObjectURL(resultBlob)
        setProcessedPhoto(url)
        setLoadingModel(false)
        return // Exit the loop if successful
      } catch (error) {
        console.error('Background removal error:', error)
        // Continue to the next configuration in case of an error
      }
    }

    // If all configurations fail, set error state
    setRemoveBg({ state: false, error: true })
    setLoadingModel(false)
  }, [])


  const handlePhotoLoad = useCallback(async (photoData) => {
    setOriginalPhoto(photoData)
    setProcessedPhoto(null)
    setAdjustedPhoto(null)
    setPhoto(photo)
    setRemoveBg({ state: false, error: false })
    setZoom(INITIAL_ZOOM)
    setRotation(INITIAL_ROTATION)
    setModals((prevModals) => ({ ...prevModals, disclaimer: true }))
    setColor({
      brightness: 0,
      saturation: 0,
      warmth: 0,
      contrast: 0,
    })
  }, [editorRef, photo])

  useEffect(() => {
    const adjustImageAndSetPhoto = () => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)

        // Apply color adjustments here
        Color(canvas, color)

        const newImageUrl = canvas.toDataURL()
        setAdjustedPhoto(newImageUrl)
      }
      image.src = removeBg.state && processedPhoto ? processedPhoto : originalPhoto
    }
    adjustImageAndSetPhoto()
  }, [color, removeBg, processedPhoto, originalPhoto])

  // Update the photo state when removeBg changes
  useEffect(() => {
    if (adjustedPhoto) {
      setPhoto(adjustedPhoto)
      setTimeout(() => updatePreview(editorRef, setCroppedImage), 100) // Update preview immediately after setting photo
    }
    else if (removeBg.state && processedPhoto) {
      setPhoto(processedPhoto)
      setTimeout(() => updatePreview(editorRef, setCroppedImage), 100) // Update preview immediately after setting photo
    }
    else {
      setPhoto(originalPhoto)
      setTimeout(() => updatePreview(editorRef, setCroppedImage), 100) // Update preview immediately after setting photo
    }
  }, [originalPhoto, processedPhoto, adjustedPhoto, editorRef, adjustedPhoto, updatePreview])

  useEffect(() => {
    if (removeBg.state && originalPhoto && !processedPhoto && allowAiModel) {
      processPhotoForBgRemoval(originalPhoto)
    }
  }, [removeBg, originalPhoto, processedPhoto, processPhotoForBgRemoval, allowAiModel])

  const handleOptionChange = (event) => {
    const { name, checked } = event.target
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }))
  }

  return (
    <div className="app">
      <div class="banner">
      {translate("jobMessage1")}<a href="mailto:jiataihan.dev@gmail.com">jiataihan.dev@gmail.com</a>{translate("jobMessage2")}
  </div>
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
            updatePreview={updatePreview}
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
            removeBg={removeBg}
            setRemoveBg={setRemoveBg}
            loadingModel={loadingModel}
            processedPhoto={processedPhoto}
            modals={modals}
            setModals={setModals}
            allowAiModel={allowAiModel}
            setAllowAiModel={setAllowAiModel}
            updatePreview={updatePreview}
            setColor={setColor}
            color={color}
            position={position}
            setPosition={setPosition}
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
          <Disclaimer
            translate={translate}
            modals={modals}
            setModals={setModals}
            croppedImag={croppedImage}
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
            className="outline modal-button"
          >
            <a
              target="_blank"
              rel="noreferrer"
              href="https://github.com/hjt486/passport-photo-maker/issues"
              onClick={() => {
                ReactGA.event({
                  action: 'feedback',
                  category: 'Button Click',
                  label: 'Feedback',
                })
              }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >{translate("feedback")}</a>
          </div>
        </div>
        <Disqus
          className="container"
          template={template}
          getLanguage={getLanguage}
          translateObject={translateObject}
        />
        <CookieConsent
          //debug={true}
          flipButtons={true}
          overlay={true}
          acceptOnOverlayClick={true}
          enableDeclineButton
          onDecline={() => {
            window.location.href = 'https://www.google.com'
          }}
          visible="byCookieValue"
          hideOnAccept={true}
          location="bottom"
          buttonText={translate("Agree")}
          declineButtonText={translate("Disagree")}
          style={{
            alignItems: "center",
            color: "var(--pico-contrast)",
            background: "var(--pico-form-element-selected-background-color)"
          }}
          buttonStyle={{}}
        >
          {translate("disclaimer3")}
        </CookieConsent>
      </div>
    </div>
  )
}

export default App