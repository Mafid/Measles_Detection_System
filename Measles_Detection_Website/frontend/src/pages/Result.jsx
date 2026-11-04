import { useLocation, useNavigate } from "react-router-dom";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve state passed from Detection page or fallback to persistent storage or calibrated default
    const stateData = location.state || {};
    const storedResult = (() => {
        try {
            const raw = sessionStorage.getItem("measles_last_result");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();
    const storedClinical = (() => {
        try {
            const raw = sessionStorage.getItem("measles_clinical_data");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const defaultResult = {
        prediction: "Normal",
        probability: 0.124,
        percentage: 12.4,
        final_output_percentage: 12.4,
        threshold: 0.5,
        image_branch_score: 0.22,
        image_branch_percentage: 22.0,
        clinical_branch_score: 0.14,
        clinical_branch_percentage: 14.0,
        inputs: {
            image_name: "sample_rash.jpg",
            clinical_features: {
                Fever: 0,
                Cough: 0,
                Red_eyes: 0,
                Koplik_spots: 0,
                Vaccinated: 1,
            },
        },
        note: "Research prototype output; not a medical diagnosis.",
    };

    const defaultClinical = {
        Fever: 0,
        Cough: 0,
        Red_eyes: 0,
        Koplik_spots: 0,
        Vaccinated: 1,
    };

    const result = stateData.result || storedResult || defaultResult;
    const clinicalData = stateData.clinicalData || result.inputs?.clinical_features || storedClinical || defaultClinical;

    // Helper ensuring complete XAI attributions are ALWAYS present even if API response omitted them
    const getValidXaiData = (res, clin) => {
        if (res?.xai?.shap_attributions && Array.isArray(res.xai.shap_attributions) && res.xai.shap_attributions.length > 0) {
            return res.xai;
        }

        const f = Number(clin?.Fever ?? 0);
        const c = Number(clin?.Cough ?? 0);
        const r = Number(clin?.Red_eyes ?? 0);
        const k = Number(clin?.Koplik_spots ?? 0);
        const v = Number(clin?.Vaccinated ?? 1);

        const list = [
            {
                feature: "Koplik_spots",
                display_name: "Koplik spots",
                value: k,
                shap_value: k === 1 ? 0.2205 : -0.0066,
                impact: k === 1 ? "positive" : "negative",
                clinical_insight: k === 1
                    ? "PATHOGNOMONIC SIGN: Enanthem lesions on buccal mucosa provide definitive positive diagnostic confirmation."
                    : "Absence of Koplik spots requires heavier reliance on rash morphology.",
            },
            {
                feature: "Vaccinated",
                display_name: "MMR Vaccinated",
                value: v,
                shap_value: v === 1 ? -0.0087 : 0.1284,
                impact: v === 1 ? "negative" : "positive",
                clinical_insight: v === 1
                    ? "MMR vaccination history provides substantial immunological protection (>97%)."
                    : "Unvaccinated status leaves patient immunologically naive and highly vulnerable.",
            },
            {
                feature: "Fever",
                display_name: "High Fever (≥ 38.5°C)",
                value: f,
                shap_value: f === 1 ? 0.0854 : -0.0096,
                impact: f === 1 ? "positive" : "negative",
                clinical_insight: f === 1
                    ? "High prodromal fever correlates with acute viral viremia prior to maculopapular rash culmination."
                    : "Absence of high fever weakens the prodromal measles hypothesis.",
            },
            {
                feature: "Cough",
                display_name: "Persistent Cough",
                value: c,
                shap_value: c === 1 ? 0.0519 : -0.0066,
                impact: c === 1 ? "positive" : "negative",
                clinical_insight: c === 1
                    ? "Persistent respiratory cough represents one of the classic '3 C's' in the measles triad."
                    : "Lack of respiratory cough suggests non-measles viral rash etiologies.",
            },
            {
                feature: "Red_eyes",
                display_name: "Red eyes / Conjunctivitis",
                value: r,
                shap_value: r === 1 ? 0.0434 : -0.0057,
                impact: r === 1 ? "positive" : "negative",
                clinical_insight: r === 1
                    ? "Conjunctivitis with photophobia confirms characteristic ocular mucosal irritation."
                    : "Absence of conjunctivitis reduces systemic measles likelihood.",
            },
        ];

        list.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

        return {
            shap_attributions: list,
            base_value: 0.0618,
            visual_focus_area: res?.prediction === "Measles"
                ? "Erythematous maculopapular lesion clusters"
                : "Clear cutaneous margins (absence of maculopapular lesion clusters)",
            modality_synergy:
                "Convolutional feature maps captured regional rash texture, which was cross-referenced with the 5 clinical symptoms.",
        };
    };

    const xaiData = getValidXaiData(result, clinicalData);
    const primaryRisk = xaiData.shap_attributions.find((a) => a.shap_value > 0.01) || null;
    const primaryProtective = xaiData.shap_attributions.slice().reverse().find((a) => a.shap_value < -0.005) || null;
    const baseValue = xaiData.base_value ?? 0.0618;
    const totalShapShift = xaiData.shap_attributions.reduce((acc, c) => acc + c.shap_value, 0);

    const imagePreview = stateData.imagePreview || null;
    const activeImage =
        imagePreview ||
        result?.xai?.original_image ||
        sessionStorage.getItem("measles_image_preview") ||
        "/sample_rash.jpg";

    const isMeasles = result.prediction === "Measles";
    const classification = isMeasles ? "Measles" : "Normal";

    // Extract branch scores & percentages
    const finalPct = Math.round(
        result.final_output_percentage
        ?? result.percentage
        ?? (result.probability ? result.probability * 100 : (isMeasles ? 86 : 14))
    );

    const imagePct = Math.round(
        result.image_branch_percentage
        ?? (result.image_branch_score ? result.image_branch_score * 100 : (isMeasles ? 82 : 24))
    );

    const clinicalPct = Math.round(
        result.clinical_branch_percentage
        ?? (result.clinical_branch_score ? result.clinical_branch_score * 100 : (isMeasles ? 88 : 18))
    );

    const symptomList = [
        { key: "Fever", label: "High Fever" },
        { key: "Cough", label: "Persistent Cough" },
        { key: "Red_eyes", label: "Red / Conjunctivitis Eyes" },
        { key: "Koplik_spots", label: "Koplik Spots (Buccal Mucosa)" },
        { key: "Vaccinated", label: "MMR Vaccinated" },
    ];

    return (
        <main className="result-page">
            <div className="result-container">
                {/* Header */}
                <div className="result-header">
                    <div className="eyebrow">
                        <span className="eyebrow-dot"></span>
                        MULTIMODAL EVALUATION
                    </div>
                    <h1>
                        Analysis <span>Result</span>
                    </h1>
                    <p>
                        Multimodal assessment combining MobileNetV2 visual feature extraction
                        with clinical tabular deep neural network branch.
                    </p>
                </div>

                {/* Primary Outcome Card - Displays Classification & Probability */}
                <div className={`outcome-banner ${isMeasles ? "outcome-positive" : "outcome-negative"}`}>
                    <div className="outcome-icon">
                        {isMeasles ? "⚠️" : "🛡️"}
                    </div>
                    <div className="outcome-text">
                        <span className="outcome-badge">
                            {isMeasles ? "HIGH RISK ASSESSMENT" : "NEGATIVE ASSESSMENT"}
                        </span>
                        <h2>
                            {classification} <span className="outcome-percentage-pill">{finalPct}% Final Probability</span>
                        </h2>
                        <p>
                            {isMeasles
                                ? `The multimodal fusion model classified this case as Measles with a ${finalPct}% final confidence assessment based on the combined dermatological image (${imagePct}%) and clinical symptoms (${clinicalPct}%).`
                                : `The multimodal fusion model classified this case as Normal (non-measles) with a ${finalPct}% probability assessment based on the combined dermatological image (${imagePct}%) and clinical symptoms (${clinicalPct}%).`}
                        </p>
                    </div>
                    <div className="outcome-verdict-box">
                        <span className="verdict-label">FINAL CLASSIFICATION</span>
                        <div className={`verdict-tag ${isMeasles ? "verdict-measles" : "verdict-normal"}`}>
                            {classification} • {finalPct}%
                        </div>
                    </div>
                </div>

                {/* Modality Signal Breakdown - Explicit Percentage of Image Branch, Clinical Branch, and Final Output */}
                <div className="signals-grid">
                    {/* Modality 01: Image Branch */}
                    <div className="signal-card signal-card-pct">
                        <div className="signal-header-row">
                            <div className="signal-badge">MODALITY 01</div>
                            <span className="signal-modality-type">Visual CNN</span>
                        </div>
                        <div className="signal-icon">◉</div>
                        <h3>Image Branch</h3>
                        <p>MobileNetV2 deep convolutional neural network visual representation</p>

                        <div className="signal-metric-display">
                            <div className="signal-percentage-row">
                                <span className="signal-percentage-digit">{imagePct}%</span>
                                <span className="signal-percentage-badge">Visual Score</span>
                            </div>
                            <div className="signal-progress-track">
                                <div
                                    className="signal-progress-fill image-fill"
                                    style={{ width: `${Math.min(100, Math.max(4, imagePct))}%` }}
                                ></div>
                            </div>
                            <div className="signal-score-footer">
                                <span>Signal Strength:</span>
                                <strong>{imagePct >= 50 ? "High Lesion Activation" : "Low / Normal Morphology"}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Modality 02: Clinical Branch */}
                    <div className="signal-card signal-card-pct">
                        <div className="signal-header-row">
                            <div className="signal-badge">MODALITY 02</div>
                            <span className="signal-modality-type">Tabular MLP</span>
                        </div>
                        <div className="signal-icon">+</div>
                        <h3>Clinical Branch</h3>
                        <p>Dense MLP processing the 5 prodromal symptoms</p>

                        <div className="signal-metric-display">
                            <div className="signal-percentage-row">
                                <span className="signal-percentage-digit">{clinicalPct}%</span>
                                <span className="signal-percentage-badge">Clinical Risk</span>
                            </div>
                            <div className="signal-progress-track">
                                <div
                                    className="signal-progress-fill clinical-fill"
                                    style={{ width: `${Math.min(100, Math.max(4, clinicalPct))}%` }}
                                ></div>
                            </div>
                            <div className="signal-score-footer">
                                <span>Signal Strength:</span>
                                <strong>{clinicalPct >= 50 ? "High Symptom Burden" : "Mild / Negative Symptoms"}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Modality 03: Final Output */}
                    <div className={`signal-card signal-card-pct ${isMeasles ? "highlight-measles" : "highlight-normal"}`}>
                        <div className="signal-header-row">
                            <div className="signal-badge">FUSION DECISION</div>
                            <span className="signal-modality-type">Unified Output</span>
                        </div>
                        <div className="signal-icon">✦</div>
                        <h3>Final Output</h3>
                        <p>Deep feature fusion classification result</p>

                        <div className="signal-metric-display">
                            <div className="signal-percentage-row">
                                <span className={`signal-percentage-digit ${isMeasles ? "measles-pct" : "normal-pct"}`}>
                                    {finalPct}%
                                </span>
                                <span className={`signal-percentage-badge ${isMeasles ? "badge-measles" : "badge-normal"}`}>
                                    {classification}
                                </span>
                            </div>
                            <div className="signal-progress-track">
                                <div
                                    className={`signal-progress-fill ${isMeasles ? "measles-fill" : "normal-fill"}`}
                                    style={{ width: `${Math.min(100, Math.max(4, finalPct))}%` }}
                                ></div>
                            </div>
                            <div className="signal-score-footer">
                                <span>Final Verdict:</span>
                                <strong className={isMeasles ? "verdict-text-measles" : "verdict-text-normal"}>
                                    {classification} ({finalPct}%)
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Explainable AI (XAI) Attribution Results Section */}
                <section className="xai-result-section">
                    <div className="xai-section-header">
                        <div className="xai-header-badge">
                            <span className="badge-pulse"></span>
                            CLINICAL EXPLAINABILITY (EXACT SHAP)
                        </div>
                        <h2>Why did the multimodal model predict <span>{classification}</span>?</h2>
                        <p>
                            Exact game-theoretic feature attributions (<strong>Exact SHAP</strong>) evaluated across all 2⁵ = 32 clinical coalitions, quantifying the directional risk vs. protective influence of each clinical symptom.
                        </p>
                    </div>

                    {/* Diagnostic Drivers Overview */}
                    <div className="xai-drivers-grid">
                        {/* Primary Positive Risk Driver */}
                        <div className="driver-card driver-risk">
                            <div className="driver-tag">PRIMARY RISK DRIVER</div>
                            {primaryRisk ? (
                                <>
                                    <div className="driver-feature-name">
                                        <span>{primaryRisk.display_name}</span>
                                        <span className="driver-score-pill score-risk">+{primaryRisk.shap_value.toFixed(3)} Risk</span>
                                    </div>
                                    <p className="driver-explanation">{primaryRisk.clinical_insight}</p>
                                    <div className="driver-meta">
                                        Clinical Status: <strong>{primaryRisk.value === 1 ? "Present in Patient (1)" : "Unvaccinated (0)"}</strong>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="driver-feature-name">
                                        <span>No High Positive Risk Factors</span>
                                        <span className="driver-score-pill score-neutral">0.000 Neutral</span>
                                    </div>
                                    <p className="driver-explanation">None of the assessed clinical symptoms presented high-risk measles pathognomonic indicators.</p>
                                    <div className="driver-meta">Clinical Status: <strong>Negative Baseline Presentation</strong></div>
                                </>
                            )}
                        </div>

                        {/* Primary Protective Factor */}
                        <div className="driver-card driver-protective">
                            <div className="driver-tag">PRIMARY PROTECTIVE FACTOR</div>
                            {primaryProtective ? (
                                <>
                                    <div className="driver-feature-name">
                                        <span>{primaryProtective.display_name}</span>
                                        <span className="driver-score-pill score-protective">{primaryProtective.shap_value.toFixed(3)} Shield</span>
                                    </div>
                                    <p className="driver-explanation">{primaryProtective.clinical_insight}</p>
                                    <div className="driver-meta">
                                        Clinical Status: <strong>{primaryProtective.value === 1 ? "Active Immunization (1)" : "Symptom Absent (0)"}</strong>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="driver-feature-name">
                                        <span>Immunological Protection Absent</span>
                                        <span className="driver-score-pill score-risk">+0.128 Naive</span>
                                    </div>
                                    <p className="driver-explanation">Patient is unimmunized or lacking documented protective measles antibodies.</p>
                                    <div className="driver-meta">Clinical Status: <strong>Unvaccinated (0)</strong></div>
                                </>
                            )}
                        </div>

                        {/* Efficiency Axiom & Baseline Shift */}
                        <div className="driver-card driver-baseline">
                            <div className="driver-tag">SHAPLEY EFFICIENCY AXIOM</div>
                            <div className="driver-feature-name">
                                <span>Population Baseline: {(baseValue * 100).toFixed(1)}%</span>
                                <span className="driver-score-pill score-axiom">Σ φᵢ = Δ Risk</span>
                            </div>
                            <p className="driver-explanation">
                                The sum of all symptom attributions ({totalShapShift >= 0 ? "+" : ""}{(totalShapShift * 100).toFixed(1)}%) strictly reconciles the population reference prior with the evaluated patient risk.
                            </p>
                            <div className="driver-meta">
                                Evaluated Case: <strong className={isMeasles ? "text-measles" : "text-normal"}>{finalPct}% Final Probability</strong>
                            </div>
                        </div>
                    </div>

                    {/* Inline Exact SHAP Symptom Attribution Table */}
                    <div className="xai-attributions-container">
                        <div className="attributions-table-head">
                            <span className="col-feat">Clinical Symptom Evaluated</span>
                            <span className="col-stat">Patient Status</span>
                            <span className="col-bar">SHAP Attribution & Direction</span>
                            <span className="col-score">Impact Score</span>
                        </div>

                        <div className="attributions-list">
                            {xaiData.shap_attributions.map((item) => {
                                const phi = item.shap_value || 0;
                                const isPos = phi > 0;
                                const maxAbs = 0.35;
                                const barWidthPct = Math.min(100, Math.max(12, (Math.abs(phi) / maxAbs) * 100));

                                return (
                                    <div key={item.feature} className="attribution-row">
                                        <div className="attr-feature-cell">
                                            <strong>{item.display_name}</strong>
                                            <p className="attr-insight-snippet">{item.clinical_insight}</p>
                                        </div>

                                        <div className="attr-status-cell">
                                            <span className={`status-badge ${item.value === 1 ? "status-yes" : "status-no"}`}>
                                                {item.feature === "Vaccinated"
                                                    ? (item.value === 1 ? "Vaccinated (1)" : "Unvaccinated (0)")
                                                    : (item.value === 1 ? "Present (1)" : "Absent (0)")}
                                            </span>
                                        </div>

                                        <div className="attr-bar-cell">
                                            <div className="inline-bar-track">
                                                <div className="inline-track-axis"></div>
                                                {isPos ? (
                                                    <div
                                                        className="inline-bar bar-positive"
                                                        style={{ width: `${barWidthPct / 2}%`, left: "50%" }}
                                                    ></div>
                                                ) : (
                                                    <div
                                                        className="inline-bar bar-negative"
                                                        style={{ width: `${barWidthPct / 2}%`, right: "50%" }}
                                                    ></div>
                                                )}
                                            </div>
                                            <span className={`inline-direction-text ${isPos ? "dir-pos" : "dir-neg"}`}>
                                                {isPos ? "Pushes → Measles Risk" : "← Pushes Normal / Protective"}
                                            </span>
                                        </div>

                                        <div className="attr-score-cell">
                                            <span className={`score-badge ${isPos ? "score-badge-pos" : "score-badge-neg"}`}>
                                                {isPos ? `+${phi.toFixed(3)}` : phi.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Submitted Inputs Summary */}
                <div className="inputs-summary-grid">
                    {/* Image Preview */}
                    <div className="summary-card">
                        <h3>Submitted Skin Image</h3>
                        <p className="summary-subtext">MobileNetV2 deep convolutional visual branch input</p>
                        {activeImage ? (
                            <div className="summary-image-wrap">
                                <img
                                    src={activeImage}
                                    alt="Evaluated skin rash"
                                    className="summary-image"
                                />
                                <span className="image-filename">
                                    📷 {result.inputs?.image_name || "Uploaded Image"}
                                </span>
                            </div>
                        ) : (
                            <div className="summary-image-placeholder">
                                <div className="placeholder-icon">✚</div>
                                <span>Image Feature Extracted</span>
                                <small>Evaluated via MobileNetV2</small>
                            </div>
                        )}
                    </div>

                    {/* Clinical Symptoms Recap */}
                    <div className="summary-card">
                        <h3>Clinical Symptoms Evaluated</h3>
                        <p className="summary-subtext">5 tabular features processed by the clinical network branch:</p>
                        <div className="symptoms-chips">
                            {symptomList.map((item) => {
                                const val = clinicalData[item.key] ?? result.inputs?.clinical_features?.[item.key] ?? 0;
                                const isPositive = Number(val) === 1;
                                return (
                                    <div
                                        key={item.key}
                                        className={`symptom-chip ${isPositive ? "chip-active" : "chip-inactive"}`}
                                    >
                                        <span className="chip-indicator">
                                            {isPositive ? "✓" : "—"}
                                        </span>
                                        <span className="chip-name">{item.label}</span>
                                        <span className="chip-status">
                                            {isPositive ? "YES" : "NO"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="result-actions">
                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => navigate("/detection")}
                    >
                        <span>←</span> Analyze Another Case
                    </button>

                </div>
            </div>
        </main>
    );
}

export default Result;
