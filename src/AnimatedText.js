import React, { useEffect, useRef } from 'react'
import anime from 'animejs'

function AnimatedText({text1, text2}) {
  const textRef = useRef(null)

  useEffect(() => {
    const animation = anime.timeline({ loop: true })
      .add({
        targets: '.ml15 .word',
        scale: [14, 1],
        opacity: [0, 1],
        easing: "easeOutCirc",
        duration: 800,
        letterSpacing: "0.5em",
        textTransform: "uppercase",
        fontWeight: 1600,
        fontSize: "1em",
        lineHeight: "1em",
        color: "#A3262A",
        textShadow: `
          2px 2px 0 #F5AC27, 
          -2px 2px 0 #F5AC27, 
          2px -2px 0 #F5AC27, 
          -2px -2px 0 #F5AC27
        `,
        delay: (el, i) => 800 * i
      }).add({
        targets: '.ml15',
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
      })

    return () => {
      animation.pause()
    }
  }, [])

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      position: "absolute", // or position: absolute
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1,
    }}>
      <h1 className="ml15" ref={textRef}>
        <span className="word">{text1}</span>
        <span className="word">{text2}</span>
      </h1>
    </div>
  )
}

export default AnimatedText
