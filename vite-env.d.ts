/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_APP_MONITORING_URL: string;
    readonly VITE_APP_MEETING_URL: string;
    readonly VITE_APP_CARE_PLAN_URL: string;
    readonly VITE_APP_SUPPORT_PLAN_URL: string;
    readonly VITE_APP_ADMISSION_SHEET_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
