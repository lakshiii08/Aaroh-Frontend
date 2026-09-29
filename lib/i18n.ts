export type Language = "en" | "hi" | "sat";

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_flashcards: "Flash Cards",
    nav_worksheets: "Worksheets",
    nav_evaluations: "Evaluations",
    nav_notifications: "Notifications",
    nav_settings: "Settings",
    nav_translate: "Talk & Translate",
    nav_signout: "Sign Out",
    nav_teacher_overview: "Class Overview",
    nav_teacher_materials: "Books & Materials",
    nav_teacher_worksheets: "Assignments & Subjects",
    nav_teacher_students: "Student Performance",
    nav_teacher_settings: "Teacher Settings",
    nav_teacher_report: "Flashcard Report",

    // Dashboard
    greeting_johar: "Johar",
    dashboard_question: "What do you want to learn today?",
    dashboard_badges: "Badges",
    dashboard_accuracy: "Accuracy",
    dashboard_continue: "Continue Learning",
    dashboard_mock_test: "Mock Test",
    dashboard_start_test: "Start Test",
    dashboard_your_progress: "Your Progress",
    dashboard_needs_practice: "Needs a little practice",
    dashboard_all_caught_up: "All caught up!",

    // Flashcards
    flashcards_title: "Santhali Flashcards",
    flashcards_subtitle: "Learn vocabulary with interactive flashcards. Tap to reveal Hindi and English translations.",
    flashcards_tap_to_reveal: "Tap card to flip for Hindi & English",
    flashcards_back_label: "Hindi & English Translations",
    flashcards_got_it: "Got it right",
    flashcards_needs_practice: "Needs practice",
    flashcards_skip: "Next card",
    flashcards_play_audio: "Play audio",
    flashcards_search_placeholder: "Search vocabulary or category...",
    flashcards_category_all: "All Categories",
    flashcards_category_vocab: "Vocabulary",
    flashcards_category_science: "Science",
    flashcards_category_math: "Math",
    flashcards_category_social: "Social Studies",
    flashcards_card_count: "Card {current} of {total}",
    flashcards_reviewed: "{count} reviewed this session",
    flashcards_load_more: "Load More Vocabulary",
    flashcards_1m_dataset: "1M+ Vocabulary Search & Browse System",
    flashcards_empty: "No flashcards found for this category.",

    // Worksheets
    worksheets_title: "Worksheets",
    worksheets_subtitle: "Access teacher-published worksheets translated into Santali.",
    worksheets_folders: "Subject Folders",
    worksheets_select_subject: "Select a subject to view available worksheets",
    worksheets_no_worksheets: "No worksheets available yet in this subject.",
    worksheets_teacher_empty: "Your teacher's worksheets will appear here automatically.",
    worksheets_due: "Due",
    worksheets_status: "Status",
    worksheets_action_view: "View Worksheet",
    worksheets_action_download: "Download PDF",
    worksheets_action_submit: "Submit Assignment",
    worksheets_upload_title: "Upload Completed Worksheet",
    worksheets_select_file: "Select file to submit (PDF, Image, Doc)",
    worksheets_submitting: "Submitting...",
    worksheets_submit_success: "Worksheet submitted successfully!",
    worksheets_overdue_notice: "Deadline passed. Late submissions depend on teacher rules.",
    worksheets_translating: "Translating worksheet to Santali...",

    // Statuses
    status_new: "New",
    status_pending: "Pending",
    status_submitted: "Submitted",
    status_due_soon: "Due Soon",
    status_overdue: "Overdue",

    // Notifications
    notifications_title: "Notifications",
    notifications_empty: "No notifications right now.",
    notifications_mark_all: "Mark all as read",
    notifications_new_worksheet: "New worksheet published",

    // Settings
    settings_title: "Settings",
    settings_language_heading: "Global System Language",
    settings_language_desc: "Changes the language of buttons, labels, and menus across the entire application.",
    settings_profile_heading: "Student Profile",
    settings_name: "Full Name",
    settings_roll: "Roll Number",
    settings_grade: "Grade / Class",
    settings_school: "School / Village",
    settings_saved: "Preferences saved!",
    settings_save_btn: "Save Preferences",

    // Auth & Login
    login_welcome: "Welcome back",
    login_choose_role: "Choose how you sign in.",
    login_student_tab: "Student Login",
    login_teacher_tab: "Teacher Login",
    login_select_lang_prompt: "Choose your preferred system language",
    login_roll_label: "Roll number",
    login_pin_label: "PIN",
    login_start_learning: "Start Learning",
    login_teacher_dashboard: "Go to Teacher Dashboard",

    // Common UI
    loading: "Loading...",
    error_generic: "An error occurred. Please try again.",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
  },
  hi: {
    // Navigation
    nav_dashboard: "डैशबोर्ड",
    nav_flashcards: "फ्लैश कार्ड",
    nav_worksheets: "कार्यपत्रक (वर्कशीट)",
    nav_evaluations: "मूल्यांकन",
    nav_notifications: "सूचनाएं",
    nav_settings: "सेटिंग्स",
    nav_translate: "बोलें और अनुवाद करें",
    nav_signout: "साइन आउट",
    nav_teacher_overview: "कक्षा अवलोकन",
    nav_teacher_materials: "किताबें एवं अध्ययन सामग्री",
    nav_teacher_worksheets: "असाइनमेंट और विषय",
    nav_teacher_students: "छात्र प्रदर्शन",
    nav_teacher_settings: "शिक्षक सेटिंग्स",
    nav_teacher_report: "फ्लैशकार्ड रिपोर्ट",

    // Dashboard
    greeting_johar: "जोहार",
    dashboard_question: "आज आप क्या सीखना चाहते हैं?",
    dashboard_badges: "बैज",
    dashboard_accuracy: "सटीकता",
    dashboard_continue: "पढ़ाई जारी रखें",
    dashboard_mock_test: "मॉक् टेस्ट",
    dashboard_start_test: "टेस्ट शुरू करें",
    dashboard_your_progress: "आपकी प्रगति",
    dashboard_needs_practice: "थोड़े अभ्यास की आवश्यकता है",
    dashboard_all_caught_up: "सब पूरा हो गया!",

    // Flashcards
    flashcards_title: "संताली फ्लैशकार्ड",
    flashcards_subtitle: "संताली शब्दों को सीखें। हिंदी और अंग्रेजी अनुवाद देखने के लिए कार्ड पर टैप करें।",
    flashcards_tap_to_reveal: "हिंदी और अंग्रेजी देखने के लिए कार्ड पर टैप करें",
    flashcards_back_label: "हिंदी और अंग्रेजी अनुवाद",
    flashcards_got_it: "सही याद आया",
    flashcards_needs_practice: "अभ्यास चाहिए",
    flashcards_skip: "अगला कार्ड",
    flashcards_play_audio: "आवाज सुनें",
    flashcards_search_placeholder: "शब्द या श्रेणी खोजें...",
    flashcards_category_all: "सभी श्रेणियां",
    flashcards_category_vocab: "शब्दावली",
    flashcards_category_science: "विज्ञान",
    flashcards_category_math: "गणित",
    flashcards_category_social: "सामाजिक अध्ययन",
    flashcards_card_count: "कार्ड {current} / {total}",
    flashcards_reviewed: "इस सत्र में {count} समीक्षा की गई",
    flashcards_load_more: "और शब्द लोड करें",
    flashcards_1m_dataset: "10 लाख+ शब्द खोज और ब्राउज़ प्रणाली",
    flashcards_empty: "इस श्रेणी के लिए कोई फ्लैशकार्ड नहीं मिला।",

    // Worksheets
    worksheets_title: "कार्यपत्रक (Worksheets)",
    worksheets_subtitle: "शिक्षकों द्वारा प्रकाशित और संताली में अनुवादित कार्यपत्रक प्राप्त करें।",
    worksheets_folders: "विषय फ़ोल्डर",
    worksheets_select_subject: "उपलब्ध कार्यपत्रक देखने के लिए विषय चुनें",
    worksheets_no_worksheets: "इस विषय में अभी कोई कार्यपत्रक उपलब्ध नहीं है।",
    worksheets_teacher_empty: "आपके शिक्षक का कार्यपत्रक यहां अपने आप दिखाई देगा।",
    worksheets_due: "अंतिम तिथि",
    worksheets_status: "स्थिति",
    worksheets_action_view: "कार्यपत्रक देखें",
    worksheets_action_download: "PDF डाउनलोड करें",
    worksheets_action_submit: "असाइनमेंट जमा करें",
    worksheets_upload_title: "पूरा किया गया कार्यपत्रक अपलोड करें",
    worksheets_select_file: "जमा करने के लिए फ़ाइल चुनें (PDF, Image, Doc)",
    worksheets_submitting: "जमा हो रहा है...",
    worksheets_submit_success: "कार्यपत्रक सफलतापूर्वक जमा हो गया!",
    worksheets_overdue_notice: "समय सीमा समाप्त हो गई है।",
    worksheets_translating: "कार्यपत्रक का संताली में अनुवाद हो रहा है...",

    // Statuses
    status_new: "नया",
    status_pending: "लंबित",
    status_submitted: "जमा किया गया",
    status_due_soon: "शीघ्र देय",
    status_overdue: "समय सीमा समाप्त",

    // Notifications
    notifications_title: "सूचनाएं",
    notifications_empty: "अभी कोई नई सूचना नहीं है।",
    notifications_mark_all: "सभी को पढ़ा हुआ चिन्हित करें",
    notifications_new_worksheet: "नया कार्यपत्रक प्रकाशित हुआ",

    // Settings
    settings_title: "सेटिंग्स",
    settings_language_heading: "ग्लोबल सिस्टम भाषा",
    settings_language_desc: "पूरे ऐप के बटन, लेबल और मेनू की भाषा बदलें।",
    settings_profile_heading: "छात्र प्रोफ़ाइल",
    settings_name: "पूरा नाम",
    settings_roll: "रोल नंबर",
    settings_grade: "कक्षा",
    settings_school: "स्कूल / गांव",
    settings_saved: "प्राथमिकताएं सहेजी गईं!",
    settings_save_btn: "प्राथमिकताएं सहेजें",

    // Auth & Login
    login_welcome: "पुनः स्वागत है",
    login_choose_role: "साइन इन करने का तरीका चुनें।",
    login_student_tab: "छात्र लॉगिन",
    login_teacher_tab: "शिक्षक लॉगिन",
    login_select_lang_prompt: "अपनी पसंदीदा सिस्टम भाषा चुनें",
    login_roll_label: "रोल नंबर",
    login_pin_label: "पिन",
    login_start_learning: "पढ़ाई शुरू करें",
    login_teacher_dashboard: "शिक्षक डैशबोर्ड पर जाएं",

    // Common UI
    loading: "लोड हो रहा है...",
    error_generic: "कोई त्रुटि हुई। कृपया पुनः प्रयास करें।",
    save: "सहेजें",
    cancel: "रद्द करें",
    close: "बंद करें",
  },
  sat: {
    // Navigation
    nav_dashboard: "ᱰᱮᱥᱵᱳᱨᱰ (Dashboard)",
    nav_flashcards: "ᱯᱷᱞᱮᱥ ᱠᱟᱨᱰ (Flash Cards)",
    nav_worksheets: "ᱣᱟᱨᱠᱥᱤᱴ (Worksheets)",
    nav_evaluations: "ᱢᱩᱞᱭᱟᱝᱠᱚᱱ (Evaluations)",
    nav_notifications: "ᱠᱷᱚᱵᱚᱨ (Notifications)",
    nav_settings: "ᱥᱮᱴᱤᱝᱥ (Settings)",
    nav_translate: "ᱨᱚᱲ ᱟᱨ ᱛᱚᱨᱡᱚᱢᱟ (Talk & Translate)",
    nav_signout: "ᱚᱰᱚᱠᱚᱜ (Sign Out)",
    nav_teacher_overview: "ᱠᱞᱟᱥ ᱧᱮᱞ (Class Overview)",
    nav_teacher_materials: "ᱯᱚᱛᱚᱵ ᱟᱨ ᱥᱮᱪᱮᱫ ᱥᱟᱢᱟᱱ",
    nav_teacher_worksheets: "ᱣᱟᱨᱠᱥᱤᱴ ᱟᱨ ᱵᱤᱥᱚᱭ",
    nav_teacher_students: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱠᱟᱹᱢᱤ",
    nav_teacher_settings: "ᱢᱟᱪᱮᱛ ᱥᱮᱴᱤᱝᱥ",
    nav_teacher_report: "ᱯᱷᱞᱮᱥᱠᱟᱨᱰ ᱨᱤᱯᱳᱨᱴ",

    // Dashboard
    greeting_johar: "ᱡᱚᱦᱟᱨ",
    dashboard_question: "ᱛᱮᱦᱮᱧ ᱪᱮᱫ ᱪᱮᱫᱳᱜ ᱥᱟᱱᱟᱭᱮᱫ ᱢᱮᱭᱟ?",
    dashboard_badges: "ᱵᱮᱡᱽ (Badges)",
    dashboard_accuracy: "ᱥᱚᱴᱷᱤᱠ (Accuracy)",
    dashboard_continue: "ᱯᱟᱲᱦᱟᱣ ᱪᱟᱞᱟᱣ ᱢᱮ",
    dashboard_mock_test: "ᱢᱚᱠ ᱴᱮᱥᱴ",
    dashboard_start_test: "ᱴᱮᱥᱴ ᱮᱦᱚᱵᱽ ᱢᱮ",
    dashboard_your_progress: "ᱟᱢᱟᱜ ᱞᱟᱦᱟᱱᱛᱤ",
    dashboard_needs_practice: "ᱟᱨᱦᱚᱸ ᱯᱨᱮᱠᱴᱤᱥ ᱪᱟᱦᱤ",
    dashboard_all_caught_up: "ᱡᱚᱛᱚ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ!",

    // Flashcards
    flashcards_title: "ᱥᱟᱱᱛᱟᱲᱤ ᱯᱷᱞᱮᱥᱠᱟᱨᱰ",
    flashcards_subtitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱟᱹᱲᱟᱹ ᱪᱮᱫᱚᱜ ᱢᱮ, ᱦᱤᱱᱫᱤ ᱟᱨ ᱤᱝᱞᱤᱥ ᱛᱚᱨᱡᱚᱢᱟ ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱨᱰ ᱨᱮ ᱴᱤᱯᱟᱹᱣ ᱢᱮ ᱾",
    flashcards_tap_to_reveal: "ᱦᱤᱱᱫᱤ ᱟᱨ ᱤᱝᱞᱤᱥ ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱨᱰ ᱴᱤᱯᱟᱹᱣ ᱢᱮ",
    flashcards_back_label: "ᱦᱤᱱᱫᱤ ᱟᱨ ᱤᱝᱞᱤᱥ ᱛᱚᱨᱡᱚᱢᱟ",
    flashcards_got_it: "ᱥᱚᱴᱷᱤᱠ ᱫᱤᱥᱟᱹ ᱮᱱᱟ",
    flashcards_needs_practice: "ᱯᱨᱮᱠᱴᱤᱥ ᱪᱟᱦᱤ",
    flashcards_skip: "ᱤᱱᱟᱹ ᱛᱟᱭᱚᱢ ᱠᱟᱨᱰ",
    flashcards_play_audio: "ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢ ᱢᱮ",
    flashcards_search_placeholder: "ᱟᱹᱲᱟᱹ ᱥᱮ ᱛᱷᱚᱠ ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ...",
    flashcards_category_all: "ᱡᱚᱛᱚ ᱛᱷᱚᱠ",
    flashcards_category_vocab: "ᱟᱹᱲᱟᱹ ᱢᱟᱞᱟ",
    flashcards_category_science: "ᱥᱟᱬᱮᱥ",
    flashcards_category_math: "ᱮᱞᱠᱷᱟ",
    flashcards_category_social: "ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ",
    flashcards_card_count: "ᱠᱟᱨᱰ {current} / {total}",
    flashcards_reviewed: "ᱱᱤᱭᱟᱹ ᱫᱷᱟᱣ {count} ᱧᱮᱞ ᱮᱱᱟ",
    flashcards_load_more: "ᱟᱨᱦᱚᱸ ᱟᱹᱲᱟᱹ ᱟᱹᱜᱩᱭ ᱢᱮ",
    flashcards_1m_dataset: "᱑᱐ ᱞᱟᱠᱷ+ ᱟᱹᱲᱟᱹ ᱥᱮᱸᱫᱽᱨᱟ ᱥᱤᱥᱴᱚᱢ",
    flashcards_empty: "ᱱᱤᱭᱟᱹ ᱛᱷᱚᱠ ᱨᱮ ᱠᱟᱨᱰ ᱵᱟᱹᱱᱩᱜ-ᱟ ᱾",

    // Worksheets
    worksheets_title: "ᱣᱟᱨᱠᱥᱤᱴ (Worksheets)",
    worksheets_subtitle: "ᱢᱟᱪᱮᱛ ᱴᱷᱮᱱ ᱠᱷᱚᱱ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱛᱚᱨᱡᱚᱢᱟ ᱟᱠᱟᱱ ᱣᱟᱨᱠᱥᱤᱴ ᱧᱟᱢ ᱢᱮ ᱾",
    worksheets_folders: "ᱵᱤᱥᱚᱭ ᱯᱷᱳᱞᱰᱟᱨ",
    worksheets_select_subject: "ᱣᱟᱨᱠᱥᱤᱴ ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱵᱤᱥᱚᱭ ᱪᱟ primary ᱢᱮ",
    worksheets_no_worksheets: "ᱱᱤᱭᱟᱹ ᱵᱤᱥᱚᱭ ᱨᱮ ᱱᱤᱛᱚᱜ ᱣᱟᱨᱠᱥᱤᱴ ᱵᱟᱹᱱᱩᱜ-ᱟ ᱾",
    worksheets_teacher_empty: "ᱟᱢᱤᱡ ᱢᱟᱪᱮᱛᱟᱜ ᱣᱟᱨᱠᱥᱤᱴ ᱱᱚᱸᱰᱮ ᱟᱯᱱᱟᱨ ᱛᱮ ᱦᱤᱡᱩᱜ-ᱟ ᱾",
    worksheets_due: "ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ",
    worksheets_status: "ᱥᱛᱷᱤᱛᱤ",
    worksheets_action_view: "ᱣᱟᱨᱠᱥᱤᱴ ᱧᱮᱞ ᱢᱮ",
    worksheets_action_download: "PDF ᱰᱟᱣᱩᱱᱞᱳᱰ ᱢᱮ",
    worksheets_action_submit: "ᱚᱞ ᱯᱩᱨᱟᱹᱣ ᱡᱚᱢᱟᱭ ᱢᱮ",
    worksheets_upload_title: "ᱯᱩᱨᱟᱹᱣ ᱟᱠᱟᱱ ᱣᱟᱨᱠᱥᱤᱴ ᱟᱯᱞᱳᱰ ᱢᱮ",
    worksheets_select_file: "ᱡᱚᱢᱟ ᱞᱟᱹᱜᱤᱫ ᱯᱷᱟᱭᱤᱞ ᱪᱟ primary ᱢᱮ (PDF, Image, Doc)",
    worksheets_submitting: "ᱡᱚᱢᱟᱜ ᱠᱟᱱᱟ...",
    worksheets_submit_success: "ᱣᱟᱨᱠᱥᱤᱴ ᱱᱟᱯᱟᱭ ᱛᱮ ᱡᱚᱢᱟ ᱮᱱᱟ!",
    worksheets_overdue_notice: "ᱚᱠᱛᱚ ᱪᱟᱵᱟ ᱮᱱᱟ ᱾",
    worksheets_translating: "ᱣᱟᱨᱠᱥᱤᱴ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱛᱚᱨᱡᱚᱢᱟᱜ ᱠᱟᱱᱟ...",

    // Statuses
    status_new: "ᱱᱟᱣᱟ",
    status_pending: "ᱵᱟᱹᱠᱤ",
    status_submitted: "ᱡᱚᱢᱟ ᱮᱱᱟ",
    status_due_soon: "ᱞᱚᱜᱚᱱ ᱢᱩᱪᱟᱹᱫᱚᱜ-ᱟ",
    status_overdue: "ᱚᱠᱛᱚ ᱯᱟᱨᱚᱢ ᱮᱱᱟ",

    // Notifications
    notifications_title: "ᱠᱷᱚᱵᱚᱨ (Notifications)",
    notifications_empty: "ᱱᱤᱛᱚᱜ ᱪᱮᱫ ᱠᱷᱚᱵᱚᱨ ᱦᱚᱸ ᱵᱟᱹᱱᱩᱜ-ᱟ ᱾",
    notifications_mark_all: "ᱡᱚᱛᱚ ᱯᱟᱲᱦᱟᱣ ᱮᱱᱟ ᱪᱤᱱᱦᱟᱹᱭ ᱢᱮ",
    notifications_new_worksheet: "ᱱᱟᱣᱟ ᱣᱟᱨᱠᱥᱤᱴ ᱪᱷᱟᱯᱟ ᱮᱱᱟ",

    // Settings
    settings_title: "ᱥᱮᱴᱤᱝᱥ (Settings)",
    settings_language_heading: "ᱥᱤᱥᱴᱚᱢ ᱯᱟᱹᱨᱥᱤ",
    settings_language_desc: "ᱜᱚᱴᱟ ᱮᱯ ᱨᱮᱭᱟᱜ ᱵᱟᱴᱚᱱ ᱟᱨ ᱞᱮᱵᱚᱞ ᱨᱮᱭᱟᱜ ᱯᱟᱹᱨᱥᱤ ᱵᱚᱫᱚᱞ ᱢᱮ ᱾",
    settings_profile_heading: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱯᱨᱳᱯᱷᱟᱭᱤᱞ",
    settings_name: "ᱯᱩᱨᱟᱹ ᱧᱩᱛᱩᱢ",
    settings_roll: "ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ",
    settings_grade: "ᱪᱟᱱᱟᱪ / ᱠᱞᱟᱥ",
    settings_school: "ᱤᱛᱩᱱ ᱟᱥᱲᱟ / ᱟᱹᱛᱩ",
    settings_saved: "ᱯᱟᱹᱨᱥᱤ ᱥᱟᱧᱪᱟᱣ ᱮᱱᱟ!",
    settings_save_btn: "ᱥᱟᱧᱪᱟᱣ ᱢᱮ",

    // Auth & Login
    login_welcome: "ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ",
    login_choose_role: "ᱵᱚᱞᱚᱱ ᱨᱮᱭᱟᱜ ᱰᱟᱦᱟᱨ ᱪᱟ primary ᱢᱮ ᱾",
    login_student_tab: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ ᱵᱚᱞᱚᱱ",
    login_teacher_tab: "ᱢᱟᱪᱮᱛ ᱵᱚᱞᱚᱱ",
    login_select_lang_prompt: "ᱟᱢᱟᱜ ᱠᱩᱥᱤ ᱥᱤᱥᱴᱚᱢ ᱯᱟᱹᱨᱥᱤ ᱪᱟ primary ᱢᱮ",
    login_roll_label: "ᱨᱳᱞ ᱱᱚᱢᱵᱚᱨ",
    login_pin_label: "ᱯᱤᱱ (PIN)",
    login_start_learning: "ᱯᱟᱲᱦᱟᱣ ᱮᱦᱚᱵᱽ ᱢᱮ",
    login_teacher_dashboard: "ᱢᱟᱪᱮᱛ ᱰᱮᱥᱵᱳᱨᱰ ᱪᱟᱞᱟᱜ ᱢᱮ",

    // Common UI
    loading: "ᱞᱳᱰᱚᱜ ᱠᱟᱱᱟ...",
    error_generic: "ᱪᱮᱫ ᱪᱚᱝ ᱵᱷᱩᱞ ᱮᱱᱟ ᱾ ᱟᱨᱦᱚᱸ ᱪᱮᱥᱴᱟᱭ ᱢᱮ ᱾",
    save: "ᱥᱟᱧᱪᱟᱣ",
    cancel: "ᱵᱟᱹᱜᱤ",
    close: "ᱵᱚᱸᱫᱽ",
  },
} as const;

export function getTranslation(lang: Language, key: string, params?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.en;
  let text = (dict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return text;
}
