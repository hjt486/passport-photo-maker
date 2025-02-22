import React, { useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import GuideDrawer from '../GuideDrawer'
import ReactGA from 'react-ga4'
import { MIN_ZOOM, MAX_ZOOM, ROTATION_THRESHOLD_DEG } from '../../constants'
import { ZOOM_FACTOR } from '../../constants'

const MiddleColumn = ({ 
  editorProps, 
  photoProps, 
  controlProps, 
  uiProps 
}) => {
  const { 
    editorRef,
    editorDimensions,
    photoGuides,
    updatePreview,
    setCroppedImage
  } = editorProps;

  const {
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
    processedPhoto
  } = photoProps;

  const {
    options,
    color,
    setColor,
    removeBg,
    setRemoveBg,
    loadingModel,
    allowAiModel,
    setAllowAiModel
  } = controlProps;

  const {
    translate,
    modals,
    setModals
  } = uiProps;

  const [activeTab, setActiveTab] = useState('transform');

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      setInitialDistance(Math.sqrt(dx * dx + dy * dy));
      setInitialAngle(Math.atan2(dy, dx) * 180 / Math.PI);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      const currentDistance = Math.sqrt(dx * dx + dy * dy)
      const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI
      
      if (initialDistance) {
        const scale = currentDistance / initialDistance
        setZoom(prevZoom => {
          const newZoom = prevZoom * scale
          return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
        })
      }
      
      if (initialAngle !== null) {
        const angleDiff = currentAngle - initialAngle
        if (Math.abs(angleDiff) > ROTATION_THRESHOLD_DEG) {
          setRotation(prevRotation => prevRotation + angleDiff)
          setInitialAngle(currentAngle)
        }
      }
      
      setInitialDistance(currentDistance)
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(null);
    setInitialAngle(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
    setZoom(prevZoom => {
      const newZoom = prevZoom * scale;
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    });
  };

  const handlePositionChange = (position) => {
    setPosition(position);
  };

  const handleColorChange = (type, value) => {
    setColor(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="middle-column">
      {photo && (
        <>
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ touchAction: 'none' }}
          >
            <AvatarEditor
              ref={editorRef}
              image={photo}
              width={editorDimensions.width}
              height={editorDimensions.height}
              border={0}
              scale={zoom}
              rotate={rotation}
              position={position}
              onPositionChange={handlePositionChange}
              onImageReady={() => updatePreview(editorRef, setCroppedImage)}
              onImageChange={() => updatePreview(editorRef, setCroppedImage)}
              style={{ touchAction: 'none' }}
            />
            {options.guide && <GuideDrawer guides={photoGuides.guides} editorDimensions={editorDimensions} />}
          </div>
          <div className="control-tabs">
            <div className="tab-buttons">
              <button
                className={activeTab === 'transform' ? 'active' : ''}
                onClick={() => setActiveTab('transform')}
              >
                {translate("controlTab1")}
              </button>
              <button
                className={activeTab === 'color' ? 'active' : ''}
                onClick={() => setActiveTab('color')}
              >
                {translate("controlTab2")}
              </button>
            </div>
            {activeTab === 'transform' ? (
              <div className="transform-controls">
                <div className="control-group">
                  <label>{translate("zoomLabel")}</label>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                </div>
                <div className="control-group">
                  <label>{translate("rotateLabel")}</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                  />
                </div>
                <div className="control-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={removeBg.state}
                      onChange={() => {
                        if (!allowAiModel) {
                          setModals(prev => ({ ...prev, aiModel: true }));
                        } else {
                          setRemoveBg(prev => ({ ...prev, state: !prev.state }));
                        }
                      }}
                    />
                    {translate("removeBgLabel")}
                  </label>
                  {loadingModel && <div aria-busy="true">{translate("removeBgLoading")}</div>}
                </div>
              </div>
            ) : (
              <div className="color-controls">
                <div className="control-group">
                  <label>{translate("brightnessLabel")}</label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={color.brightness}
                    onChange={(e) => handleColorChange('brightness', parseInt(e.target.value))}
                  />
                </div>
                <div className="control-group">
                  <label>{translate("contrastLabel")}</label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={color.contrast}
                    onChange={(e) => handleColorChange('contrast', parseInt(e.target.value))}
                  />
                </div>
                <div className="control-group">
                  <label>{translate("saturationLabel")}</label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={color.saturation}
                    onChange={(e) => handleColorChange('saturation', parseInt(e.target.value))}
                  />
                </div>
                <div className="control-group">
                  <label>{translate("warmthLabel")}</label>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={color.warmth}
                    onChange={(e) => handleColorChange('warmth', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MiddleColumn;