import React, { useState, useCallback, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import GuideDrawer from './GuideDrawer'
import guideData from './Templates/PRC_Passport_Photo.json' // Update the path
import './App.css'

const INITIAL_ZOOM = 1.5
const INITIAL_ROTATION = 0
const ZOOM_FACTOR = 0.01
const MOVE_FACTOR = 0.01
const PAN_FACTOR = 0.5

const LeftColumn = ({
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
  editorWidth,
  editorHeight,
  photoGuides,
}) => {
  const {guide} = photoGuides
  const touchStartRef = useRef({ x: null, y: null })
  const lastTouchDistance = useRef(null)
  const [position, setPosition] = useState({ x: editorWidth * 100, y: editorHeight * 100 }) // Weirdly, have to set a out-of-boundary number to make moving working when page is loaded.
  const [isDragging, setIsDragging] = useState(false)
  const mouseStartRef = useRef({ x: null, y: null })

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const dx = (e.clientX - mouseStartRef.current.x) / editorWidth * PAN_FACTOR
      const dy = (e.clientY - mouseStartRef.current.y) / editorHeight * PAN_FACTOR
      setPosition((prevPosition) => ({
        x: Math.min(1, Math.max(0, prevPosition.x - dx)),
        y: Math.min(1, Math.max(0, prevPosition.y - dy))
      }))
      mouseStartRef.current = { x: e.clientX, y: e.clientY }
      updatePreview(editorRef, setCroppedImage)
    }
  }, [editorRef, setCroppedImage, isDragging, editorWidth, editorHeight, setPosition])

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
      const normalizedDx = dx / editorWidth * PAN_FACTOR
      const normalizedDy = dy / editorHeight * PAN_FACTOR

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
  }, [setZoom, editorWidth, editorHeight, setCroppedImage, editorRef])

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
  }, [editorRef, editorWidth, editorHeight, setCroppedImage, handleMouseMove])


  return (
    <article className="left-column"
      style={{
        width: `${editorWidth + 40}px`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        className="photo-area"
        style={{
          position: 'relative',
          width: `${editorWidth}px`,
          height: `${editorHeight}px`,
        }}
      >
        {!photo && <LoadPhotoButton onPhotoLoad={onPhotoLoad} />}
        {photo && (
          <AvatarEditor
            ref={editorRef}
            image={photo}
            width={editorWidth}
            height={editorHeight}
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
          editorDimensions={{ width: editorWidth, height: editorHeight }} />
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


// Function to update the preview
const updatePreview = (editorRef, setCroppedImage) => {
  if (editorRef.current) {
    const canvas = editorRef.current.getImageScaledToCanvas()
    canvas.style.touchAction = 'none'
    setCroppedImage(canvas.toDataURL())
  }
}

// LoadPhotoButton component
const LoadPhotoButton = ({ onPhotoLoad }) => {
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onloadend = () => {
      onPhotoLoad(reader.result)
    }

    if (file) {
      reader.readAsDataURL(file)
    }
  }

  const handleClickBrowse = () => {
    // Trigger the file input when the "Browse..." button is clicked
    document.getElementById('selectedFile').click();
  };

  return (
    <>
      <input type="file" id="selectedFile" style={{ display: 'none' }} onChange={handlePhotoUpload} />
      <div
        role="button"
        tabIndex="0"
        className="load-file-button" // Add the class for styling
        onClick={handleClickBrowse}
      >Select A Photo</div>
    </>
  );
}

// OptionsArea component
const RightColumn = ({
  photo,
  options,
  onOptionChange,
  onPhotoLoad,
  croppedImage,
  onClickSave,
  editorHeight,
  editorWidth,
  photoGuides,
}) => {
  const {guide, instruction} = photoGuides
  return (
    photo && (<div className="right-column grid" style={{ width: `${editorWidth}px` }}>
      <article className="guides-section">
        <small dangerouslySetInnerHTML={{ __html: instruction }} />
      </article>
      <article className="guides-section">
        {guide.map((guide, index) => (
          <div key={index} className="guide-item">
            <kbd className="color-block" style={{ backgroundColor: guide.color, color: "black"}}><small>{guide.index}</small></kbd>
            <small>{guide.instruction}</small>
          </div>
        ))}
      </article>
      {/* <label>
          <input type="checkbox" name="guide" onChange={onOptionChange} /> Display Guide
        </label>
        <label>
          <input type="checkbox" name="instruction" onChange={onOptionChange} /> Display Instruction
        </label> */}
      {croppedImage && (
        <article className="preview-container">
          <img src={croppedImage} alt="Cropped preview" className="cropped-preview" height={editorHeight / 2} width={editorWidth / 2} />
          <div role="button" className="save-button" style={{ width: `${editorWidth / 2}px` }} onClick={onClickSave}>Save</div>
        </article>
      )}
    </div>)
  )
}

// Main App component
const App = () => {
  const [photo, setPhoto] = useState(null)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotation, setRotation] = useState(INITIAL_ROTATION)
  const [options, setOptions] = useState({
    guide: true,
    instruction: true,
    example: false,
  })
  const [croppedImage, setCroppedImage] = useState(null)
  const editorRef = React.createRef()

  const photoGuides = guideData
  const editorWidth = parseInt(guideData.width)
  const editorHeight = parseInt(guideData.height)

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

  const handleSave = () => {
    if (croppedImage) {
      const a = document.createElement('a')
      a.href = croppedImage
      a.download = 'processed-image.jpeg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleOptionChange = (event) => {
    const { name, checked } = event.target
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }))
  }

  return (
    <div className="app">
      <div className="container">
        <LeftColumn
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
          editorWidth={editorWidth}
          editorHeight={editorHeight}
          photoGuides={photoGuides}
        />
        <RightColumn
          photo={photo}
          options={options}
          onOptionChange={handleOptionChange}
          onPhotoLoad={handlePhotoLoad}
          croppedImage={croppedImage}
          onClickSave={handleSave}
          editorHeight={editorHeight}
          editorWidth={editorWidth}
          photoGuides={photoGuides}
        />
      </div>
    </div>
  )
}

export default App