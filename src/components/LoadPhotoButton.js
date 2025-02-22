import React from 'react'
import ReactGA from 'react-ga4'

const LoadPhotoButton = ({ onPhotoLoad, title }) => {
  const MAX_FILE_SIZE = 20000000
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]

    if (file) {
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

export default LoadPhotoButton
