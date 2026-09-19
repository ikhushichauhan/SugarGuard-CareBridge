import React from "react";
import AnatomicalOrganModel from "./AnatomicalOrganModel";
import yoImg from "../assets/yo.png";
import newImg from "../assets/new.png";
import "./DiabetesImpactPage.css";

// Resolve asset URLs for 3D organ models
const heartUrl = new URL("../assets/realistic_human_heart.glb", import.meta.url).href;
const brainUrl = new URL("../assets/brain.glb", import.meta.url).href;
const eyeUrl = new URL("../assets/realistic_human_eye.glb", import.meta.url).href;
const kidneyUrl = new URL("../assets/kidney.glb", import.meta.url).href;
const toothUrl = new URL("../assets/inside_my_tooth.glb", import.meta.url).href;

export default function DiabetesImpactPage({ onStartScreening }) {
  // 5 Organ cards (Nerves & Feet removed per request)
  const organCards = [
    {
      num: "01",
      title: "Heart & Blood Vessels",
      desc: "Diabetes can damage blood vessels over time and increase the risk of cardiovascular disease and stroke.",
      url: heartUrl,
      targetSize: 3.4,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
          <path d="M12 6v4" />
        </svg>
      ),
    },
    {
      num: "02",
      title: "Brain",
      desc: "Diabetes-related blood-vessel damage can increase the risk of stroke and other neurological complications.",
      url: brainUrl,
      targetSize: 3.2,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 4a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 -2 3.2v.3a3.5 3.5 0 0 0 2.5 3.35v1.65a3.5 3.5 0 0 0 3.5 3.5h.5" />
          <path d="M14.5 4a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 2 3.2v.3a3.5 3.5 0 0 1 -2.5 3.35v1.65a3.5 3.5 0 0 1 -3.5 3.5h-.5" />
          <path d="M12 4v16" />
        </svg>
      ),
    },
    {
      num: "03",
      title: "Eyes",
      desc: "Persistently high blood glucose can damage the small blood vessels in the retina, potentially causing diabetic retinopathy and vision problems.",
      url: eyeUrl,
      targetSize: 3.2,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
        </svg>
      ),
    },
    {
      num: "04",
      title: "Kidneys",
      desc: "High blood glucose can damage the kidney's filtering blood vessels over time, leading to diabetic kidney disease.",
      url: kidneyUrl,
      targetSize: 3.2,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 9 0 0 0 9 9a9 9 0 0 1 -9 9a9 9 0 0 1 -9 -9a9 9 0 0 0 9 -9z" />
        </svg>
      ),
    },
    {
      num: "05",
      title: "Mouth & Gums",
      desc: "People with diabetes can have a higher risk of gum disease and other oral health problems.",
      url: toothUrl,
      targetSize: 3.2,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4c-2.5 0 -4.5 1.5 -4.5 3.5c0 1.5 1 2.5 1 4c0 3 -2 6 -2 8.5c0 1 1 2 2.5 2c1.5 0 2 -1 3 -1s1.5 1 3 1c1.5 0 2.5 -1 2.5 -2c0 -2.5 -2 -5.5 -2 -8.5c0 -1.5 1 -2.5 1 -4c0 -2 -2 -3.5 -4.5 -3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="sg-impact-page">
      {/* ── 1. HERO SECTION ── */}
      <section className="sg-impact-hero">
        <div className="sg-impact-container sg-hero-grid-2col">
          {/* Left Column: Title & Extended Text */}
          <div className="sg-hero-left">
            <span className="sg-impact-eyebrow">YOUR BODY. OUR FOCUS</span>
            <h1 className="sg-impact-title">
              How Diabetes<br />
              Can Affect<br />
              the <span className="sg-title-gradient">Body.</span>
            </h1>
            <p className="sg-impact-hero-desc">
              Diabetes can affect blood vessels and nerves over time, which can impact different organs and body systems. Explore each organ to learn more.
            </p>
            <div className="sg-scroll-indicator">
              <span className="sg-scroll-line"></span>
              <span className="sg-scroll-text">SCROLL TO EXPLORE</span>
            </div>
          </div>

          {/* Right Column: Large yo.png Image */}
          <div className="sg-hero-center-img">
            <img src={yoImg} alt="Diabetes Body Impact Diagram" className="sg-hero-img" />
          </div>
        </div>
      </section>

      {/* ── 2. ORGAN CARDS 2x3 GRID (2 CARDS PER LINE) ── */}
      <section className="sg-impact-grid-section">
        <div className="sg-impact-container">
          <div className="sg-cards-2col-grid">
            {organCards.map((card) => (
              <div key={card.num} className="sg-impact-grid-card">
                <div className="sg-card-top-bar">
                  <h3 className="sg-card-title">{card.title}</h3>
                  <span className="sg-card-num">{card.num}</span>
                </div>

                <div className="sg-card-body-split">
                  <div className="sg-card-info-side">
                    <div className="sg-card-icon-wrapper">{card.icon}</div>
                    <p className="sg-card-desc-text">{card.desc}</p>
                  </div>

                  <div className="sg-card-3d-side">
                    <div className="sg-card-canvas-holder">
                      <AnatomicalOrganModel
                        modelUrl={card.url}
                        targetSize={card.targetSize}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. BOTTOM CTA BANNER (LARGE new.png IMAGE) ── */}
      <section className="sg-impact-bottom-section">
        <div className="sg-impact-container">
          <div className="sg-bottom-banner-card">
            <div className="sg-bottom-banner-grid">
              {/* Left: Large new.png Image Frame */}
              <div className="sg-bottom-img-col">
                <img src={newImg} alt="Anatomical System Overview" className="sg-bottom-img" />
              </div>

              {/* Center: Copy & Action */}
              <div className="sg-bottom-copy-col">
                <span className="sg-bottom-eyebrow">A HEALTHIER TOMORROW</span>
                <h2 className="sg-bottom-title">
                  Your body is connected.<br />
                  <span className="sg-title-gradient">Your health is too.</span>
                </h2>
                <p className="sg-bottom-desc">
                  Understanding how diabetes can affect different parts of the body can help you recognize why screening, confirmation and appropriate follow-up matter.
                </p>
                <button
                  type="button"
                  className="sg-cta-btn-dark large"
                  onClick={onStartScreening}
                >
                  <span>Start Screening</span>
                  <span className="sg-cta-arrow">→</span>
                </button>
              </div>

              {/* Right: Feature Bullets */}
              <div className="sg-bottom-features-col">
                <div className="sg-feature-item">
                  <div className="sg-feature-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <span>Know your risk</span>
                </div>

                <div className="sg-feature-item">
                  <div className="sg-feature-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <span>Take informed steps</span>
                </div>

                <div className="sg-feature-item">
                  <div className="sg-feature-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
                    </svg>
                  </div>
                  <span>Build a healthier future</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FOOTER ── */}
      <footer className="sg-impact-footer">
        <div className="sg-impact-container sg-footer-content">
          <div className="sg-footer-brand">
            <div className="sg-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
                  fill="#3b82f6"
                  fillOpacity="0.2"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="sg-brand-name dark-text">SugarGuard</span>
            <span className="sg-brand-bridge dark-text">CareBridge</span>
          </div>

          <div className="sg-footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
