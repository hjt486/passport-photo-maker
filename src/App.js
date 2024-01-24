import React, { useState, useCallback, useEffect } from 'react';
import AvatarEditor from 'react-avatar-editor';
import GuideDrawer from './GuideDrawer';
import guideData from './Templates/PRC_Passport_Photo.json'; // Update the path
import './App.css';

const INITIAL_ZOOM = 1;
const INITIAL_ROTATION = 0;

const LeftColumn = ({
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
  const handleDrag = () => {
    // Update the preview when a drag event occurs
    updatePreview(editorRef, setCroppedImage);
  };

  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value));
    updatePreview(editorRef, setCroppedImage);
  };

  const handleZoomIn = (e) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom + 0.01;
      updatePreview(editorRef, setCroppedImage);
      return newZoom;
    });
  };

  const handleZoomOut = (e) => {
    setZoom((prevZoom) => {
      const newZoom = prevZoom - 0.01;
      updatePreview(editorRef, setCroppedImage);
      return newZoom;
    });
  };

  const handleRotateClockwise = () => {
    setRotation((prevRotation) => {
      const newRotation = prevRotation + 0.5;
      updatePreview(editorRef, setCroppedImage);
      return newRotation;
    });
  };

  const handleRotateCounterclockwise = () => {
    setRotation((prevRotation) => {
      const newRotation = prevRotation - 0.5;
      updatePreview(editorRef, setCroppedImage);
      return newRotation;
    });
  };

  const handleMouseScroll = (event) => {
    const delta = event.deltaY;
    if (delta > 0) {
      setZoom((prevZoom) => Math.max(1, prevZoom - 0.05));
    } else {
      setZoom((prevZoom) => Math.min(10, prevZoom + 0.05));
    }

    updatePreview(editorRef, setCroppedImage, rotation);
  };

  const preventDefault = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleMouseEnter = () => {
    // Prevent scroll when the mouse enters
    document.addEventListener('wheel', preventDefault, { passive: false });
  };

  const handleMouseLeave = () => {
    // Allow scroll when the mouse leaves
    document.removeEventListener('wheel', preventDefault, { passive: false });
  };

  useEffect(() => {
    const photoArea = document.querySelector('.photo-area');
    if (photoArea) {
      photoArea.addEventListener('wheel', preventDefault, { passive: false });
      return () => photoArea.removeEventListener('wheel', preventDefault, { passive: false });
    }
  }, [preventDefault]);

  return (
    <div className="left-column"
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
        {!photo && <>No Photo is Loaded</>}
        {photo && (
          <AvatarEditor
            ref={editorRef}
            image={photo}
            width={editorWidth}
            height={editorHeight}
            color={[255, 255, 255, 0.6]} // RGBA
            scale={zoom}
            border={1}
            rotate={rotation}
            onPositionChange={handleDrag}
            onWheel={handleMouseScroll}
          />
        )}
        {options.example && (
          <img src="/Example.png" alt="Example" className="example-photo" />
        )}
      </div>
      {photo && options.guide && (
        <GuideDrawer guides={photoGuides} editorDimensions={{ width: editorWidth, height: editorHeight }} />
      )}
      {photo && (
        <div className="controls">
          <input
            type="range"
            min="1"
            max="5"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
          />
          <button onClick={handleZoomOut}>-</button>
          <button onClick={handleZoomIn}>+</button>
          <button onClick={handleRotateCounterclockwise}>⤽</button>
          <button onClick={handleRotateClockwise}>⤼</button>
        </div>
      )}
    </div>
  );
};


// Function to update the preview
const updatePreview = (editorRef, setCroppedImage) => {
  if (editorRef.current) {
    const canvas = editorRef.current.getImageScaledToCanvas();
    setCroppedImage(canvas.toDataURL());
  }
};

// LoadPhotoButton component
const LoadPhotoButton = ({ onPhotoLoad }) => {
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    console.log("Loaded photo:", file);

    reader.onloadend = () => {
      onPhotoLoad(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <input type="file" onChange={handlePhotoUpload} />
  );
};

// OptionsArea component
const RightColumn = ({ photo, options, onOptionChange, onPhotoLoad, croppedImage, onClickSave }) => {
  return (
    <div className="right-column">
      <LoadPhotoButton onPhotoLoad={onPhotoLoad} />
      {photo && (<div className="option-area">
        {/* <label>
          <input type="checkbox" name="guide" onChange={onOptionChange} /> Display Guide
        </label>
        <label>
          <input type="checkbox" name="instruction" onChange={onOptionChange} /> Display Instruction
        </label> */}
        <label>
          <input type="checkbox" name="example" onChange={onOptionChange} /> Display Example Photo
        </label>
        {croppedImage && (
          <div className="preview-container">
            <img src={croppedImage} alt="Cropped preview" className="cropped-preview" />
          </div>
        )}
        <button onClick={onClickSave}>Save</button>
      </div>)}
    </div>
  );
};

// Main App component
const App = () => {
  const [photo, setPhoto] = useState(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [rotation, setRotation] = useState(INITIAL_ROTATION);
  const [options, setOptions] = useState({
    guide: true,
    instruction: true,
    example: false,
  });
  const [croppedImage, setCroppedImage] = useState(null);
  const editorRef = React.createRef();

  const photoGuides = guideData.guide;
  const editorWidth = parseInt(guideData.width);
  const editorHeight = parseInt(guideData.height);

  const handlePhotoLoad = useCallback((photoData) => {
    setPhoto(photoData);
    setZoom(INITIAL_ZOOM); // Reset zoom to initial value
    setRotation(INITIAL_ROTATION); // Reset rotation to initial value
    setTimeout(() => updatePreview(editorRef, setCroppedImage, rotation), 0);
  }, [editorRef, rotation]);

  useEffect(() => {
    if (photo) {
      updatePreview(editorRef, setCroppedImage);
    }
  }, [photo, zoom, rotation, editorRef]);

  const handleSave = () => {
    if (croppedImage) {
      const a = document.createElement('a');
      a.href = croppedImage;
      a.download = 'cropped-image.jpeg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOptionChange = (event) => {
    const { name, checked } = event.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  return (
    <div className="app">
      <div className="container">
        <LeftColumn
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
        />
      </div>
    </div>
  );
};

export default App;