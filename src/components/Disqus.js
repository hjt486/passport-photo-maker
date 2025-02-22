import React, { useEffect } from 'react'
import { DiscussionEmbed } from 'disqus-react'
import { Helmet } from 'react-helmet'

const Disqus = ({
  template,
  getLanguage,
  translateObject
}) => {
  const formatStringForURL = (inputString) => {
    let formattedString = inputString.toLowerCase()
    formattedString = formattedString.replace(/[/\\:,.?!"'(){}[\]<>^*%&@#$+=|~`\s]/g, '_')
    formattedString = formattedString.replace(/_+/g, '_')
    formattedString = formattedString.replace(/^_+|_+$/g, '')
    return formattedString
  }

  const reloadDisqusPlugin = () => {
    if (typeof window.DISQUS !== 'undefined') {
      window.DISQUS.reset({ reload: true })
    }
  }

  useEffect(() => {
    const colorSchemeListener = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      reloadDisqusPlugin()
    }
    colorSchemeListener.addEventListener('change', handleChange)
    return () => {
      colorSchemeListener.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <>
      <Helmet>
        <script src="https://YOUR_DISQUS_SHORTNAME.disqus.com/embed.js" async></script>
      </Helmet>
      <DiscussionEmbed
        className="test"
        key={formatStringForURL(translateObject(template.title))}
        shortname='passport-photo-maker'
        config={{
          url: 'https://jiataihan.dev/passport-photo-maker/' + formatStringForURL(translateObject(template.title)),
          identifier: 'https://jiataihan.dev/passport-photo-maker/' + formatStringForURL(translateObject(template.title)),
          title: translateObject(template.title),
          language: getLanguage() === "zh" ? 'zh' : 'en_US'
        }}
      />
    </>
  )
}

export default Disqus