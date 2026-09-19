import React, { Suspense } from "react";
import strings from "../i18n/strings";
import HumanBodyModel from "./HumanBodyModel";
import "./LandingPage.css";

export default function LandingPage({ lang, onStartScreening }) {
  const t = strings[lang];

  return (
    <div className="sg-landing-dark">
      {/* ── 1. HERO SECTION (Full-Screen Dark Editorial Viewport) ── */}
      <section className="sg-hero-dark">
        <div className="sg-hero-container">
          {/* Left Column: Editorial Typography */}
          <div className="sg-hero-left">
            <span className="sg-eyebrow">SUGAR GUARD CAREBRIDGE</span>

            <h1 className="sg-hero-title-dark">
              From Screening<br />
              <span className="sg-title-accent">to the Next Step.</span>
            </h1>

            <p className="sg-hero-desc-dark">
              Understand your diabetes screening result, see what influenced it, and prepare for the next appropriate care step.
            </p>

            <div className="sg-hero-actions-dark">
              <button
                type="button"
                className="sg-cta-btn-dark"
                onClick={onStartScreening}
              >
                <span>Start Screening</span>
                <span className="sg-cta-arrow">→</span>
              </button>

              <span className="sg-disclaimer-dark">
                Screening indication only • Not a medical diagnosis
              </span>
            </div>
          </div>

          {/* Right Column: Large 3D Human Body Model */}
          <div className="sg-hero-right-3d">
            <div className="sg-3d-wrapper">
              <Suspense
                fallback={
                  <div className="sg-3d-loader">
                    <div className="sg-loader-pulse"></div>
                    <span>LOADING 3D MODEL...</span>
                  </div>
                }
              >
                <HumanBodyModel />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP (Dark Editorial) ── */}
      <section className="sg-trust-strip-dark">
        <div className="sg-section-container">
          <div className="sg-trust-items-dark">
            <div className="sg-trust-item-dark">
              <span className="sg-trust-num">01</span>
              <span className="sg-trust-name">SCREENING TOOL</span>
            </div>
            <div className="sg-trust-divider-dark">/</div>
            <div className="sg-trust-item-dark">
              <span className="sg-trust-num">02</span>
              <span className="sg-trust-name">EXPLAINABLE RESULT</span>
            </div>
            <div className="sg-trust-divider-dark">/</div>
            <div className="sg-trust-item-dark">
              <span className="sg-trust-num">03</span>
              <span className="sg-trust-name">CARE NAVIGATION</span>
            </div>
          </div>
          <p className="sg-trust-tagline-dark">{t.trustTagline}</p>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (Dark Minimalist) ── */}
      <section id="how-it-works" className="sg-how-section-dark">
        <div className="sg-section-container">
          <div className="sg-section-header-dark">
            <span className="sg-section-pill-dark">{t.howItWorksHeading}</span>
            <h2 className="sg-section-title-dark">{t.howItWorksTitle}</h2>
          </div>

          <div className="sg-how-grid-dark">
            <div className="sg-how-card-dark">
              <div className="sg-card-num-dark">{t.howStep1Num}</div>
              <h3 className="sg-card-title-dark">{t.howStep1Title}</h3>
              <p className="sg-card-desc-dark">{t.howStep1Desc}</p>
            </div>

            <div className="sg-how-card-dark highlight">
              <div className="sg-card-num-dark">{t.howStep2Num}</div>
              <h3 className="sg-card-title-dark">{t.howStep2Title}</h3>
              <p className="sg-card-desc-dark">{t.howStep2Desc}</p>
            </div>

            <div className="sg-how-card-dark">
              <div className="sg-card-num-dark">{t.howStep3Num}</div>
              <h3 className="sg-card-title-dark">{t.howStep3Title}</h3>
              <p className="sg-card-desc-dark">{t.howStep3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MAIN PRODUCT VALUE (Editorial Dark Frame) ── */}
      <section id="about" className="sg-value-section-dark">
        <div className="sg-section-container">
          <div className="sg-value-content-dark">
            <span className="sg-value-pill-dark">{t.valueHeading}</span>
            <h2 className="sg-value-title-dark">{t.valueTitle}</h2>

            <div className="sg-value-grid-dark">
              <div className="sg-value-item-dark">
                <span className="sg-value-bullet">01</span>
                <span>{t.valuePoint1}</span>
              </div>
              <div className="sg-value-item-dark">
                <span className="sg-value-bullet">02</span>
                <span>{t.valuePoint2}</span>
              </div>
              <div className="sg-value-item-dark">
                <span className="sg-value-bullet">03</span>
                <span>{t.valuePoint3}</span>
              </div>
              <div className="sg-value-item-dark">
                <span className="sg-value-bullet">04</span>
                <span>{t.valuePoint4}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHAT THIS IS / ISN'T (Editorial Dual Columns) ── */}
      <section id="what-it-is" className="sg-what-section-dark">
        <div className="sg-section-container">
          <div className="sg-section-header-dark">
            <h2 className="sg-section-title-dark">{t.whatSectionTitle}</h2>
            <p className="sg-section-sub-dark">{t.whatSectionSub}</p>
          </div>

          <div className="sg-what-grid-dark">
            {/* Helps Column */}
            <div className="sg-what-card-dark helps">
              <div className="sg-what-header-dark">
                <span className="sg-what-tag-dark green">SCOPE</span>
                <h3>{t.helpsTitle}</h3>
              </div>
              <ul className="sg-what-list-dark">
                <li>{t.helps1}</li>
                <li>{t.helps2}</li>
                <li>{t.helps3}</li>
                <li>{t.helps4}</li>
              </ul>
            </div>

            {/* Does Not Column */}
            <div className="sg-what-card-dark does-not">
              <div className="sg-what-header-dark">
                <span className="sg-what-tag-dark red">BOUNDARIES</span>
                <h3>{t.doesNotTitle}</h3>
              </div>
              <ul className="sg-what-list-dark">
                <li>{t.doesNot1}</li>
                <li>{t.doesNot2}</li>
                <li>{t.doesNot3}</li>
                <li>{t.doesNot4}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA ── */}
      <section className="sg-final-cta-section-dark">
        <div className="sg-section-container">
          <div className="sg-final-cta-box-dark">
            <h2 className="sg-final-cta-title-dark">{t.ctaTitle}</h2>
            <p className="sg-final-cta-sub-dark">{t.ctaSubtitle}</p>
            <button
              type="button"
              className="sg-cta-btn-dark large"
              onClick={onStartScreening}
            >
              <span>{t.ctaBtn}</span>
              <span className="sg-cta-arrow">→</span>
            </button>
            <p className="sg-final-disclaimer-dark">{t.ctaDisclaimer}</p>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER ── */}
      <footer className="sg-footer-dark">
        <div className="sg-section-container sg-footer-inner-dark">
          <div className="sg-footer-brand-dark">
            <span className="sg-footer-logo-dark">SugarGuard CareBridge</span>
            <p className="sg-footer-tag-dark">Empowering trustworthy screening and care navigation.</p>
          </div>
          <p className="sg-footer-legal-dark">{t.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
