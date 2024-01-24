import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Tooltip } from 'react-tooltip';
import "./GuideDrawer.css"

const GuideDrawer = ({ guides, editorDimensions }) => {
  const [positions, setPositions] = useState({});

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
            const { start_x, start_y, width, height, color, opacity, instruction } = guide;
            return (
              <div
                key={guideIndex}
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
                data-tooltip-id={`tooltip-${group[0].group}-${guideIndex}`}
                data-tooltip-content={instruction}
                data-tooltip-place="top"
              >
                <Tooltip opacity={1}
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                  }}
                  id={`tooltip-${group[0].group}-${guideIndex}`} effect="solid" place="top" />
              </div>

            );
          })}
        </div>
      </Draggable>
    );
  });
};

export default GuideDrawer;
