import React, { useState, useCallback, useEffect } from 'react'
import AvatarEditor from 'react-avatar-editor'
import imglyRemoveBackground from "@imgly/background-removal"
import ReactGA from 'react-ga4'
import CookieConsent from "react-cookie-consent"
import { useLanguage } from './hooks/useLanguage'  // Update path
import { NavBar, LeftColumn, MiddleColumn, RightColumn } from './components/layout'
import { SaveModal, Disclaimer, BuyMeACoffee, Changelog } from './components/modals'
import Disqus from './components/Disqus'  // Add missing import
import Color from './utils/Color'
import { TEMPLATES } from './templates'
import './App.css'

// Keep the proper imports from constants.js
import {
  INITIAL_ZOOM,
  INITIAL_ROTATION,
  ZOOM_FACTOR,
  MOVE_FACTOR,
  MIN_ZOOM,
  MAX_ZOOM,
  ROTATION_THRESHOLD_DEG,
  EXPORT_WIDTH_LIMIT,
  EXPORT_HEIGHT_LIMIT,
  EXPORT_SIZE_LIMIT,
  DEBOUNCE,
  MAX_EDITOR_WIDTH,
  MAX_EDITOR_HEIGHT,
  MM2INCH
} from './constants'

// Main App component
const App = () => {
  // First, declare all state variables
  const [template, setTemplate] = useState(TEMPLATES[0])
  const [photo, setPhoto] = useState(null)
  const [allowAiModel, setAllowAiModel] = useState(false)
  const [removeBg, setRemoveBg] = useState({ state: false, error: false })
  const [loadingModel, setLoadingModel] = useState(false)
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
    zoom: Math.min(MAX_EDITOR_WIDTH / (parseInt(template.width) / MM2INCH * parseInt(template.dpi)),
                  MAX_EDITOR_HEIGHT / (parseInt(template.height) / MM2INCH * parseInt(template.dpi))),
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
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  
  // Then declare refs and hooks
  const editorRef = React.createRef()
  const { translate, translateObject, setLanguage, getLanguage } = useLanguage()
  
  // Init Google Analytics
  useEffect(() => {
    ReactGA.initialize('G-V3MNPTJ8CY')
    ReactGA.send({ hitType: "pageview", page: window.location.pathname })
  }, [])

  // Define handlePhotoLoad before it's used in photoProps
  const handlePhotoLoad = useCallback(async (photoData) => {
    setOriginalPhoto(photoData)
    setProcessedPhoto(null)
    setAdjustedPhoto(null)
    setPhoto(photoData)
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
  }, [])

  // Then define photoProps
  const photoProps = {
    photo,
    setPhoto,
    zoom,
    setZoom,
    rotation,
    setRotation,
    position,
    setPosition,
    initialDistance,
    setInitialDistance,
    initialAngle,
    setInitialAngle,
    processedPhoto,
    croppedImage,
    onPhotoLoad: handlePhotoLoad
  }

  // Move calculateEditorZoom to utils
  // Remove duplicate calculateEditorZoom function and keep only one instance
  const calculateEditorZoom = useCallback((originalWidth, originalHeight) => {
    return Math.min(MAX_EDITOR_WIDTH / originalWidth, MAX_EDITOR_HEIGHT / originalHeight)
  }, [])

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

  const handleOptionChange = (event) => {
    const { name, checked } = event.target
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }))
  }

  // Move editorProps definition after all useState declarations
  const editorProps = {
    editorRef,
    editorDimensions,
    setEditorDimensions,
    photoGuides: template,
    updatePreview,
    setCroppedImage,
    exportPhoto
  }

  const controlProps = {
    options,
    onOptionChange: handleOptionChange,
    color,
    setColor,
    removeBg,
    setRemoveBg,
    loadingModel,
    allowAiModel,
    setAllowAiModel
  }

  const uiProps = {
    translate,
    translateObject,
    modals,
    setModals,
    getLanguage,
    setLanguage
  }

  const templateProps = {
    template,
    setTemplate,
    exportPhoto,
    setExportPhoto
  }

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

  return (
    <div className="app">
      <div className="banner">
        {translate("jobMessage1")}<a href="mailto:jiataihan.dev@gmail.com">jiataihan.dev@gmail.com</a>{translate("jobMessage2")}
      </div>
      <div className="frame">
        <div className="container">
          <NavBar
            templateProps={templateProps}
            editorProps={editorProps}
            uiProps={uiProps}
          />
        </div>
        <div className="container">
          <LeftColumn
            photoProps={photoProps}
            optionsProps={{ options, onOptionChange: handleOptionChange }}
            editorProps={editorProps}
            uiProps={uiProps}
          />
          <MiddleColumn
            editorProps={editorProps}
            photoProps={photoProps}
            controlProps={controlProps}
            uiProps={uiProps}
          />
          <RightColumn
            editorProps={editorProps}
            photoProps={{
              ...photoProps,
              onPhotoLoad: handlePhotoLoad  // Ensure onPhotoLoad is included
            }}
            exportProps={{ exportPhoto, setExportPhoto }}
            uiProps={uiProps}
          />
          <SaveModal
            editorProps={editorProps}
            photoProps={photoProps}
            uiProps={uiProps}
          />
          <Disclaimer uiProps={uiProps} />
        </div>
        <div className="container">
          <BuyMeACoffee uiProps={uiProps} />
          <Changelog uiProps={uiProps} />
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