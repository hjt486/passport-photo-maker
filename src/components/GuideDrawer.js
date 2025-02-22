import React from 'react'

const GuideDrawer = ({ guides, editorDimensions }) => {
  // Add guard clause for undefined guides
  if (!guides) return null

  // Update to handle both old and new guide formats
  const normalizedGuides = Array.isArray(guides) ? guides : guides.guide

  return (
    <svg
      width={editorDimensions.width * editorDimensions.zoom}
      height={editorDimensions.height * editorDimensions.zoom}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        transform: `scale(${1/editorDimensions.zoom})`
      }}
    >
      {normalizedGuides.map((guide, index) => {
        // Convert old format guides to new format if needed
        const guideData = guide.type ? guide : {
          type: 'rect',
          x: parseInt(guide.start_x),
          y: parseInt(guide.start_y),
          width: parseInt(guide.width),
          height: parseInt(guide.height)
        }

        return (
          <rect
            key={index}
            x={guideData.x}
            y={guideData.y}
            width={guideData.width}
            height={guideData.height}
            fill={guide.color || "none"}
            stroke={guide.color || "red"}
            strokeWidth="1"
            opacity={guide.opacity || "0.5"}
          />
        )
      })}
    </svg>
  )
}

export default GuideDrawer