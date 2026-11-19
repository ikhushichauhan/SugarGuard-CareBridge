
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

const LAB_RESULTS_KEY = "sg_lab_results";
const LEGACY_LAB_RESULT_KEY = "sg_lab_result";

function loadLabResults() {
  try {
    const saved = localStorage.getItem(LAB_RESULTS_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }

    // Migrate the previous single-report format.
    const legacy = localStorage.getItem(LEGACY_LAB_RESULT_KEY);

    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);

      if (parsedLegacy && typeof parsedLegacy === "object") {
        return [{
          ...parsedLegacy,
          id: parsedLegacy.id || `legacy-${Date.now()}`,
          dateISO: parsedLegacy.dateISO || null,
        }];
      }
    }
  } catch {
    // Invalid or unavailable localStorage should not crash the app.
  }

  return [];
}

export default function App() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("sg_lang") || "en";
    } catch {
      return "en";
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedView = localStorage.getItem("sg_current_view");
      const savedResponse = localStorage.getItem("sg_screening_response");
      const savedLab = localStorage.getItem(LAB_RESULTS_KEY)
        || localStorage.getItem(LEGACY_LAB_RESULT_KEY);

      if (!savedView || savedView === "processing") return "landing";
      if (savedView === "result" && !savedResponse) return "landing";
      if (savedView === "journey" && !savedResponse && !savedLab) {
        return "landing";
      }

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

  const [labResults, setLabResults] = useState(loadLabResults);

  const latestLabResult = labResults.length
    ? labResults[labResults.length - 1]
    : null;

  const [error, setError] = useState(null);
  const [screeningResetKey, setScreeningResetKey] = useState(0);

  const t = strings[lang];

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  useEffect(() => {
    try {
      localStorage.setItem("sg_lang", lang);
    } catch {
      // Ignore storage errors.
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem("sg_current_view", currentView);
    } catch {
      // Ignore storage errors.
    }
  }, [currentView]);

  useEffect(() => {
    try {
      if (response) {
        localStorage.setItem(
          "sg_screening_response",
          JSON.stringify(response)
        );
      } else {
        localStorage.removeItem("sg_screening_response");
      }
    } catch {
      // Ignore storage errors.
    }
  }, [response]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LAB_RESULTS_KEY,
        JSON.stringify(labResults)
      );

      // Keep legacy key updated for compatibility with older app code.
      if (latestLabResult) {
        localStorage.setItem(
          LEGACY_LAB_RESULT_KEY,
          JSON.stringify(latestLabResult)
        );
      } else {
        localStorage.removeItem(LEGACY_LAB_RESULT_KEY);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [labResults, latestLabResult]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sg-revealed");
        } else if (entry.boundingClientRect.top > 0) {
          entry.target.classList.remove("sg-revealed");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    });

    const selector = [
      ".sg-scroll-reveal",
      ".sg-how-card-dark",
      ".sg-value-item-dark",
      ".sg-what-card-dark",
      ".sg-lc-form-card",
      ".sg-lc-ocr-card",
      ".sg-trust-strip-dark",
      ".sg-final-cta-box-dark",
      ".sg-impact-grid-card",
    ].join(", ");

    document.querySelectorAll(selector).forEach((target) => {
      observer.observe(target);
    });

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
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
      });
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
        setError({
          title: t.blockTitle,
          message: t.unexpectedError,
        });
        setCurrentView("screening");
        return;
      }

      if (data.status === "BLOCK") {
        setError({
          title: t.blockTitle,
          message: data.message || t.serverError,
        });
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
        setError({
          title: t.blockTitle,
          message: t.unexpectedError,
        });
        setCurrentView("screening");
      }
    } catch (err) {
      setError({
        title: t.blockTitle,
        message:
          err.message === "Failed to fetch"
            ? t.networkError
            : t.serverError,
      });
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
      // Ignore storage errors.
    }

    setScreeningResetKey((prev) => prev + 1);
    setCurrentView("screening");
  };

  const handleAddLabResultToPassport = (labData) => {
    const report = {
      ...labData,
      id: labData.id || `lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    setLabResults((previous) => {
      // Avoid adding the same report twice if the callback is triggered again.
      if (previous.some((item) => item.id === report.id)) {
        return previous;
      }

      return [...previous, report].sort((a, b) => {
        return (a.dateISO || "").localeCompare(b.dateISO || "");
      });
    });

    setCurrentView("journey");
  };

  const isDarkNav = true;

  return (
    <div className="sg-app">
      <Navbar
        lang={lang}
        onToggleLang={toggleLang}
        onNavigate={handleNavClick}
        theme={isDarkNav ? "dark" : "light"}
      />

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

      {currentView === "journey" && (response || labResults.length > 0) && (
        <CareJourneyPage
          result={response?.result}
          labResult={latestLabResult}
          labResults={labResults}
          lang={lang}
          onBackToResult={handleBackToResult}
          onBackToHome={handleBackToLanding}
        />
      )}

      {currentView === "labChecker" && (
        <LabReportPage
          lang={lang}
          labResults={labResults}
          onBackToHome={handleBackToLanding}
          onAddToCarePassport={handleAddLabResultToPassport}
        />
      )}
    </div>
  );
}
