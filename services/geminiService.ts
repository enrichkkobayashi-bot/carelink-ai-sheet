
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { PatientData } from "../types";

export interface UploadedFile {
  mimeType: string;
  data: string;
}

export const analyzeAdmissionInfo = async (files: UploadedFile[], textInput: string): Promise<PatientData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("APIキーが設定されていません。.env.localファイルを確認してください。");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  // ファイルを追加
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  });

  // プロンプトテキストを追加
  parts.push({
    text: `
      以下の介護相談記録、アセスメント、または患者メモから、厚生労働省の「入院時情報連携シート」に必要な情報を抽出してください。
      
      特に「認知機能・精神状態」に関しては、アセスメントシートの記述を詳細に反映してください。以下の情報が含まれている場合は必ず抽出して記述してください：
      - 認知症の診断名、認知症高齢者の日常生活自立度ランク
      - 長谷川式スケール(HDS-R)やMMSEの点数
      - 物忘れの具体的な状況（短期記憶、長期記憶の保持状況など）
      - 理解力・判断力の低下の有無
      - 問題行動（BPSD）の有無と具体的な内容（徘徊、暴言、暴力、拒絶など）
      - 精神的な安定性、感情の起伏
      - 昼夜逆転や睡眠障害の有無
      - 今までの生活（職業、趣味、主な生活歴など）
      - 本人・家族の意向（「自宅に帰りたい」「施設入所希望」など）

      さらに以下のADL情報も抽出してください：
      - 歩行：屋内と屋外それぞれの状況（「自立」「一部介助」「全介助」など）
      - 入浴、排泄、食事の状況
      - 麻痺の有無と部位（「右片麻痺」「なし」など）
      - 褥瘡の有無と部位・状態（「仙骨部に発赤あり」「なし」など）
      - 口腔：歯の状態や嚥下状態（「良好」「問題あり」など）と詳細
      - 視力：視力の状態（「良好」「低下」など）と詳細
      - 聴力：聴力の状態（「良好」「低下」など）と詳細
      
      【入力テキスト】:
      ${textInput}
      
      【制約】:
      - 不明な項目は空欄（""）にしてください。
      - 各項目は長文のまま丸写しせず、意味を保ちながら可能な限り簡潔に要約して抽出してください。
      - 備考（notes）などの特定の項目に、元のテキスト全体をコピー＆ペーストすることは絶対に避けてください。
      - 氏名にフリガナがある場合は抽出してください。
      - ADL（歩行屋内、歩行屋外、入浴、排泄、食事）は「自立」「一部介助」「全介助」のいずれかから最も近いものを選択してください。
      - 麻痺・褥瘡は「あり」「なし」または具体的な状況を抽出してください。
      - 性別は「男性」「女性」から選択してください。
      - 介護度は「要支援1〜2」「要介護1〜5」「自立」から選択してください。
    `
  });

  const response = await (ai.models as any).generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: 'user', parts: parts }],
    config: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: (Type as any).OBJECT,
        properties: {
          nameKana: { type: (Type as any).STRING },
          name: { type: (Type as any).STRING },
          birthDate: { type: (Type as any).STRING },
          age: { type: (Type as any).STRING },
          gender: { type: (Type as any).STRING },
          address: { type: (Type as any).STRING },
          phone: { type: (Type as any).STRING },
          patientId: { type: (Type as any).STRING },
          longTermCareLevel: { type: (Type as any).STRING },
          entryDate: { type: (Type as any).STRING },
          admissionDate: { type: (Type as any).STRING },
          informationProvidedDate: { type: (Type as any).STRING },
          emergencyContact1: { type: (Type as any).STRING },
          emergencyContact1Relation: { type: (Type as any).STRING },
          emergencyContact1Phone: { type: (Type as any).STRING },
          careManagerName: { type: (Type as any).STRING },
          careManagerOffice: { type: (Type as any).STRING },
          careManagerPhone: { type: (Type as any).STRING },
          careManagerFax: { type: (Type as any).STRING },
          medicalInstitutionName: { type: (Type as any).STRING },
          doctorName: { type: (Type as any).STRING },
          medicalPhone: { type: (Type as any).STRING },
          primaryDiagnosis: { type: (Type as any).STRING },
          secondaryDiagnosis: { type: (Type as any).STRING },
          pastMedicalHistory: { type: (Type as any).STRING },
          allergies: { type: (Type as any).STRING },
          keyMedicalHistory: { type: (Type as any).STRING },
          adlWalkingIndoor: { type: (Type as any).STRING },
          adlWalkingIndoorDetails: { type: (Type as any).STRING },
          adlWalkingOutdoor: { type: (Type as any).STRING },
          adlWalkingOutdoorDetails: { type: (Type as any).STRING },
          adlBathing: { type: (Type as any).STRING },
          adlBathingDetails: { type: (Type as any).STRING },
          adlToileting: { type: (Type as any).STRING },
          adlToiletingDetails: { type: (Type as any).STRING },
          adlEating: { type: (Type as any).STRING },
          adlEatingDetails: { type: (Type as any).STRING },
          paralysis: { type: (Type as any).STRING },
          bedsores: { type: (Type as any).STRING },
          adlOral: { type: (Type as any).STRING },
          adlOralDetails: { type: (Type as any).STRING },
          adlVision: { type: (Type as any).STRING },
          adlVisionDetails: { type: (Type as any).STRING },
          adlHearing: { type: (Type as any).STRING },
          adlHearingDetails: { type: (Type as any).STRING },
          cognitiveStatus: { type: (Type as any).STRING },
          mentalHealthSymptoms: { type: (Type as any).STRING },
          livingArrangement: { type: (Type as any).STRING },
          keyPerson: { type: (Type as any).STRING },
          housingEnvironment: { type: (Type as any).STRING },
          pastLife: { type: (Type as any).STRING },
          familyIntentions: { type: (Type as any).STRING },
          currentServices: { type: (Type as any).STRING },
          notes: { type: (Type as any).STRING }
        },
        required: ["name"]
      }
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
  });

  try {
    const text = (response as any).text;
    if (!text) throw new Error("テキストが生成されませんでした。");
    const data = JSON.parse(text);
    return data as PatientData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    const rawText = (response as any)?.text;
    if (rawText) {
      console.error("▼▼▼ パースに失敗した生のテキストデータ ▼▼▼\n", rawText);
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`情報の抽出に失敗しました: ${errorMessage}`);
  }
};
