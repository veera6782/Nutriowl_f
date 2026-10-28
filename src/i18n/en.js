// English UI text. Keys mirror hi.js; anything missing there falls back to this file.
const en = {
  language: {
    label: 'Language',
    english: 'English',
    hindi: 'हिन्दी'
  },
  common: {
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    edit: 'Edit',
    viewAll: 'View All',
    recentScans: 'Recent Scans',
    dayStreak: 'Day Streak',
    unknown: 'Unknown',
    notAvailable: 'Not available',
    chooseOption: 'Choose an option',
    mascotAlt: 'NutriOwl mascot'
  },
  units: {
    kcal: 'kcal',
    g: 'g',
    mg: 'mg',
    L: 'L',
    cm: 'cm',
    kg: 'kg',
    years: 'years'
  },
  nav: {
    home: 'Home',
    goals: 'Goals',
    scan: 'Scan',
    chat: 'Chat',
    profile: 'Profile',
    navigateTo: 'Navigate to {page}'
  },
  auth: {
    eyebrowCreate: 'Create account',
    eyebrowBack: 'Welcome back',
    eyebrowWelcome: 'Welcome',
    headingStart: 'Let\'s get\nstarted',
    headingBack: 'Good to\nsee you',
    introSignup: 'Create an account with your email and a password.',
    introSignin: 'Sign in with your email and password.',
    intro: 'Sign in or create an account to personalize your nutrition journey and keep your goals on track.',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    email: 'Email',
    password: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    confirmPassword: 'Retype password',
    confirmPlaceholder: 'Retype your password',
    pleaseWait: 'Please wait...',
    terms: 'By continuing, you agree to NutriOwl\'s healthy habits and personalized guidance.',
    errors: {
      invalidEmail: 'Please enter a valid email address.',
      passwordShort: 'Password must be at least 8 characters.',
      passwordMismatch: 'Passwords do not match.',
      generic: 'Unable to complete your request. Please try again.'
    }
  },
  onboarding: {
    heading: 'Let’s get to\nknow you!',
    intro: 'A few details will help NutriOwl personalize your experience.',
    nameLabel: '1. What’s your name?',
    namePlaceholder: 'Enter your name',
    emailLabel: '2. Your account email',
    ageLabel: '3. How old are you?',
    agePlaceholder: 'e.g. 25',
    heightLabel: '4. What’s your height?',
    heightPlaceholder: 'e.g. 170',
    weightLabel: '5. What’s your weight?',
    weightPlaceholder: 'Enter your weight',
    activityLabel: '6. What’s your daily activity level?',
    goalLabel: '7. What’s your goal?',
    selectAll: '(Select all that apply)',
    saving: 'Saving...',
    continue: 'Continue',
    safe: 'Your information is safe with NutriOwl',
    activity: {
      low: { title: 'Lightly Active', desc: 'Walking, casual activity, 10–15 min/day' },
      moderate: { title: 'Moderately Active', desc: 'Sports or active play regularly' },
      high: { title: 'Highly Active', desc: 'Frequent sports, training or vigorous activity' }
    },
    goals: {
      balanced: { title: 'Eat More Balanced', desc: 'Build healthier everyday eating habits' },
      strength: { title: 'Build Strength', desc: 'Support strength and active living' },
      energy: { title: 'More Energy', desc: 'Choose foods that support your daily activities' },
      performance: { title: 'Improve Sports Performance', desc: 'Fuel your activities and recovery' },
      habits: { title: 'Build Healthy Habits', desc: 'Create a balanced routine' }
    },
    errors: {
      name: 'Please enter your name',
      emailRequired: 'Please enter your email',
      emailInvalid: 'Please enter a valid email address',
      ageRequired: 'Please enter your age',
      ageInvalid: 'Please enter a sensible age',
      heightRequired: 'Please enter your height',
      heightInvalid: 'Please enter a sensible height',
      weightRequired: 'Please enter your weight',
      weightInvalid: 'Please enter a sensible weight',
      activity: 'Please select your activity level',
      goals: 'Please select at least one goal',
      save: 'Unable to save your profile. Please try again.'
    }
  },
  home: {
    greeting: 'Hello, {name}!',
    friend: 'Friend',
    taglineBefore: 'Let’s make today a ',
    taglineHighlight: 'healthy',
    taglineAfter: ' day!',
    todaysGoal: 'Today’s Goal',
    noGoals: 'No goals yet. Tap Goals to set your first one!',
    scanTitle: 'Scan Food',
    scanDesc: 'Check nutrition',
    goalsTitle: 'Goals',
    goalsDesc: 'Track progress',
    chatTitle: 'Chat',
    chatDesc: 'Ask NutriOwl',
    profileTitle: 'Profile',
    profileDesc: 'View & edit',
    summary: 'Today’s Summary',
    emptyScans: 'Your food journey starts here! 🌱',
    scanFirst: 'Scan your first meal'
  },
  history: {
    title: 'Scan History',
    subtitle: 'Your saved scans are shown below.',
    empty: 'No scans yet. Try scanning your first meal!',
    owlBubble: 'Let\'s see what\'s on your plate!'
  },
  scanner: {
    title: 'Scan Food',
    subtitle: 'Scan your meal and discover its nutrition!',
    camera: 'Camera',
    upload: 'Upload Photo',
    error: 'We could not analyze this image. Please try another photo.',
    nutritionDetails: 'Nutrition details',
    servingEstimate: 'Estimated for a {grams} g serving',
    perServing: 'Nutrition per scanned serving',
    match: '{percent}% match',
    healthScore: 'Health score',
    demoNotice: 'Demo estimate only. Image recognition is not connected, so these values may not match your food.',
    lowConfidence: 'Low-confidence match. If this isn\'t your food, try a closer, well-lit photo of a single dish.',
    vitamins: 'Vitamins',
    minerals: 'Minerals',
    vitamin: 'Vitamin',
    mineral: 'Mineral',
    noRecent: 'No recent scans yet. Try scanning your first meal!',
    analyzing: 'Analyzing your meal...',
    mayTakeMoment: 'This may take a moment',
    centerFood: 'Center your food in the frame',
    flash: 'Flash',
    flip: 'Flip camera',
    tips: 'Tips',
    scan: 'Scan',
    uploadTitle: 'Upload a photo',
    uploadHint: 'Choose a picture from your gallery',
    uploadedAlt: 'Uploaded food',
    tipsTitle: 'Tips for best results',
    tipsBody: 'Use natural light and try to avoid blurry images for accurate results.'
  },
  nutrients: {
    calories: 'Calories',
    protein: 'Protein',
    carbohydrates: 'Carbohydrates',
    carbs: 'Carbs',
    fat: 'Fat',
    sugar: 'Sugar',
    fiber: 'Fiber',
    sodium: 'Sodium',
    water: 'Water'
  },
  goals: {
    loading: 'Loading goals...',
    title: 'Your Goals',
    subtitle: 'Set your goals, stay consistent and become your healthiest self!',
    awesome: 'You\'re doing awesome! 🔥',
    keepGoing: 'Keep going to reach your next milestone.',
    daily: 'Daily Goals',
    weekly: 'Weekly Goals',
    completedCount: '{done}/{total} completed',
    niceProgress: 'Nice progress!',
    completed: 'Completed',
    editAria: 'Edit {goal}',
    addAria: 'Add to {goal}',
    editorTitle: 'Edit Goal',
    target: 'Target ({unit})',
    targetAria: 'Target value',
    invalidTarget: 'Please enter a valid positive number'
    // Goal titles and units come from the API in English, so en has no overrides.
  },
  chat: {
    title: 'NutriOwl Chat',
    subtitle: 'Your friendly nutrition buddy is here to help!',
    greeting: 'Hi there!',
    intro: 'Ask me anything about nutrition, healthy eating or your diet!',
    thinking: 'NutriOwl is thinking...',
    placeholder: 'Ask NutriOwl anything...',
    inputAria: 'Chat input',
    send: 'Send message',
    newChat: 'New chat',
    limitedMode: 'Limited mode',
    supportMessage: 'Support message',
    networkError: 'Couldn\'t reach NutriOwl. Check your connection and try again.',
    retry: 'Retry',
    dailyLimit: 'You have reached today\'s chat limit. Please try again tomorrow.',
    sessionExpired: 'Your session has expired. Sign in again to keep chatting.',
    signIn: 'Sign in',
    disclaimer: 'NutriOwl gives general wellness information, not medical advice.'
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your profile and\ntrack your nutrition journey!',
    openSettings: 'Open settings',
    editProfileAria: 'Edit profile',
    points: 'Nutri Points',
    goalsSet: 'Goals Set',
    mealsScanned: 'Meals Scanned',
    myProgress: 'My Progress',
    changePeriod: 'Change progress period',
    thisWeek: 'This Week',
    weeklyStreak: 'Weekly Streak',
    days: '{count} days',
    shortDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    myPreferences: 'My Preferences',
    editPreferences: 'Edit preferences',
    editItem: 'Edit {item}',
    dietPreference: 'Diet Preference',
    dailyCalorieGoal: 'Daily Calorie Goal',
    activityLevel: 'Activity Level',
    waterGoal: 'Water Goal',
    glasses: '{count} glasses',
    name: 'Name',
    closeDialog: 'Close dialog',
    logOutConfirm: 'Log out',
    menu: {
      notifications: { label: 'Notifications', description: 'Manage reminders' },
      privacy: { label: 'Privacy & Security', description: 'Local data and privacy' },
      support: { label: 'Help & Support', description: 'Learn how NutriOwl works' },
      logout: { label: 'Log Out', description: 'Sign out safely' }
    },
    modal: {
      personal: 'Edit Profile',
      preferences: 'Preferences',
      notifications: 'Notifications',
      privacy: 'Privacy & Security',
      support: 'Help & Support',
      logout: 'Log Out',
      settings: 'Settings'
    },
    notifications: {
      dailyNutritionReminder: 'Daily nutrition reminder',
      goalReminders: 'Goal reminders',
      hydrationReminders: 'Hydration reminders'
    },
    privacyText: [
      'NutriOwl stores your account profile and goals on the app\'s API server. Your sign-in session is kept in this browser.',
      'Passwords are stored as salted scrypt hashes by the API, not as plain text.',
      'Use Log Out on shared devices to clear the local session.'
    ],
    support: [
      { title: 'How NutriOwl works', body: 'Track goals, food scans, hydration and progress in one place.' },
      { title: 'How Food Scanner works', body: 'Scan a meal to get a nutrition snapshot and log it against your profile.' },
      { title: 'How Goals work', body: 'Set daily or weekly goals and update progress as you move through the week.' },
      { title: 'How Chat works', body: 'Ask quick nutrition questions and stay motivated with helpful guidance.' },
      { title: 'Support', body: 'For help, continue using the in-app guidance and nutrition tracking tools.' }
    ],
    profileDetails: 'Profile details',
    logoutQuestion: 'Are you sure you want to log out?',
    logoutDetail: 'This closes your current app session in this browser, but keeps your local nutrition data saved.'
  },
  // Display names for values stored in English in the profile.
  options: {
    diet: {
      Vegetarian: 'Vegetarian',
      'Non-vegetarian': 'Non-vegetarian',
      Vegan: 'Vegan',
      Pescatarian: 'Pescatarian'
    },
    activity: {
      Low: 'Low',
      Moderate: 'Moderate',
      High: 'High'
    }
  }
};

export default en;
