import { useState, useEffect } from "react";
import strings from "../i18n/strings";
import "./ScreeningPage.css";

const INITIAL_FORM = {
  age: "",
  sex: "",
  height_cm: "",
  weight_kg: "",
  high_bp: null,
  high_chol: null,
  smoker: null,
  phys_activity: null,
  gen_health: "",
  already_diagnosed: null,
};

export default function ScreeningPage({ lang, onSubmit, loading }) {
  const t = strings[lang];
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem("sg_screening_form");
      return saved ? JSON.parse(saved) : { ...INITIAL_FORM };
    } catch {
      return { ...INITIAL_FORM };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sg_screening_form", JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form]);

  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.age) e.age = t.required;
    else if (Number(form.age) < 18 || Number(form.age) > 120) e.age = t.ageRange;

    if (!form.sex) e.sex = t.required;

    if (!form.height_cm) e.height_cm = t.required;
    else if (Number(form.height_cm) < 100 || Number(form.height_cm) > 250)
      e.height_cm = t.heightRange;

    if (!form.weight_kg) e.weight_kg = t.required;
    else if (Number(form.weight_kg) < 20 || Number(form.weight_kg) > 300)
      e.weight_kg = t.weightRange;

    if (form.high_bp === null) e.high_bp = t.required;
    if (form.high_chol === null) e.high_chol = t.required;
    if (form.smoker === null) e.smoker = t.required;
    if (form.phys_activity === null) e.phys_activity = t.required;
    if (!form.gen_health) e.gen_health = t.required;
    if (form.already_diagnosed === null) e.already_diagnosed = t.required;

    setErrors(e);
    if (Object.keys(e).length > 0) {
      const firstError = Object.keys(e)[0];
      const el = document.getElementById(`field-${firstError}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      age: Number(form.age),
      sex: form.sex,
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      high_bp: Boolean(form.high_bp),
      high_chol: Boolean(form.high_chol),
      smoker: Boolean(form.smoker),
      phys_activity: Boolean(form.phys_activity),
      gen_health: Number(form.gen_health),
      already_diagnosed: Boolean(form.already_diagnosed),
    };

    onSubmit(payload);
  };

  /* ── Pill Button Toggle for Yes / No ── */
  const renderPillQuestion = ({ id, label, value, onChange, error }) => (
    <div key={id} className="sg-form-group" id={`field-${id}`}>
      <label className="sg-form-label">{label}</label>
      <div className="sg-pill-group">
        <button
          type="button"
          className={`sg-pill-btn ${value === true ? "selected" : ""}`}
          onClick={() => onChange(true)}
        >
          <span className="sg-pill-radio">{value === true ? "●" : "○"}</span>
          <span>{t.yes}</span>
        </button>
        <button
          type="button"
          className={`sg-pill-btn ${value === false ? "selected" : ""}`}
          onClick={() => onChange(false)}
        >
          <span className="sg-pill-radio">{value === false ? "●" : "○"}</span>
          <span>{t.no}</span>
        </button>
      </div>
      {error && <span className="sg-form-error">{error}</span>}
    </div>
  );

  return (
    <div className="sg-screening-page">
      <div className="sg-sp-container sg-sp-content-wrapper">
        {/* ── Horizontal Progress Stepper Card (Positioned Above Form) ── */}
        <div className="sg-horizontal-stepper-card">
          <div className="sg-stepper-top-bar">
            <h3 className="sg-stepper-title">Assessment Progress</h3>
          </div>

          <div className="sg-stepper-horizontal-list">
            <div className="sg-stepper-item active">
              <div className="sg-step-circle">1</div>
              <div className="sg-step-text">
                <span className="sg-step-label">{t.progressStep1}</span>
                <span className="sg-step-status">In Progress</span>
              </div>
            </div>
            <div className="sg-stepper-h-line"></div>
            <div className="sg-stepper-item">
              <div className="sg-step-circle">2</div>
              <div className="sg-step-text">
                <span className="sg-step-label">{t.progressStep2}</span>
                <span className="sg-step-status">Pending</span>
              </div>
            </div>
            <div className="sg-stepper-h-line"></div>
            <div className="sg-stepper-item">
              <div className="sg-step-circle">3</div>
              <div className="sg-step-text">
                <span className="sg-step-label">{t.progressStepResult}</span>
                <span className="sg-step-status">Awaiting Input</span>
              </div>
            </div>
            <div className="sg-stepper-h-line"></div>
            <div className="sg-stepper-item">
              <div className="sg-step-circle">4</div>
              <div className="sg-step-text">
                <span className="sg-step-label">{t.progressStepNext}</span>
                <span className="sg-step-status">Care Passport</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Clean Assessment Form Container (Full Width) ── */}
        <main className="sg-sp-main-centered">
          <form className="sg-assessment-form" onSubmit={handleSubmit} noValidate>
            {/* ── Section 1: About You ── */}
            <div className="sg-form-card">
              <div className="sg-card-header">
                <span className="sg-badge-num">Step 1 of 3</span>
                <h2 className="sg-card-title">{t.sec1Title}</h2>
                <p className="sg-card-desc">{t.sec1Desc}</p>
              </div>

              <div className="sg-form-grid-2">
                <div className="sg-form-group" id="field-age">
                  <label htmlFor="age" className="sg-form-label">{t.age}</label>
                  <input
                    id="age"
                    type="number"
                    min={18}
                    max={120}
                    placeholder={t.agePlaceholder}
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    className={`sg-input ${errors.age ? "error" : ""}`}
                  />
                  {errors.age && <span className="sg-form-error">{errors.age}</span>}
                </div>

                <div className="sg-form-group" id="field-sex">
                  <label htmlFor="sex" className="sg-form-label">{t.sex}</label>
                  <select
                    id="sex"
                    value={form.sex}
                    onChange={(e) => set("sex", e.target.value)}
                    className={`sg-select ${errors.sex ? "error" : ""}`}
                  >
                    <option value="">{t.sexSelect}</option>
                    <option value="male">{t.sexMale}</option>
                    <option value="female">{t.sexFemale}</option>
                  </select>
                  {errors.sex && <span className="sg-form-error">{errors.sex}</span>}
                </div>
              </div>

              <div className="sg-form-grid-2">
                <div className="sg-form-group" id="field-height_cm">
                  <label htmlFor="height_cm" className="sg-form-label">{t.heightCm}</label>
                  <input
                    id="height_cm"
                    type="number"
                    min={100}
                    max={250}
                    placeholder={t.heightPlaceholder}
                    value={form.height_cm}
                    onChange={(e) => set("height_cm", e.target.value)}
                    className={`sg-input ${errors.height_cm ? "error" : ""}`}
                  />
                  {errors.height_cm && <span className="sg-form-error">{errors.height_cm}</span>}
                </div>

                <div className="sg-form-group" id="field-weight_kg">
                  <label htmlFor="weight_kg" className="sg-form-label">{t.weightKg}</label>
                  <input
                    id="weight_kg"
                    type="number"
                    min={20}
                    max={300}
                    placeholder={t.weightPlaceholder}
                    value={form.weight_kg}
                    onChange={(e) => set("weight_kg", e.target.value)}
                    className={`sg-input ${errors.weight_kg ? "error" : ""}`}
                  />
                  {errors.weight_kg && <span className="sg-form-error">{errors.weight_kg}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 2: Health & Lifestyle ── */}
            <div className="sg-form-card">
              <div className="sg-card-header">
                <span className="sg-badge-num">Step 2 of 3</span>
                <h2 className="sg-card-title">{t.sec2Title}</h2>
                <p className="sg-card-desc">{t.sec2Desc}</p>
              </div>

              {renderPillQuestion({
                id: "high_bp",
                label: t.highBP,
                value: form.high_bp,
                onChange: (val) => set("high_bp", val),
                error: errors.high_bp,
              })}

              {renderPillQuestion({
                id: "high_chol",
                label: t.highChol,
                value: form.high_chol,
                onChange: (val) => set("high_chol", val),
                error: errors.high_chol,
              })}

              {renderPillQuestion({
                id: "smoker",
                label: t.smoker,
                value: form.smoker,
                onChange: (val) => set("smoker", val),
                error: errors.smoker,
              })}

              {renderPillQuestion({
                id: "phys_activity",
                label: t.physActivity,
                value: form.phys_activity,
                onChange: (val) => set("phys_activity", val),
                error: errors.phys_activity,
              })}

              <div className="sg-form-group" id="field-gen_health">
                <label htmlFor="gen_health" className="sg-form-label">{t.genHealth}</label>
                <select
                  id="gen_health"
                  value={form.gen_health}
                  onChange={(e) => set("gen_health", e.target.value)}
                  className={`sg-select ${errors.gen_health ? "error" : ""}`}
                >
                  <option value="">{t.genHealthSelect}</option>
                  {t.genHealthOptions.map((opt, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.gen_health && (
                  <span className="sg-form-error">{errors.gen_health}</span>
                )}
              </div>
            </div>

            {/* ── Section 3: Important Check ── */}
            <div className="sg-form-card safety-check" id="field-already_diagnosed">
              <div className="sg-card-header">
                <span className="sg-badge-num safety">Step 3 of 3 • Safety Check</span>
                <h2 className="sg-card-title">{t.sec3Title}</h2>
                <p className="sg-card-desc">{t.sec3Desc}</p>
              </div>

              <div className="sg-diagnosed-box">
                <label className="sg-form-label bold">{t.alreadyDiagnosedQuestion}</label>

                <div className="sg-radio-cards">
                  <div
                    className={`sg-radio-card ${form.already_diagnosed === false ? "selected" : ""}`}
                    onClick={() => set("already_diagnosed", false)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="sg-radio-dot">{form.already_diagnosed === false ? "●" : "○"}</span>
                    <div>
                      <strong>{t.alreadyDiagnosedNo}</strong>
                      <p>Proceed with screening calculation</p>
                    </div>
                  </div>

                  <div
                    className={`sg-radio-card warning ${form.already_diagnosed === true ? "selected" : ""}`}
                    onClick={() => set("already_diagnosed", true)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="sg-radio-dot">{form.already_diagnosed === true ? "●" : "○"}</span>
                    <div>
                      <strong>{t.alreadyDiagnosedYes}</strong>
                      <p>Direct care provider navigation</p>
                    </div>
                  </div>
                </div>

                {errors.already_diagnosed && (
                  <span className="sg-form-error">{errors.already_diagnosed}</span>
                )}

                {form.already_diagnosed === true && (
                  <div className="sg-callout-warning">
                    <p>{t.alreadyDiagnosedWarning}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom Submit ── */}
            <div className="sg-form-footer">
              <button
                type="submit"
                className="sg-hero-cta-btn large full-width"
                disabled={loading}
              >
                <span>{loading ? t.analyzingBtn : t.submitBtn}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
