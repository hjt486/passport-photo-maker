import React from 'react'
import ReactGA from 'react-ga4'
import { MM2INCH, MAX_EDITOR_WIDTH, MAX_EDITOR_HEIGHT } from '../../constants'
import { TEMPLATES } from '../../templates'

const NavBar = ({
  templateProps,
  editorProps,
  uiProps
}) => {
  const {
    template,
    setTemplate,
    exportPhoto,
    setExportPhoto
  } = templateProps

  const {
    editorRef,
    setEditorDimensions,
    setCroppedImage,
    updatePreview,
    calculateEditorZoom
  } = editorProps

  const {
    getLanguage,
    setLanguage,
    translate,
    translateObject
  } = uiProps

  const handleTemplateChange = (event) => {
    const selectedTemplate = TEMPLATES.find(t => t.title[getLanguage()] === event.target.value)
    if (!selectedTemplate) return;
    
    setTemplate(selectedTemplate)
    
    // Calculate dimensions once to ensure consistency
    const width = parseInt(parseInt(selectedTemplate.width) / MM2INCH * parseInt(selectedTemplate.dpi))
    const height = parseInt(parseInt(selectedTemplate.height) / MM2INCH * parseInt(selectedTemplate.dpi))
    const zoom = Math.min(MAX_EDITOR_WIDTH / width, MAX_EDITOR_HEIGHT / height)
    
    setExportPhoto({
      width,
      height,
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
      width,
      height,
      zoom,
      dpi_ratio: selectedTemplate.dpi / (MM2INCH * 10)
    })

    // Ensure the preview updates with new dimensions
    setTimeout(() => updatePreview(editorRef, setCroppedImage), 100)

    ReactGA.event({
      action: 'change_template',
      category: 'Dropdown',
      label: 'Change template',
    })
  }

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value)
    ReactGA.event({
      action: 'change_language',
      category: 'Dropdown',
      label: 'Change language',
    })
  }

  return (
    <nav>
      <ul>
        <li>
          <select
            value={template.title[getLanguage()]}
            onChange={handleTemplateChange}
          >
            {TEMPLATES.map((template, index) => (
              <option key={index} value={template.title[getLanguage()]}>
                {template.title[getLanguage()]}
              </option>
            ))}
          </select>
        </li>
        <li>
          <select
            value={getLanguage()}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar