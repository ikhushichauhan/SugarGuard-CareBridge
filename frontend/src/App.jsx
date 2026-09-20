import { useState, useEffect } from "react";
import strings from "./i18n/strings";
import { submitScreening } from "./api/screeningApi";

import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import ScreeningPage from "./components/ScreeningPage";
import ProcessingView from "./components/ProcessingView";
import ResultPage from "./components/ResultPage";
import CareJourneyPage from "./components/CareJourneyPage";
import DiabetesImpactPage from "./components/DiabetesImpactPage";
import LabReportPage from "./components/LabReportPage";
import ErrorBanner from "./components/ErrorBanner";

import "./App.css";

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("sg_lang") || "en";
    } catch {
      return "en";
    }
  });

  // Views: "landing" | "screening" | "impact" | "processing" | "result" | "journey" | "labChecker"
  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedView = localStorage.getItem("sg_current_view");
      const savedResponse = localStorage.getItem("sg_screening_response");
      const savedLab = localStorage.getItem("sg_lab_result");

      if (!savedView || savedView === "processing") return "landing";
      if (savedView === "result" && !savedResponse) return "landing";
      if (savedView === "journey" && !savedResponse && !savedLab) return "landing";

      return savedView;
    } catch {
      return "landing";
    }
  });

  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState(() => {
    try {
      const saved = localStorage.getItem("sg_screening_response");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [labResult, setLabResult] = useState(() => {
    try {
      const saved = localStorage.getItem("sg_lab_result");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [error, setError] = useState(null); // { title, message }
  const [screeningResetKey, setScreeningResetKey] = useState(0);

  const t = strings[lang];

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sg_lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem("sg_current_view", currentView);
    } catch {
      /* ignore */
    }
  }, [currentView]);

  useEffect(() => {
    try {
      if (response) {
        localStorage.setItem("sg_screening_response", JSON.stringify(response));
      } else {
        localStorage.removeItem("sg_screening_response");
      }
    } catch {
      /* ignore */
    }
  }, [response]);

  useEffect(() => {
    try {
      if (labResult) {
        localStorage.setItem("sg_lab_result", JSON.stringify(labResult));
      } else {
        localStorage.removeItem("sg_lab_result");
      }
    } catch {
      /* ignore */
    }
  }, [labResult]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  // Smooth Scroll Reveal Observer
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sg-revealed");
        } else if (entry.boundingClientRect.top > 0) {
          // Gracefully fade out when scrolling back up past element
          entry.target.classList.remove("sg-revealed");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    });

    const selector = ".sg-scroll-reveal, .sg-how-card-dark, .sg-value-item-dark, .sg-what-card-dark, .sg-lc-form-card, .sg-lc-ocr-card, .sg-trust-strip-dark, .sg-final-cta-box-dark, .sg-impact-grid-card";
    const targets = document.querySelectorAll(selector);

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [currentView]);

  const handleStartScreening = () => {
    setError(null);
    setCurrentView("screening");
  };

  const handleBackToLanding = () => {
    setError(null);
    setCurrentView("landing");
  };

  const handleNavClick = (sectionId) => {
    if (sectionId === "home") {
      setCurrentView("landing");
      return;
    }
    if (sectionId === "start-screening") {
      handleStartScreening();
      return;
    }
    if (sectionId === "impact") {
      setCurrentView("impact");
      return;
    }

    if (sectionId === "lab-checker") {
      setError(null);
      setCurrentView("labChecker");
      return;
    }

    if (currentView !== "landing") {
      setCurrentView("landing");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScreeningSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setCurrentView("processing");

    try {
      const [data] = await Promise.all([
        submitScreening(formData, lang),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      if (!data || !data.status) {
        setError({ title: t.blockTitle, message: t.unexpectedError });
        setCurrentView("screening");
        return;
      }

      if (data.status === "BLOCK") {
        setError({ title: t.blockTitle, message: data.message || t.serverError });
        setCurrentView("screening");
        return;
      }

      if (data.status === "EXIT") {
        setResponse(data);
        setCurrentView("result");
        return;
      }

      if (data.result) {
        setResponse(data);
        setCurrentView("result");
      } else {
        setError({ title: t.blockTitle, message: t.unexpectedError });
        setCurrentView("screening");
      }
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError({ title: t.blockTitle, message: t.networkError });
      } else {
        setError({ title: t.blockTitle, message: t.serverError });
      }
      setCurrentView("screening");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToJourney = () => {
    setCurrentView("journey");
  };

  const handleBackToResult = () => {
    setCurrentView("result");
  };

  const handleNewScreening = () => {
    setResponse(null);
    setError(null);
    try {
      localStorage.removeItem("sg_screening_response");
      localStorage.removeItem("sg_screening_form");
    } catch {
      /* ignore */
    }
    setScreeningResetKey((prev) => prev + 1);
    setCurrentView("screening");
  };

  const handleAddLabResultToPassport = (labData) => {
    setLabResult(labData);
    setCurrentView("journey");
  };

  const isDarkNav = true;

  return (
    <div className="sg-app">
      {/* ── Global Navbar ── */}
      <Navbar
        lang={lang}
        onToggleLang={toggleLang}
        onNavigate={handleNavClick}
        theme={isDarkNav ? "dark" : "light"}
      />

      {/* ── Error Banner if present ── */}
      {error && (
        <div className="sg-global-error-wrap">
          <ErrorBanner
            title={error.title}
            message={error.message}
            onRetry={() => setError(null)}
            retryLabel={t.tryAgain}
          />
        </div>
      )}

      {/* ── Dynamic Page Views ── */}
      {currentView === "landing" && (
        <LandingPage
          lang={lang}
          onStartScreening={handleStartScreening}
        />
      )}

      {currentView === "impact" && (
        <DiabetesImpactPage
          onStartScreening={handleStartScreening}
        />
      )}

      {currentView === "screening" && (
        <ScreeningPage
          key={screeningResetKey}
          lang={lang}
          onBack={handleBackToLanding}
          onSubmit={handleScreeningSubmit}
          loading={loading}
        />
      )}

      {currentView === "processing" && (
        <ProcessingView lang={lang} />
      )}

      {currentView === "result" && response && (
        <ResultPage
          result={response.result}
          warnings={response.warnings}
          lang={lang}
          onContinueToJourney={handleContinueToJourney}
          onNewScreening={handleNewScreening}
        />
      )}

      {currentView === "journey" && (response || labResult) && (
        <CareJourneyPage
          result={response?.result}
          labResult={labResult}
          lang={lang}
          onBackToResult={handleBackToResult}
          onBackToHome={handleBackToLanding}
        />
      )}

      {currentView === "labChecker" && (
        <LabReportPage
          lang={lang}
          onBackToHome={handleBackToLanding}
          onAddToCarePassport={handleAddLabResultToPassport}
        />
      )}
    </div>
  );
}
