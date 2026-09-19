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
import ErrorBanner from "./components/ErrorBanner";

import "./App.css";

export default function App() {
  const [lang, setLang] = useState("en");
  // Views: "landing" | "screening" | "impact" | "processing" | "result" | "journey"
  const [currentView, setCurrentView] = useState("landing");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null); // { status, result, warnings }
  const [error, setError] = useState(null); // { title, message }

  const t = strings[lang];

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        setError({ title: t.exitTitle, message: data.message || t.serverError });
        setCurrentView("screening");
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
    setCurrentView("screening");
  };

  const isDarkNav = currentView === "landing" || currentView === "screening" || currentView === "impact";

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

      {currentView === "journey" && response && (
        <CareJourneyPage
          result={response.result}
          lang={lang}
          onBackToResult={handleBackToResult}
          onBackToHome={handleBackToLanding}
        />
      )}
    </div>
  );
}
