// Hindi UI text. Keys mirror en.js; anything missing here falls back to English.
const hi = {
  language: {
    label: 'भाषा',
    english: 'English',
    hindi: 'हिन्दी'
  },
  common: {
    back: 'वापस',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    close: 'बंद करें',
    edit: 'बदलें',
    viewAll: 'सभी देखें',
    recentScans: 'हाल के स्कैन',
    dayStreak: 'दिन की स्ट्रीक',
    unknown: 'अज्ञात',
    notAvailable: 'उपलब्ध नहीं',
    chooseOption: 'कोई विकल्प चुनें',
    mascotAlt: 'NutriOwl शुभंकर'
  },
  units: {
    kcal: 'कैलोरी',
    g: 'ग्राम',
    mg: 'मि.ग्रा.',
    L: 'लीटर',
    cm: 'सेमी',
    kg: 'किलो',
    years: 'साल'
  },
  nav: {
    home: 'होम',
    goals: 'लक्ष्य',
    scan: 'स्कैन',
    chat: 'चैट',
    profile: 'प्रोफ़ाइल',
    navigateTo: '{page} पर जाएँ'
  },
  auth: {
    eyebrowCreate: 'खाता बनाएँ',
    eyebrowBack: 'फिर से स्वागत है',
    eyebrowWelcome: 'स्वागत है',
    headingStart: 'चलिए\nशुरू करें',
    headingBack: 'आपको देखकर\nखुशी हुई',
    introSignup: 'अपने ईमेल और पासवर्ड से खाता बनाएँ।',
    introSignin: 'अपने ईमेल और पासवर्ड से साइन इन करें।',
    intro: 'अपनी पोषण यात्रा को अपने हिसाब से ढालने और लक्ष्यों पर बने रहने के लिए साइन इन करें या खाता बनाएँ।',
    signUp: 'साइन अप करें',
    signIn: 'साइन इन करें',
    createAccount: 'खाता बनाएँ',
    email: 'ईमेल',
    password: 'पासवर्ड',
    passwordPlaceholder: 'कम से कम 8 अक्षर',
    confirmPassword: 'पासवर्ड दोबारा लिखें',
    confirmPlaceholder: 'अपना पासवर्ड दोबारा लिखें',
    pleaseWait: 'कृपया प्रतीक्षा करें...',
    sessionExpired: 'आपका सेशन खत्म हो गया है, कृपया फिर से साइन इन करें।',
    terms: 'आगे बढ़कर, आप NutriOwl की सेहतमंद आदतों और व्यक्तिगत मार्गदर्शन से सहमत होते हैं।',
    errors: {
      invalidEmail: 'कृपया मान्य ईमेल पता दर्ज करें।',
      passwordShort: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते।',
      generic: 'आपका अनुरोध पूरा नहीं हो सका। कृपया फिर से कोशिश करें।'
    }
  },
  onboarding: {
    heading: 'आइए आपको\nजानें!',
    intro: 'कुछ जानकारी से NutriOwl आपके अनुभव को आपके अनुसार ढाल पाएगा।',
    nameLabel: '1. आपका नाम क्या है?',
    namePlaceholder: 'अपना नाम दर्ज करें',
    emailLabel: '2. आपके खाते का ईमेल',
    ageLabel: '3. आपकी उम्र क्या है?',
    agePlaceholder: 'जैसे 25',
    heightLabel: '4. आपकी लंबाई क्या है?',
    heightPlaceholder: 'जैसे 170',
    weightLabel: '5. आपका वज़न क्या है?',
    weightPlaceholder: 'अपना वज़न दर्ज करें',
    activityLabel: '6. आप रोज़ कितने सक्रिय रहते हैं?',
    goalLabel: '7. आपका लक्ष्य क्या है?',
    selectAll: '(जो भी लागू हों, सभी चुनें)',
    saving: 'सेव हो रहा है...',
    continue: 'आगे बढ़ें',
    safe: 'आपकी जानकारी NutriOwl के पास सुरक्षित है',
    activity: {
      low: { title: 'हल्का सक्रिय', desc: 'टहलना, हल्की गतिविधि, रोज़ 10–15 मिनट' },
      moderate: { title: 'मध्यम सक्रिय', desc: 'नियमित रूप से खेल-कूद' },
      high: { title: 'बहुत सक्रिय', desc: 'अक्सर खेल, ट्रेनिंग या ज़ोरदार गतिविधि' }
    },
    goals: {
      balanced: { title: 'संतुलित भोजन', desc: 'रोज़ खाने की सेहतमंद आदतें बनाएँ' },
      strength: { title: 'ताकत बढ़ाएँ', desc: 'ताकत और सक्रिय जीवन को बढ़ावा दें' },
      energy: { title: 'ज़्यादा ऊर्जा', desc: 'ऐसा भोजन चुनें जो रोज़ की गतिविधियों में मदद करे' },
      performance: { title: 'खेल में बेहतर प्रदर्शन', desc: 'गतिविधि और रिकवरी के लिए सही पोषण' },
      habits: { title: 'सेहतमंद आदतें', desc: 'एक संतुलित दिनचर्या बनाएँ' }
    },
    errors: {
      name: 'कृपया अपना नाम दर्ज करें',
      emailRequired: 'कृपया अपना ईमेल दर्ज करें',
      emailInvalid: 'कृपया मान्य ईमेल पता दर्ज करें',
      ageRequired: 'कृपया अपनी उम्र दर्ज करें',
      ageInvalid: 'कृपया सही उम्र दर्ज करें',
      heightRequired: 'कृपया अपनी लंबाई दर्ज करें',
      heightInvalid: 'कृपया सही लंबाई दर्ज करें',
      weightRequired: 'कृपया अपना वज़न दर्ज करें',
      weightInvalid: 'कृपया सही वज़न दर्ज करें',
      activity: 'कृपया अपनी गतिविधि का स्तर चुनें',
      goals: 'कृपया कम से कम एक लक्ष्य चुनें',
      save: 'आपकी प्रोफ़ाइल सेव नहीं हो सकी। कृपया फिर से कोशिश करें।'
    }
  },
  home: {
    greeting: 'नमस्ते, {name}!',
    friend: 'दोस्त',
    taglineBefore: 'आइए आज का दिन ',
    taglineHighlight: 'सेहतमंद',
    taglineAfter: ' बनाएँ!',
    todaysGoal: 'आज का लक्ष्य',
    noGoals: 'अभी कोई लक्ष्य नहीं है। अपना पहला लक्ष्य बनाने के लिए "लक्ष्य" पर टैप करें!',
    scanTitle: 'स्कैन करें',
    scanDesc: 'पोषण जानें',
    goalsTitle: 'लक्ष्य',
    goalsDesc: 'प्रगति देखें',
    chatTitle: 'चैट',
    chatDesc: 'NutriOwl से पूछें',
    profileTitle: 'प्रोफ़ाइल',
    profileDesc: 'देखें और बदलें',
    summary: 'आज का सारांश',
    emptyScans: 'आपकी भोजन यात्रा यहीं से शुरू होती है! 🌱',
    scanFirst: 'अपना पहला भोजन स्कैन करें'
  },
  history: {
    title: 'स्कैन इतिहास',
    subtitle: 'आपके सेव किए गए स्कैन नीचे दिखाए गए हैं।',
    empty: 'अभी तक कोई स्कैन नहीं। अपना पहला भोजन स्कैन करके देखें!',
    owlBubble: 'देखते हैं आपकी थाली में क्या है!'
  },
  scanner: {
    title: 'भोजन स्कैन करें',
    subtitle: 'अपना भोजन स्कैन करें और उसका पोषण जानें!',
    camera: 'कैमरा',
    upload: 'फ़ोटो अपलोड करें',
    error: 'हम इस तस्वीर का विश्लेषण नहीं कर सके। कृपया कोई दूसरी फ़ोटो आज़माएँ।',
    nutritionDetails: 'पोषण विवरण',
    servingEstimate: '{grams} ग्राम की सर्विंग का अनुमान',
    perServing: 'स्कैन की गई सर्विंग का पोषण',
    match: '{percent}% मिलान',
    healthScore: 'हेल्थ स्कोर',
    demoNotice: 'यह केवल डेमो अनुमान है। तस्वीर पहचान जुड़ी नहीं है, इसलिए ये मान आपके भोजन से अलग हो सकते हैं।',
    lowConfidence: 'यह मिलान पक्का नहीं है। अगर यह आपका भोजन नहीं है, तो एक ही व्यंजन की पास से और अच्छी रोशनी में ली गई फ़ोटो आज़माएँ।',
    vitamins: 'विटामिन',
    minerals: 'खनिज',
    vitamin: 'विटामिन',
    mineral: 'खनिज',
    noRecent: 'अभी कोई हाल का स्कैन नहीं। अपना पहला भोजन स्कैन करके देखें!',
    analyzing: 'आपके भोजन का विश्लेषण हो रहा है...',
    mayTakeMoment: 'इसमें थोड़ा समय लग सकता है',
    centerFood: 'अपने भोजन को फ़्रेम के बीच में रखें',
    flash: 'फ़्लैश',
    flip: 'कैमरा बदलें',
    tips: 'सुझाव',
    scan: 'स्कैन करें',
    uploadTitle: 'फ़ोटो अपलोड करें',
    uploadHint: 'अपनी गैलरी से कोई तस्वीर चुनें',
    uploadedAlt: 'अपलोड किया गया भोजन',
    tipsTitle: 'बेहतर नतीजों के लिए सुझाव',
    tipsBody: 'सटीक नतीजों के लिए प्राकृतिक रोशनी में फ़ोटो लें और धुंधली तस्वीरों से बचें।'
  },
  nutrients: {
    calories: 'कैलोरी',
    protein: 'प्रोटीन',
    carbohydrates: 'कार्बोहाइड्रेट',
    carbs: 'कार्ब्स',
    fat: 'वसा',
    sugar: 'चीनी',
    fiber: 'फ़ाइबर',
    sodium: 'सोडियम',
    water: 'पानी'
  },
  goals: {
    loading: 'लक्ष्य लोड हो रहे हैं...',
    title: 'आपके लक्ष्य',
    subtitle: 'अपने लक्ष्य तय करें, लगातार बने रहें और पहले से ज़्यादा सेहतमंद बनें!',
    awesome: 'आप कमाल कर रहे हैं! 🔥',
    keepGoing: 'अपने अगले पड़ाव तक पहुँचने के लिए लगे रहें।',
    daily: 'रोज़ के लक्ष्य',
    weekly: 'साप्ताहिक लक्ष्य',
    completedCount: '{done}/{total} पूरे',
    niceProgress: 'बढ़िया प्रगति!',
    completed: 'पूरा हुआ',
    editAria: '{goal} बदलें',
    addAria: '{goal} में जोड़ें',
    editorTitle: 'लक्ष्य बदलें',
    target: 'लक्ष्य ({unit})',
    targetAria: 'लक्ष्य मान',
    invalidTarget: 'कृपया शून्य से बड़ी कोई सही संख्या दर्ज करें',
    // Goal titles from the API, by goal id. {count} is the goal's current target.
    titles: {
      scan: 'एक भोजन स्कैन करें',
      protein: 'पर्याप्त प्रोटीन खाएँ',
      fruits: '{count} फल खाएँ',
      water: '{count} गिलास पानी पिएँ',
      active: 'इस हफ़्ते {count} दिन सक्रिय रहें',
      healthyMeals: 'सेहतमंद भोजन चुनें'
    },
    // Goal units from the API, by their English text.
    units: {
      'meal scanned': 'भोजन स्कैन',
      g: 'ग्राम',
      servings: 'सर्विंग',
      glasses: 'गिलास',
      days: 'दिन',
      'healthy meals': 'सेहतमंद भोजन'
    }
  },
  chat: {
    title: 'NutriOwl चैट',
    subtitle: 'आपका दोस्ताना पोषण साथी मदद के लिए हाज़िर है!',
    greeting: 'नमस्ते!',
    intro: 'पोषण, सेहतमंद खान-पान या अपनी डाइट के बारे में मुझसे कुछ भी पूछें!',
    thinking: 'NutriOwl सोच रहा है...',
    placeholder: 'NutriOwl से कुछ भी पूछें...',
    inputAria: 'चैट इनपुट',
    send: 'संदेश भेजें',
    newChat: 'नई चैट',
    limitedMode: 'सीमित मोड',
    supportMessage: 'सहायता संदेश',
    networkError: 'NutriOwl से संपर्क नहीं हो सका। अपना इंटरनेट कनेक्शन जाँचें और फिर से कोशिश करें।',
    retry: 'फिर से कोशिश करें',
    dailyLimit: 'आज की चैट सीमा पूरी हो गई है। कृपया कल फिर से कोशिश करें।',
    signedOut: 'आप साइन आउट हो गए हैं — अपने हिसाब से जवाब पाने के लिए फिर से साइन इन करें।',
    signIn: 'साइन इन करें',
    disclaimer: 'NutriOwl सेहत से जुड़ी सामान्य जानकारी देता है, यह चिकित्सकीय सलाह नहीं है।'
  },
  profile: {
    title: 'मेरी प्रोफ़ाइल',
    subtitle: 'अपनी प्रोफ़ाइल संभालें और\nअपनी पोषण यात्रा पर नज़र रखें!',
    openSettings: 'सेटिंग्स खोलें',
    editProfileAria: 'प्रोफ़ाइल बदलें',
    points: 'न्यूट्री पॉइंट्स',
    goalsSet: 'तय लक्ष्य',
    mealsScanned: 'स्कैन किए भोजन',
    myProgress: 'मेरी प्रगति',
    changePeriod: 'प्रगति की अवधि बदलें',
    thisWeek: 'इस हफ़्ते',
    weeklyStreak: 'साप्ताहिक स्ट्रीक',
    days: '{count} दिन',
    shortDays: ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'],
    myPreferences: 'मेरी पसंद',
    editPreferences: 'पसंद बदलें',
    editItem: '{item} बदलें',
    dietPreference: 'खान-पान',
    dailyCalorieGoal: 'रोज़ का कैलोरी लक्ष्य',
    activityLevel: 'गतिविधि स्तर',
    waterGoal: 'पानी का लक्ष्य',
    glasses: '{count} गिलास',
    name: 'नाम',
    closeDialog: 'डायलॉग बंद करें',
    logOutConfirm: 'लॉग आउट करें',
    menu: {
      notifications: { label: 'सूचनाएँ', description: 'रिमाइंडर संभालें' },
      privacy: { label: 'निजता और सुरक्षा', description: 'लोकल डेटा और निजता' },
      support: { label: 'मदद और सहायता', description: 'जानें NutriOwl कैसे काम करता है' },
      logout: { label: 'लॉग आउट', description: 'सुरक्षित रूप से साइन आउट करें' }
    },
    modal: {
      personal: 'प्रोफ़ाइल बदलें',
      preferences: 'पसंद',
      notifications: 'सूचनाएँ',
      privacy: 'निजता और सुरक्षा',
      support: 'मदद और सहायता',
      logout: 'लॉग आउट',
      settings: 'सेटिंग्स'
    },
    notifications: {
      dailyNutritionReminder: 'रोज़ का पोषण रिमाइंडर',
      goalReminders: 'लक्ष्य रिमाइंडर',
      hydrationReminders: 'पानी पीने के रिमाइंडर'
    },
    privacyText: [
      'NutriOwl आपकी खाता प्रोफ़ाइल और लक्ष्य ऐप के API सर्वर पर सेव करता है। आपका साइन-इन सेशन इसी ब्राउज़र में रहता है।',
      'API पासवर्ड को सादे टेक्स्ट में नहीं, बल्कि salted scrypt हैश के रूप में सेव करता है।',
      'साझा डिवाइस पर लोकल सेशन हटाने के लिए लॉग आउट करें।'
    ],
    support: [
      { title: 'NutriOwl कैसे काम करता है', body: 'लक्ष्य, भोजन स्कैन, पानी और प्रगति, सब एक ही जगह पर ट्रैक करें।' },
      { title: 'फ़ूड स्कैनर कैसे काम करता है', body: 'किसी भोजन को स्कैन करें, उसके पोषण की झलक पाएँ और उसे अपनी प्रोफ़ाइल में दर्ज करें।' },
      { title: 'लक्ष्य कैसे काम करते हैं', body: 'रोज़ के या साप्ताहिक लक्ष्य तय करें और हफ़्ते भर अपनी प्रगति अपडेट करते रहें।' },
      { title: 'चैट कैसे काम करती है', body: 'पोषण से जुड़े छोटे सवाल पूछें और उपयोगी सलाह से प्रेरित रहें।' },
      { title: 'सहायता', body: 'मदद के लिए ऐप के अंदर दिए गए मार्गदर्शन और पोषण ट्रैकिंग टूल का इस्तेमाल करते रहें।' }
    ],
    profileDetails: 'प्रोफ़ाइल विवरण',
    logoutQuestion: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
    logoutDetail: 'इससे इस ब्राउज़र में आपका मौजूदा सेशन बंद हो जाएगा, लेकिन आपका लोकल पोषण डेटा सेव रहेगा।'
  },
  options: {
    diet: {
      Vegetarian: 'शाकाहारी',
      'Non-vegetarian': 'मांसाहारी',
      Vegan: 'वीगन',
      Pescatarian: 'पेस्केटेरियन'
    },
    activity: {
      Low: 'कम',
      Moderate: 'मध्यम',
      High: 'ज़्यादा'
    }
  }
};

export default hi;
