import { useState } from "react";
import strings from "../i18n/strings";
import "./ScreeningForm.css";

const INITIAL_FORM = {
  age: "",
  sex: "",
  height_cm: "",
  weight_kg: "",
  high_bp: "",
  high_chol: "",
  smoker: "",
  phys_activity: "",
  gen_health: "",
  already_diagnosed: "",
};

export default function ScreeningForm({ lang, onSubmit, loading }) {
  const t = strings[lang];
  const [form, setForm] = useState({ ...INITIAL_FORM });
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

    if (form.high_bp === "") e.high_bp = t.required;
    if (form.high_chol === "") e.high_chol = t.required;
    if (form.smoker === "") e.smoker = t.required;
    if (form.phys_activity === "") e.phys_activity = t.required;
    if (!form.gen_health) e.gen_health = t.required;
    if (form.already_diagnosed === "") e.already_diagnosed = t.required;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    /* Convert booleans for the backend */
    const payload = {
      age: Number(form.age),
      sex: form.sex,
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      high_bp: form.high_bp === "yes",
      high_chol: form.high_chol === "yes",
      smoker: form.smoker === "yes",
      phys_activity: form.phys_activity === "yes",
      gen_health: Number(form.gen_health),
      already_diagnosed: form.already_diagnosed === "yes",
    };

    onSubmit(payload);
  };

  /* ── Helpers ── */
  const YesNo = ({ field, label }) => (
    <fieldset className="sf-field sf-yesno">
      <legend>{label}</legend>
      <div className="sf-toggle-group">
        <button
          type="button"
          className={`sf-toggle ${form[field] === "yes" ? "active" : ""}`}
          onClick={() => set(field, "yes")}
        >
          {t.yes}
        </button>
        <button
          type="button"
          className={`sf-toggle ${form[field] === "no" ? "active" : ""}`}
          onClick={() => set(field, "no")}
        >
          {t.no}
        </button>
      </div>
      {errors[field] && <span className="sf-error">{errors[field]}</span>}
    </fieldset>
  );

  return (
    <form className="screening-form" onSubmit={handleSubmit} noValidate>
      <h2 className="sf-title">{t.formTitle}</h2>

      {/* ── Row: Age & Sex ── */}
      <div className="sf-row">
        <div className="sf-field">
          <label htmlFor="age">{t.age}</label>
          <input
            id="age"
            type="number"
            min={18}
            max={120}
            placeholder={t.agePlaceholder}
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
          />
          {errors.age && <span className="sf-error">{errors.age}</span>}
        </div>
        <div className="sf-field">
          <label htmlFor="sex">{t.sex}</label>
          <select
            id="sex"
            value={form.sex}
            onChange={(e) => set("sex", e.target.value)}
          >
            <option value="">{t.sexSelect}</option>
            <option value="male">{t.sexMale}</option>
            <option value="female">{t.sexFemale}</option>
          </select>
          {errors.sex && <span className="sf-error">{errors.sex}</span>}
        </div>
      </div>

      {/* ── Row: Height & Weight ── */}
      <div className="sf-row">
        <div className="sf-field">
          <label htmlFor="height_cm">{t.heightCm}</label>
          <input
            id="height_cm"
            type="number"
            min={100}
            max={250}
            placeholder={t.heightPlaceholder}
            value={form.height_cm}
            onChange={(e) => set("height_cm", e.target.value)}
          />
          {errors.height_cm && (
            <span className="sf-error">{errors.height_cm}</span>
          )}
        </div>
        <div className="sf-field">
          <label htmlFor="weight_kg">{t.weightKg}</label>
          <input
            id="weight_kg"
            type="number"
            min={20}
            max={300}
            placeholder={t.weightPlaceholder}
            value={form.weight_kg}
            onChange={(e) => set("weight_kg", e.target.value)}
          />
          {errors.weight_kg && (
            <span className="sf-error">{errors.weight_kg}</span>
          )}
        </div>
      </div>

      {/* ── Yes / No questions ── */}
      <YesNo field="high_bp" label={t.highBP} />
      <YesNo field="high_chol" label={t.highChol} />
      <YesNo field="smoker" label={t.smoker} />
      <YesNo field="phys_activity" label={t.physActivity} />

      {/* ── General health ── */}
      <div className="sf-field">
        <label htmlFor="gen_health">{t.genHealth}</label>
        <select
          id="gen_health"
          value={form.gen_health}
          onChange={(e) => set("gen_health", e.target.value)}
        >
          <option value="">{t.genHealthSelect}</option>
          {t.genHealthOptions.map((opt, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {opt}
            </option>
          ))}
        </select>
        {errors.gen_health && (
          <span className="sf-error">{errors.gen_health}</span>
        )}
      </div>

      {/* ── Already diagnosed ── */}
      <YesNo field="already_diagnosed" label={t.alreadyDiagnosed} />

      {/* ── Submit ── */}
      <button type="submit" className="sf-submit" disabled={loading}>
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  );
}
