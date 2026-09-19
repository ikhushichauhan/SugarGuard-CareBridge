const strings = {
  en: {
    /* ── Navbar ── */
    appName: "SugarGuard CareBridge",
    navHowItWorks: "How it works",
    navAbout: "About",
    navImpact: "Body Impact",
    navStartScreening: "Start Screening",
    langLabel: "हिन्दी",

    /* ── Hero ── */
    heroBadge: "Screening-to-Confirmation Assistant",
    heroTitleLine1: "From Screening",
    heroTitleLine2: "to the Next Step.",
    heroSubtitle:
      "Understand your diabetes screening result, see what influenced it, and prepare for the next appropriate care step.",
    heroCta: "Start Your Screening",
    heroCtaSubtext: "Takes about 2 minutes • No account required",

    /* ── Hero Card Visual ── */
    heroCardTitle: "Screening Intelligence",
    heroCardMetric1Label: "Screening Focus",
    heroCardMetric1Val: "Pre-Diagnostic",
    heroCardMetric2Label: "Model Signals",
    heroCardMetric2Val: "8 Indicators",
    heroCardStatus: "Care Navigation Ready",

    /* ── Trust Strip ── */
    trust1: "SCREENING TOOL",
    trust2: "EXPLAINABLE RESULT",
    trust3: "CARE NAVIGATION",
    trustTagline:
      "Designed to help you understand a screening indication — not replace professional medical care.",

    /* ── How it works ── */
    howItWorksHeading: "How it works",
    howItWorksTitle: "From a few answers to a clearer next step",
    howStep1Num: "01",
    howStep1Title: "Answer",
    howStep1Desc: "Tell us about your health metrics and lifestyle in 2 minutes.",
    howStep2Num: "02",
    howStep2Title: "Understand",
    howStep2Desc: "Receive an explainable screening indication and key contributing factors.",
    howStep3Num: "03",
    howStep3Title: "Prepare",
    howStep3Desc: "Know exactly what questions to discuss with a qualified healthcare professional.",

    /* ── Main Product Value (Dark Banner) ── */
    valueHeading: "Care Continuity",
    valueTitle: "A screening result shouldn't be the end of the journey.",
    valuePoint1: "Clear, non-alarmist screening indication",
    valuePoint2: "Understand key contributing model factors",
    valuePoint3: "Safe, standardized confirmation guidance",
    valuePoint4: "Track your care journey from screening to test",

    /* ── What this is / isn't ── */
    whatSectionTitle: "Built for clarity, safety, and trust",
    whatSectionSub: "We maintain strict clinical boundaries to ensure safe healthcare exploration.",
    helpsTitle: "This tool helps you:",
    helps1: "Understand your screening risk indication",
    helps2: "See transparent model contribution signals",
    helps3: "Prepare structured questions for your doctor visit",
    helps4: "Track your progression toward confirmatory testing",
    doesNotTitle: "This tool does not:",
    doesNot1: "Diagnose diabetes or prediabetes",
    doesNot2: "Prescribe medication, treatment, or restrictive diets",
    doesNot3: "Replace an evaluation by a qualified doctor",
    doesNot4: "Provide emergency or clinical care services",

    /* ── Landing Final CTA ── */
    ctaTitle: "Ready to understand your screening result?",
    ctaSubtitle: "Take 2 minutes to get an explainable screening indication and your personalized visit preparation summary.",
    ctaBtn: "Start Screening Now",
    ctaDisclaimer: "Screening indication only • Not a medical diagnosis",

    /* ── Screening Page Header & Progress ── */
    backToHome: "Back to Home",
    screeningTitle: "Diabetes Screening",
    screeningSubtitle: "Understand your current screening indication",
    progressStep1: "Your information",
    progressStep2: "Health & Lifestyle",
    progressStep3: "Safety Check",
    progressStepResult: "Your result",
    progressStepNext: "Next steps",

    /* ── Screening Form Sections ── */
    sec1Title: "About You",
    sec1Desc: "A few basic details help us understand your screening profile.",
    sec2Title: "Health & Lifestyle",
    sec2Desc: "Key health and activity factors evaluated by the screening model.",
    sec3Title: "Important Check",
    sec3Desc: "Please confirm your current diagnostic status before proceeding.",

    /* ── Form Inputs ── */
    age: "Age",
    agePlaceholder: "e.g. 45",
    sex: "Sex",
    sexSelect: "Select sex",
    sexMale: "Male",
    sexFemale: "Female",
    heightCm: "Height (cm)",
    heightPlaceholder: "e.g. 160",
    weightKg: "Weight (kg)",
    weightPlaceholder: "e.g. 75",
    highBP: "Do you have high blood pressure?",
    highChol: "Do you have high cholesterol?",
    smoker: "Have you smoked at least 100 cigarettes in your lifetime?",
    physActivity: "Have you been physically active in the past 30 days?",
    genHealth: "General health rating",
    genHealthSelect: "Select health rating",
    genHealthOptions: ["1 - Excellent", "2 - Very Good", "3 - Good", "4 - Fair", "5 - Poor"],
    alreadyDiagnosedQuestion: "Have you already been diagnosed with diabetes?",
    alreadyDiagnosedNo: "No, I have not",
    alreadyDiagnosedYes: "Yes, I have",
    alreadyDiagnosedWarning:
      "If you have already been diagnosed, this screening tool isn't intended for your situation. Please continue direct care with your healthcare provider.",

    yes: "Yes",
    no: "No",
    formDisclaimer: "Your information is used to generate a screening indication, not a diagnosis.",
    submitBtn: "Continue to Result →",
    analyzingBtn: "Analyzing your responses...",

    /* ── Validation ── */
    required: "This field is required.",
    ageRange: "Age must be between 18 and 120.",
    heightRange: "Height must be between 100 and 250 cm.",
    weightRange: "Weight must be between 20 and 300 kg.",

    /* ── Analyzing Screen ── */
    analyzingTitle: "Analyzing Your Responses",
    analyzingSubtitle: "Evaluating 8 risk signals through the calibrated screening model...",
    analyzingStep1: "Validating input parameters",
    analyzingStep2: "Computing BMI and age categories",
    analyzingStep3: "Generating explainable feature contribution signals",

    /* ── Result Page ── */
    resultPageTitle: "Your Screening Result",
    resultPageSub: "Based on the information and lifestyle indicators you provided",
    elevatedResult: "Elevated Screening Risk",
    lowerResult: "Lower Screening Risk",
    resultBadgeElevated: "Elevated Risk Indication",
    resultBadgeLower: "Lower Risk Indication",
    resultCardDisclaimer: "This is a screening indication only. It is not a medical diagnosis.",
    bmiLabel: "Calculated BMI",
    bmiUnit: "kg/m²",
    factorsTitle: "What influenced your result?",
    factorsSubtitle: "Top factors with greatest contribution to this screening indication:",
    factorsDisclaimer: "These reflect model contribution signals. They are not medical diagnoses.",
    directionIncreased: "Contributed toward elevated risk",
    directionDecreased: "Contributed toward lower risk",
    factorNames: {
      HighBP: "High Blood Pressure",
      HighChol: "High Cholesterol",
      Age: "Age Group",
      Sex: "Sex",
      BMI: "Body Mass Index (BMI)",
      Smoker: "Smoking History",
      PhysActivity: "Physical Activity",
      GenHlth: "General Health Rating",
    },
    whatToDoTitle: "What to do next",
    whatToDoDesc: "Your screening result is not a diagnosis. Consider discussing appropriate confirmatory testing with a healthcare professional.",
    continueToNextStep: "Continue to Next Step (Care Passport) →",
    startNewScreening: "Start New Screening",

    /* ── Care Journey / Passport Page ── */
    journeyPageTitle: "Your Next Step",
    journeyPageSub: "Move from a screening result toward appropriate confirmation and care.",
    guidanceCardTag: "CONFIRMATION GUIDANCE",
    guidanceCardTitle: "A screening result is not a diagnosis.",
    guidanceCardBody:
      "Discuss appropriate confirmatory testing (such as fasting blood glucose or HbA1c) with a qualified healthcare professional. Do not make changes to your medication or lifestyle treatments without clinical guidance.",
    
    passportHeading: "Your Confirmation Passport",
    passportSub: "A clean, structured summary you can take to your healthcare appointment.",
    passportSummaryTitle: "Screening Summary",
    passportIndicationLabel: "Screening Indication",
    passportBmiLabel: "Calculated BMI",
    passportDateLabel: "Screening Date",
    passportFactorsLabel: "Key Model Contribution Signals",
    passportFootnote: "Generated by SugarGuard CareBridge • Screening Aid only • Not a diagnostic medical record.",
    downloadPassportBtn: "Download / Print Visit Summary",
    downloadReadyText: "Ready for your appointment",

    careJourneyTitle: "Care Journey",
    trackerSteps: [
      "Screened",
      "Confirmation Advised",
      "Test Pending",
      "Follow-up Done",
    ],

    whatToDiscussTitle: "Before your visit",
    whatToDiscussSub: "Key discussion points to bring to your doctor:",
    discussPoint1: "Your screening result indication and calculated BMI",
    discussPoint2: "Your personal health indicators (blood pressure, activity, family history)",
    discussPoint3: "Whether confirmatory testing (e.g. HbA1c / FPG) is clinically appropriate",
    discussPoint4: "What follow-up schedule is recommended by your healthcare professional",

    readyForNextStep: "Ready for your next step?",
    backToResultBtn: "← Back to Result",

    /* ── Errors / Safety Banners ── */
    warningsTitle: "Screening Warnings",
    networkError: "Unable to reach the screening service. Please check your connection and try again.",
    serverError: "Something went wrong on our end. Please try again in a moment.",
    unexpectedError: "An unexpected error occurred. Please try again.",
    exitTitle: "Screening Not Applicable",
    blockTitle: "Unable to Process",
    tryAgain: "Try Again",
  },

  hi: {
    /* ── Navbar ── */
    appName: "SugarGuard CareBridge",
    navHowItWorks: "यह कैसे काम करता है",
    navAbout: "हमारे बारे में",
    navImpact: "शारीरिक प्रभाव",
    navStartScreening: "स्क्रीनिंग शुरू करें",
    langLabel: "English",

    /* ── Hero ── */
    heroBadge: "स्क्रीनिंग-से-पुष्टि सहायक",
    heroTitleLine1: "स्क्रीनिंग से",
    heroTitleLine2: "अगले कदम तक।",
    heroSubtitle:
      "अपने मधुमेह स्क्रीनिंग परिणाम को समझें, जानें कि किस कारक ने इसे प्रभावित किया, और अगले उचित स्वास्थ्य कदम के लिए तैयार हों।",
    heroCta: "अपनी स्क्रीनिंग शुरू करें",
    heroCtaSubtext: "लगभग 2 मिनट का समय • किसी खाते की आवश्यकता नहीं",

    /* ── Hero Card Visual ── */
    heroCardTitle: "स्क्रीनिंग इंटेलिजेंस",
    heroCardMetric1Label: "स्क्रीनिंग स्तर",
    heroCardMetric1Val: "प्री-डायग्नोस्टिक",
    heroCardMetric2Label: "मॉडल संकेतक",
    heroCardMetric2Val: "8 कारक",
    heroCardStatus: "केयर नेविगेशन तैयार",

    /* ── Trust Strip ── */
    trust1: "स्क्रीनिंग टूल",
    trust2: "स्पष्ट परिणाम",
    trust3: "केयर नेविगेशन",
    trustTagline:
      "स्क्रीनिंग संकेत को समझने में मदद के लिए डिज़ाइन किया गया — पेशेवर चिकित्सा देखभाल का विकल्प नहीं।",

    /* ── How it works ── */
    howItWorksHeading: "कार्यप्रणाली",
    howItWorksTitle: "कुछ सरल उत्तरों से एक स्पष्ट अगले कदम तक",
    howStep1Num: "01",
    howStep1Title: "उत्तर दें",
    howStep1Desc: "अपने स्वास्थ्य और जीवनशैली के बारे में 2 मिनट में बताएं।",
    howStep2Num: "02",
    howStep2Title: "समझें",
    howStep2Desc: "एक स्पष्ट स्क्रीनिंग संकेत और प्रमुख योगदान कारक प्राप्त करें।",
    howStep3Num: "03",
    howStep3Title: "तैयार हों",
    howStep3Desc: "जानें कि स्वास्थ्य पेशेवर के साथ क्या महत्वपूर्ण प्रश्न चर्चा करने हैं।",

    /* ── Main Product Value (Dark Banner) ── */
    valueHeading: "देखभाल की निरंतरता",
    valueTitle: "स्क्रीनिंग परिणाम यात्रा का अंत नहीं होना चाहिए।",
    valuePoint1: "स्पष्ट और गैर-चिंताजनक स्क्रीनिंग संकेत",
    valuePoint2: "मॉडल के प्रमुख योगदान कारकों को समझें",
    valuePoint3: "सुरक्षित और मानकीकृत पुष्टि मार्गदर्शन",
    valuePoint4: "स्क्रीनिंग से परीक्षण तक अपनी देखभाल यात्रा को ट्रैक करें",

    /* ── What this is / isn't ── */
    whatSectionTitle: "स्पष्टता, सुरक्षा और विश्वास के लिए निर्मित",
    whatSectionSub: "हम सुरक्षित स्वास्थ्य अन्वेषण सुनिश्चित करने के लिए सख्त नैदानिक सीमाओं का पालन करते हैं।",
    helpsTitle: "यह टूल आपकी मदद करता है:",
    helps1: "अपने स्क्रीनिंग जोखिम संकेत को समझने में",
    helps2: "पारदर्शी मॉडल योगदान संकेतों को देखने में",
    helps3: "डॉक्टर से मिलने के लिए महत्वपूर्ण प्रश्न तैयार करने में",
    helps4: "पुष्टि परीक्षण की दिशा में अपनी प्रगति ट्रैक करने में",
    doesNotTitle: "यह टूल यह नहीं करता:",
    doesNot1: "मधुमेह या प्रीडायबिटीज का निदान करना",
    doesNot2: "दवाएं, उपचार या प्रतिबंधात्मक आहार निर्धारित करना",
    doesNot3: "योग्य डॉक्टर के परामर्श का स्थान लेना",
    doesNot4: "आपातकालीन या अस्पताल सेवाएं प्रदान करना",

    /* ── Landing Final CTA ── */
    ctaTitle: "क्या आप अपना स्क्रीनिंग परिणाम समझने के लिए तैयार हैं?",
    ctaSubtitle: "एक पारदर्शी स्क्रीनिंग संकेत और अपनी व्यक्तिगत डॉक्टर विज़िट समरी प्राप्त करने के लिए 2 मिनट दें।",
    ctaBtn: "अभी स्क्रीनिंग शुरू करें",
    ctaDisclaimer: "केवल स्क्रीनिंग संकेत • चिकित्सा निदान नहीं",

    /* ── Screening Page Header & Progress ── */
    backToHome: "होम पर वापस जाएं",
    screeningTitle: "मधुमेह स्क्रीनिंग",
    screeningSubtitle: "अपने वर्तमान स्क्रीनिंग संकेत को समझें",
    progressStep1: "आपकी जानकारी",
    progressStep2: "स्वास्थ्य एवं जीवनशैली",
    progressStep3: "सुरक्षा जांच",
    progressStepResult: "आपका परिणाम",
    progressStepNext: "अगले कदम",

    /* ── Screening Form Sections ── */
    sec1Title: "आपके बारे में",
    sec1Desc: "कुछ बुनियादी विवरण आपकी स्क्रीनिंग प्रोफाइल को समझने में मदद करते हैं।",
    sec2Title: "स्वास्थ्य एवं जीवनशैली",
    sec2Desc: "स्क्रीनिंग मॉडल द्वारा मूल्यांकित मुख्य स्वास्थ्य और गतिविधि कारक।",
    sec3Title: "महत्वपूर्ण जांच",
    sec3Desc: "कृपया आगे बढ़ने से पहले अपनी वर्तमान स्थिति की पुष्टि करें।",

    /* ── Form Inputs ── */
    age: "उम्र",
    agePlaceholder: "जैसे 45",
    sex: "लिंग",
    sexSelect: "लिंग चुनें",
    sexMale: "पुरुष",
    sexFemale: "महिला",
    heightCm: "लंबाई (सेमी)",
    heightPlaceholder: "जैसे 160",
    weightKg: "वज़न (किग्रा)",
    weightPlaceholder: "जैसे 75",
    highBP: "क्या आपको उच्च रक्तचाप की समस्या है?",
    highChol: "क्या आपका कोलेस्ट्रॉल बढ़ा हुआ है?",
    smoker: "क्या आपने जीवन में कम से कम 100 सिगरेट पी हैं?",
    physActivity: "क्या पिछले 30 दिनों में आप शारीरिक रूप से सक्रिय रहे हैं?",
    genHealth: "सामान्य स्वास्थ्य रेटिंग",
    genHealthSelect: "स्वास्थ्य रेटिंग चुनें",
    genHealthOptions: ["1 - उत्कृष्ट", "2 - बहुत अच्छा", "3 - अच्छा", "4 - सामान्य", "5 - कमजोर"],
    alreadyDiagnosedQuestion: "क्या आपको पहले से मधुमेह का निदान हो चुका है?",
    alreadyDiagnosedNo: "नहीं, मुझे नहीं हुआ है",
    alreadyDiagnosedYes: "हाँ, मुझे निदान हुआ है",
    alreadyDiagnosedWarning:
      "यदि आपको पहले से निदान हो चुका है, तो यह स्क्रीनिंग टूल आपके लिए उपयुक्त नहीं है। कृपया अपने डॉक्टर से परामर्श जारी रखें।",

    yes: "हाँ",
    no: "नहीं",
    formDisclaimer: "आपकी जानकारी का उपयोग स्क्रीनिंग संकेत उत्पन्न करने के लिए किया जाता है, निदान के लिए नहीं।",
    submitBtn: "परिणाम के लिए आगे बढ़ें →",
    analyzingBtn: "प्रतिक्रियाओं का विश्लेषण किया जा रहा है...",

    /* ── Validation ── */
    required: "यह फ़ील्ड आवश्यक है।",
    ageRange: "उम्र 18 से 120 के बीच होनी चाहिए।",
    heightRange: "लंबाई 100 से 250 सेमी के बीच होनी चाहिए।",
    weightRange: "वज़न 20 से 300 किग्रा के बीच होना चाहिए।",

    /* ── Analyzing Screen ── */
    analyzingTitle: "आपकी प्रतिक्रियाओं का विश्लेषण हो रहा है",
    analyzingSubtitle: "स्क्रीनिंग मॉडल के माध्यम से 8 जोखिम कारकों का मूल्यांकन...",
    analyzingStep1: "इनपुट मापदंडों का सत्यापन",
    analyzingStep2: "BMI और आयु श्रेणियों की गणना",
    analyzingStep3: "मॉडल योगदान संकेतों का विश्लेषण",

    /* ── Result Page ── */
    resultPageTitle: "आपका स्क्रीनिंग परिणाम",
    resultPageSub: "आपके द्वारा प्रदान की गई जानकारी और स्वास्थ्य संकेतकों के आधार पर",
    elevatedResult: "बढ़ा हुआ स्क्रीनिंग जोखिम",
    lowerResult: "कम स्क्रीनिंग जोखिम",
    resultBadgeElevated: "बढ़ा हुआ जोखिम संकेत",
    resultBadgeLower: "कम जोखिम संकेत",
    resultCardDisclaimer: "यह केवल एक स्क्रीनिंग संकेत है। यह कोई चिकित्सा निदान नहीं है।",
    bmiLabel: "गणना किया गया BMI",
    bmiUnit: "किग्रा/मी²",
    factorsTitle: "किसने आपके परिणाम को प्रभावित किया?",
    factorsSubtitle: "वे प्रमुख कारक जिन्होंने इस स्क्रीनिंग संकेत में सबसे अधिक योगदान दिया:",
    factorsDisclaimer: "ये मॉडल के योगदान संकेत हैं। ये चिकित्सा निदान नहीं हैं।",
    directionIncreased: "बढ़े हुए जोखिम की ओर योगदान",
    directionDecreased: "कम जोखिम की ओर योगदान",
    factorNames: {
      HighBP: "उच्च रक्तचाप",
      HighChol: "उच्च कोलेस्ट्रॉल",
      Age: "आयु वर्ग",
      Sex: "लिंग",
      BMI: "बॉडी मास इंडेक्स (BMI)",
      Smoker: "धूम्रपान इतिहास",
      PhysActivity: "शारीरिक गतिविधि",
      GenHlth: "सामान्य स्वास्थ्य रेटिंग",
    },
    whatToDoTitle: "आगे क्या करना है",
    whatToDoDesc: "आपका स्क्रीनिंग परिणाम कोई निदान नहीं है। एक योग्य स्वास्थ्य पेशेवर के साथ उचित पुष्टि परीक्षण पर चर्चा करने पर विचार करें।",
    continueToNextStep: "अगले कदम (केयर पासपोर्ट) पर आगे बढ़ें →",
    startNewScreening: "नई स्क्रीनिंग शुरू करें",

    /* ── Care Journey / Passport Page ── */
    journeyPageTitle: "आपका अगला कदम",
    journeyPageSub: "स्क्रीनिंग परिणाम से उचित पुष्टि और देखभाल की ओर बढ़ें।",
    guidanceCardTag: "पुष्टि मार्गदर्शन",
    guidanceCardTitle: "स्क्रीनिंग परिणाम कोई निदान नहीं है।",
    guidanceCardBody:
      "योग्य स्वास्थ्य पेशेवर के साथ उपयुक्त पुष्टि परीक्षण (जैसे फास्टिंग ब्लड ग्लूकोज़ या HbA1c) के बारे में चर्चा करें। डॉक्टरी सलाह के बिना अपनी दवाओं या उपचार में कोई बदलाव न करें।",
    
    passportHeading: "आपका कन्फर्मेशन पासपोर्ट",
    passportSub: "एक साफ, संरचित सारांश जिसे आप अपने डॉक्टर के पास ले जा सकते हैं।",
    passportSummaryTitle: "स्क्रीनिंग सारांश",
    passportIndicationLabel: "स्क्रीनिंग संकेत",
    passportBmiLabel: "गणना किया गया BMI",
    passportDateLabel: "स्क्रीनिंग तिथि",
    passportFactorsLabel: "मुख्य मॉडल योगदान संकेत",
    passportFootnote: "SugarGuard CareBridge द्वारा निर्मित • केवल स्क्रीनिंग सहायता • नैदानिक मेडिकल रिकॉर्ड नहीं।",
    downloadPassportBtn: "विज़िट सारांश डाउनलोड / प्रिंट करें",
    downloadReadyText: "डॉक्टर परामर्श के लिए तैयार",

    careJourneyTitle: "केयर यात्रा (Care Journey)",
    trackerSteps: [
      "स्क्रीनिंग पूर्ण",
      "पुष्टि की सलाह",
      "परीक्षण लंबित",
      "फॉलो-अप पूर्ण",
    ],

    whatToDiscussTitle: "डॉक्टर से मिलने से पहले",
    whatToDiscussSub: "डॉक्टर के साथ चर्चा करने के लिए मुख्य बिंदु:",
    discussPoint1: "आपका स्क्रीनिंग जोखिम संकेत और गणना किया गया BMI",
    discussPoint2: "आपके व्यक्तिगत स्वास्थ्य कारक (रक्तचाप, गतिविधि, धूम्रपान)",
    discussPoint3: "क्या आपके लिए पुष्टि परीक्षण (जैसे HbA1c / FPG) आवश्यक है",
    discussPoint4: "आपके स्वास्थ्य पेशेवर द्वारा अनुशंसित फॉलो-अप योजना क्या है",

    readyForNextStep: "क्या आप अगले कदम के लिए तैयार हैं?",
    backToResultBtn: "← परिणाम पर वापस जाएं",

    /* ── Errors / Safety Banners ── */
    warningsTitle: "स्क्रीनिंग चेतावनियाँ",
    networkError: "स्क्रीनिंग सेवा से संपर्क नहीं हो पा रहा। कृपया अपना कनेक्शन जांचें और फिर प्रयास करें।",
    serverError: "कुछ गड़बड़ हो गई। कृपया थोड़ी देर बाद फिर प्रयास करें।",
    unexpectedError: "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।",
    exitTitle: "स्क्रीनिंग लागू नहीं",
    blockTitle: "प्रक्रिया नहीं हो सकी",
    tryAgain: "फिर प्रयास करें",
  },
};

export default strings;
