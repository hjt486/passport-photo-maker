import React, { useState, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import "./GuideDrawer.css"

const GuideDrawer = ({ guides, editorDimensions }) => {
  const [positions, setPositions] = useState({});

  const preventDefault = useCallback((e) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    // Attach preventDefault to each guide shape
    const guideShapes = document.querySelectorAll('.guide-shape');
    guideShapes.forEach(shape => {
      shape.addEventListener('wheel', preventDefault, { passive: false });
    });

    return () => {
      // Detach preventDefault from each guide shape
      guideShapes.forEach(shape => {
        shape.removeEventListener('wheel', preventDefault, { passive: false });
      });
    };
  }, [guides, preventDefault]);

  const handleDragStop = (group, e, data) => {
    // Check movability constraints for the group
    const isVerticallyMovable = group.every(guide => guide.isVerticalMovable);
    const isHorizontallyMovable = group.every(guide => guide.isHorizontalMovable);

    setPositions(prev => {
      const prevPosition = prev[group[0].group] || { x: 0, y: 0 };
      return {
        ...prev,
        [group[0].group]: {
          x: isHorizontallyMovable ? data.x : prevPosition.x,
          y: isVerticallyMovable ? data.y : prevPosition.y
        }
      };
    });
  };

  const groupedGuides = guides.reduce((acc, guide) => {
    acc[guide.group] = acc[guide.group] || [];
    acc[guide.group].push(guide);
    return acc;
  }, {});

  return Object.values(groupedGuides).map((group, index) => {
    let axis = 'none';
    if (group.some(guide => guide.isVerticalMovable) && group.some(guide => guide.isHorizontalMovable)) {
      axis = 'both';
    } else if (group.some(guide => guide.isVerticalMovable)) {
      axis = 'y';
    } else if (group.some(guide => guide.isHorizontalMovable)) {
      axis = 'x';
    }

    const position = positions[group[0].group] || { x: 0, y: 0 };

    return (
      <Draggable
        key={index}
        axis={axis}
        position={position}
        onStop={(e, data) => handleDragStop(group, e, data)}

        bounds={{
          left: -group[0].start_x,
          top: -group[0].start_y,
          right: editorDimensions.width - group[0].width - group[0].start_x, // Subtract the width of the guide
          bottom: editorDimensions.height - group[0].height - group[0].start_y, // Subtract the height of the guide
        }}
      >
        <div style={{ position: 'absolute' }}>
          {group.map((guide, guideIndex) => {
            const { start_x, start_y, width, height, color, opacity, index } = guide;
            const centerX = width / 2; // Calculate the horizontal center
            const centerY = height / 2; // Calculate the vertical center
            return (
              <div
                key={guideIndex}
                className="guide-shape"
                style={{
                  position: 'absolute',
                  left: `${start_x}px`,
                  top: `${start_y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: color,
                  opacity: opacity,
                  zIndex: 1000
                }}
              >
                <span 
                  className="guide-number"
                  style={{
                    position: 'absolute',
                    left: `${centerX - 14}px`,
                    top: `${centerY - 14}px`,
                    color: "black",
                    width: "28px",
                    textAlign: "center",
                    backgroundColor: 'rgba(256, 256, 256, 0.5)',
                    zIndex: 1001
                  }}
                ><small>{index}</small></span>
              </div>
            );
          })}
        </div>
      </Draggable>
    );
  });
};

export default GuideDrawer;
