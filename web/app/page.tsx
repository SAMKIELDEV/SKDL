"use client"

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Custom Cursor Logic
    const cursorDot = cursorDotRef.current
    const cursorRing = cursorRingRef.current
    
    if (!cursorDot || !cursorRing) return

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // Update dot position instantly
      cursorDot.style.left = `${mouseX}px`
      cursorDot.style.top = `${mouseY}px`
    }

    const animateRing = () => {
      // Interpolate ring position for lagging effect
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      
      cursorRing.style.left = `${ringX}px`
      cursorRing.style.top = `${ringY}px`
      
      requestAnimationFrame(animateRing)
    }

    // Scroll Reveal Logic
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
        }
      })
    }, observerOptions)

    const revealElements = document.querySelectorAll(`.${styles.reveal}`)
    revealElements.forEach(el => observer.observe(el))

    // Interactive elements hover for cursor
    const interactiveElements = document.querySelectorAll('a, button')
    const addHover = () => document.body.classList.add(styles.cursorHover)
    const removeHover = () => document.body.classList.remove(styles.cursorHover)

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })

    // Initialization
    window.addEventListener('mousemove', onMouseMove)
    const animFrame = requestAnimationFrame(animateRing)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animFrame)
      revealElements.forEach(el => observer.unobserve(el))
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', addHover)
        el.removeEventListener('mouseleave', removeHover)
      })
    }
  }, [])

  const tickerItems = [
    "UNLIMITED MOVIES", "•", "HD SERIES", "•", "FAST DOWNLOADS", "•", "PREMIUM EXPERIENCE", "•",
  ]

  // Duplicate for seamless infinite scroll
  const allTickerItems = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <div className={styles.page}>
      <div ref={cursorDotRef} className={styles.cursorDot}></div>
      <div ref={cursorRingRef} className={styles.cursorRing}></div>



      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={`${styles.heroContent} ${styles.reveal}`}>
          <span className={styles.heroLabel}>AI-POWERED MEDIA DISCOVERY // SKDL</span>
          <h1 className={styles.heroTitle}>Netflix and Chill<br />With SKDL</h1>
    
          <p className={styles.heroDesc}>
            The ultimate bridge between Telegram and High-Quality streaming. 
            Find any movie or series with AI, and watch it here instantly.
          </p>
          <a href="https://t.me/SK_DLBOT" target="_blank" rel="noopener noreferrer" className={styles.btn}>
            GET STARTED ON TELEGRAM
          </a>
        </div>
      </section>

      <div className={styles.tickerWrap}>
        <div className={styles.ticker}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className={styles.tickerItem}>UNLIMITED MOVIES</span>
              <div className={styles.tickerDot}></div>
              <span className={styles.tickerItem}>HD SERIES</span>
              <div className={styles.tickerDot}></div>
              <span className={styles.tickerItem}>FAST DOWNLOADS</span>
              <div className={styles.tickerDot}></div>
              <span className={styles.tickerItem}>PREMIUM EXPERIENCE</span>
              <div className={styles.tickerDot}></div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tickerWrap}>
        <div className={styles.ticker}>
          {allTickerItems.map((item, i) => (
            <span key={i} className={item === "•" ? styles.tickerIcon : styles.tickerItem}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className={styles.steps}>
        <div className={`${styles.stepsHeader} ${styles.reveal}`}>
          <h2 className={styles.stepsTitle}>How it works</h2>
          <p className={styles.stepsDesc}>Three simple steps to cinematic bliss. No ads, no fluff, just pure entertainment.</p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={`${styles.stepCard} ${styles.reveal}`}>
            <div className={styles.stepNumber}>01</div>
            <h3 className={styles.stepTitle}>Request</h3>
            <p className={styles.stepDesc}>
              Head over to our Telegram bot <strong>@SK_DLBOT</strong> and just ask for what you want to watch. Our AI understands natural language.
            </p>
          </div>
          
          <div className={`${styles.stepCard} ${styles.reveal}`}>
            <div className={styles.stepNumber}>02</div>
            <h3 className={styles.stepTitle}>Process</h3>
            <p className={styles.stepDesc}>
              The bot instantly searches the highest quality sources, resolves the best links, and sends you a private access link.
            </p>
          </div>

          <div className={`${styles.stepCard} ${styles.reveal}`}>
            <div className={styles.stepNumber}>03</div>
            <h3 className={styles.stepTitle}>Stream</h3>
            <p className={styles.stepDesc}>
              Follow the link back to <strong>SKDL Web</strong> to stream in 4K or download for offline viewing. Pure, seamless experience.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.hero} style={{ height: '60vh', minHeight: 'unset' }}>
        <div className={`${styles.heroContent} ${styles.reveal}`}>
          <h2 className={styles.heroTitle} style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}>Ready to Watch?</h2>
          <p className={styles.heroDesc}>Stop searching. Start watching. The future of media discovery is here.</p>
          <a href="https://t.me/SK_DLBOT" target="_blank" rel="noopener noreferrer" className={styles.btn}>
            OPEN TELEGRAM
          </a>
        </div>
      </section>


    </div>
  )
}
