// src/locales/ur/messages.js
// Urdu API response messages (Roman Urdu + Nastaliq)

const ur = {
  // General
  SERVER_ERROR: 'سرور میں خرابی آ گئی۔ براہ کرم دوبارہ کوشش کریں۔',
  NOT_FOUND: 'مطلوبہ معلومات نہیں ملیں۔',
  UNAUTHORIZED: 'آپ کو یہ کارروائی کرنے کی اجازت نہیں ہے۔',
  FORBIDDEN: 'رسائی ممنوع ہے۔',
  VALIDATION_ERROR: 'درج کردہ معلومات درست نہیں ہیں۔ براہ کرم دوبارہ چیک کریں۔',
  INVALID_ID: 'دیا گیا شناختی نمبر غلط ہے۔',

  // Auth
  LOGIN_SUCCESS: 'کامیابی سے لاگ ان ہو گئے۔',
  LOGIN_FAILED: 'ای میل یا پاس ورڈ غلط ہے۔',
  LOGOUT_SUCCESS: 'کامیابی سے لاگ آؤٹ ہو گئے۔',
  TOKEN_INVALID: 'تصدیقی ٹوکن غلط یا میعاد ختم ہو گئی ہے۔',
  TOKEN_REQUIRED: 'تصدیقی ٹوکن ضروری ہے۔',

  // Potholes
  POTHOLE_CREATED: 'گڑھے کی رپورٹ کامیابی سے جمع ہو گئی۔ کراچی کو بہتر بنانے میں مدد کا شکریہ!',
  POTHOLE_FOUND: 'گڑھے کی رپورٹ کامیابی سے مل گئی۔',
  POTHOLES_FOUND: 'گڑھوں کی رپورٹیں کامیابی سے مل گئیں۔',
  POTHOLE_NOT_FOUND: 'گڑھے کی رپورٹ نہیں ملی۔',
  POTHOLE_UPDATED: 'گڑھے کی حالت کامیابی سے اپ ڈیٹ ہو گئی۔',
  POTHOLE_DELETED: 'گڑھے کی رپورٹ کامیابی سے حذف ہو گئی۔',
  POTHOLE_FLAGGED: 'گڑھے کی رپورٹ کو نقل یا اسپام کے طور پر نشان زد کیا گیا۔',
  POTHOLE_CLUSTER_NOTE: 'قریب میں رپورٹوں کا جھرمٹ ملا۔ شدت کا اسکور بڑھا دیا گیا ہے۔',

  // Location
  LOCATION_REQUIRED: 'مقام کی معلومات (عرض البلد اور طول البلد) ضروری ہیں۔',
  IMAGE_REQUIRED: 'گڑھے کی کم از کم ایک تصویر ضروری ہے۔',

  // Admin
  STATS_FOUND: 'اعداد و شمار کامیابی سے مل گئے۔',
  HEATMAP_FOUND: 'ہیٹ میپ ڈیٹا کامیابی سے مل گیا۔',
};

export default ur;
