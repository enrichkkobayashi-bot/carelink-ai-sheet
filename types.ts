
export interface PatientData {
  // 基本情報
  nameKana: string;
  name: string;
  birthDate: string;
  age: string;
  gender: '男性' | '女性' | '';
  address: string;
  phone: string;
  patientId: string;
  longTermCareLevel: string;

  // 日付情報
  entryDate: string; // 記入日
  admissionDate: string; // 入院日
  informationProvidedDate: string; // 情報提供日

  // 緊急連絡先
  emergencyContact1: string;
  emergencyContact1Relation: string;
  emergencyContact1Phone: string;

  // ケアマネジャー情報
  careManagerName: string;
  careManagerOffice: string;
  careManagerPhone: string;
  careManagerFax: string;

  // 医療情報
  medicalInstitutionName: string; // 医療機関名
  doctorName: string; // 医師名
  medicalPhone: string; // 医療機関電話番号
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  pastMedicalHistory: string;
  allergies: string;
  keyMedicalHistory: string;

  // 生活状況・ADL
  adlWalkingIndoor: string; // 歩行（屋内）
  adlWalkingIndoorDetails: string;
  adlWalkingOutdoor: string; // 歩行（屋外）
  adlWalkingOutdoorDetails: string;
  adlBathing: string;
  adlBathingDetails: string; // 入浴の詳細情報
  adlToileting: string;
  adlToiletingDetails: string; // 排泄の詳細情報
  adlEating: string;
  adlEatingDetails: string; // 食事の詳細情報
  paralysis: string; // 麻痺
  bedsores: string; // 褥瘡
  adlOral: string; // 口腔（歯・嚥下・口腔ケア） - 状態
  adlOralDetails: string; // 口腔 - 詳細
  adlVision: string; // 視力 - 状態
  adlVisionDetails: string; // 視力 - 詳細
  adlHearing: string; // 聴力 - 状態
  adlHearingDetails: string; // 聴力 - 詳細

  // 認知機能・精神症状
  cognitiveStatus: string;
  mentalHealthSymptoms: string;

  // 社会背景
  livingArrangement: string; // 独居・家族と同居等
  keyPerson: string;
  housingEnvironment: string;
  pastLife: string; // 今までの生活
  familyIntentions: string; // 本人・家族の意向

  // 現在利用中のサービス
  currentServices: string;

  // 備考・伝えたいこと
  notes: string;
}

export const INITIAL_PATIENT_DATA: PatientData = {
  nameKana: '',
  name: '',
  birthDate: '',
  age: '',
  gender: '',
  address: '',
  phone: '',
  patientId: '',
  longTermCareLevel: '',
  entryDate: '',
  admissionDate: '',
  informationProvidedDate: '',
  emergencyContact1: '',
  emergencyContact1Relation: '',
  emergencyContact1Phone: '',
  careManagerName: '',
  careManagerOffice: '',
  careManagerPhone: '',
  careManagerFax: '',
  medicalInstitutionName: '',
  doctorName: '',
  medicalPhone: '',
  primaryDiagnosis: '',
  secondaryDiagnosis: '',
  pastMedicalHistory: '',
  allergies: '',
  keyMedicalHistory: '',
  adlWalkingIndoor: '自立',
  adlWalkingIndoorDetails: '',
  adlWalkingOutdoor: '自立',
  adlWalkingOutdoorDetails: '',
  adlBathing: '自立',
  adlBathingDetails: '',
  adlToileting: '自立',
  adlToiletingDetails: '',
  adlEating: '自立',
  adlEatingDetails: '',
  paralysis: 'なし',
  bedsores: 'なし',
  adlOral: '',
  adlOralDetails: '',
  adlVision: '',
  adlVisionDetails: '',
  adlHearing: '',
  adlHearingDetails: '',
  cognitiveStatus: '',
  mentalHealthSymptoms: '',
  livingArrangement: '独居',
  keyPerson: '',
  housingEnvironment: '',
  pastLife: '',
  familyIntentions: '',
  currentServices: '',
  notes: ''
};
