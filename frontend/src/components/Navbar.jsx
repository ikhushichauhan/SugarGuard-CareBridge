import { useState } from "react";
import strings from "../i18n/strings";
import "./Navbar.css";

export default function Navbar({ lang, onToggleLang, onNavigate, theme = "light" }) {
  const t = strings[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  const isDark = theme === "dark";

  return (
    <nav className={`sg-navbar ${isDark ? "sg-navbar-dark" : ""}`}>
      <div className="sg-nav-container">
        {/* Logo & Brand — pushed to far left */}
        <div
          className="sg-nav-brand"
          onClick={() => handleNavClick("home")}
          role="button"
          tabIndex={0}
        >
          <div className="sg-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
                fill={isDark ? "#3b82f6" : "#2563EB"}
                fillOpacity={isDark ? "0.2" : "0.12"}
                stroke={isDark ? "#60a5fa" : "#2563EB"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke={isDark ? "#60a5fa" : "#2563EB"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="sg-brand-text">
            <span className={`sg-brand-name ${isDark ? "dark-text" : ""}`}>SugarGuard</span>
            <span className={`sg-brand-bridge ${isDark ? "dark-text" : ""}`}>CareBridge</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="sg-nav-links desktop-only">
          <button
            type="button"
            className="sg-nav-link"
            onClick={() => handleNavClick("how-it-works")}
          >
            {t.navHowItWorks}
          </button>
          <button
            type="button"
            className="sg-nav-link"
            onClick={() => handleNavClick("about")}
          >
            {t.navAbout}
          </button>
          <button
            type="button"
            className="sg-nav-link"
            onClick={() => handleNavClick("impact")}
          >
            {t.navImpact || "Body Impact"}
          </button>

          {/* CTA — Start Screening */}
          <button
            type="button"
            className="sg-nav-cta"
            onClick={() => handleNavClick("start-screening")}
          >
            {t.navStartScreening}
          </button>

          {/* Language Globe — after Start Screening */}
          <button
            type="button"
            className="sg-lang-icon-btn"
            onClick={onToggleLang}
            title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
            aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </button>
        </div>

        {/* Mobile Actions (Lang Globe + Hamburger) */}
        <div className="sg-nav-mobile-actions">
          <button
            type="button"
            className="sg-lang-icon-btn"
            onClick={onToggleLang}
            title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </button>

          <button
            type="button"
            className="sg-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className={`sg-burger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sg-mobile-drawer">
          <button
            type="button"
            className="sg-mobile-nav-link"
            onClick={() => handleNavClick("how-it-works")}
          >
            {t.navHowItWorks}
          </button>
          <button
            type="button"
            className="sg-mobile-nav-link"
            onClick={() => handleNavClick("about")}
          >
            {t.navAbout}
          </button>
          <button
            type="button"
            className="sg-mobile-nav-link"
            onClick={() => handleNavClick("impact")}
          >
            {t.navImpact || "Body Impact"}
          </button>
          <button
            type="button"
            className="sg-mobile-cta"
            onClick={() => handleNavClick("start-screening")}
          >
            {t.navStartScreening} →
          </button>
        </div>
      )}
    </nav>
  );
}
