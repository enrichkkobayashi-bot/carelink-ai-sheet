
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData } from "../types";

export interface UploadedFile {
  mimeType: string;
  data: string;
}

export const analyzeAdmissionInfo = async (files: UploadedFile[], textInput: string): Promise<PatientData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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

      さらに以下のADL情報も抽出してください：
      - 口腔：歯の状態や嚥下状態（「良好」「問題あり」など）と詳細
      - 視力：視力の状態（「良好」「低下」など）と詳細
      - 聴力：聴力の状態（「良好」「低下」など）と詳細
      
      【入力テキスト】:
      ${textInput}
      
      【制約】:
      - 不明な項目は空欄（""）にしてください。
      - 氏名にフリガナがある場合は抽出してください。
      - ADL（歩行、入浴、排泄、食事、移乗）は「自立」「一部介助」「全介助」のいずれかから最も近いものを選択してください。
      - 性別は「男性」「女性」から選択してください。
      - 介護度は「要支援1〜2」「要介護1〜5」「自立」から選択してください。
    `
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: 'user', parts: parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nameKana: { type: Type.STRING },
          name: { type: Type.STRING },
          birthDate: { type: Type.STRING },
          age: { type: Type.STRING },
          gender: { type: Type.STRING },
          address: { type: Type.STRING },
          phone: { type: Type.STRING },
          patientId: { type: Type.STRING },
          longTermCareLevel: { type: Type.STRING },
          entryDate: { type: Type.STRING },
          admissionDate: { type: Type.STRING },
          informationProvidedDate: { type: Type.STRING },
          emergencyContact1: { type: Type.STRING },
          emergencyContact1Relation: { type: Type.STRING },
          emergencyContact1Phone: { type: Type.STRING },
          careManagerName: { type: Type.STRING },
          careManagerOffice: { type: Type.STRING },
          careManagerPhone: { type: Type.STRING },
          careManagerFax: { type: Type.STRING },
          medicalInstitutionName: { type: Type.STRING },
          doctorName: { type: Type.STRING },
          medicalPhone: { type: Type.STRING },
          primaryDiagnosis: { type: Type.STRING },
          secondaryDiagnosis: { type: Type.STRING },
          pastMedicalHistory: { type: Type.STRING },
          allergies: { type: Type.STRING },
          keyMedicalHistory: { type: Type.STRING },
          adlWalking: { type: Type.STRING },
          adlWalkingDetails: { type: Type.STRING },
          adlBathing: { type: Type.STRING },
          adlBathingDetails: { type: Type.STRING },
          adlToileting: { type: Type.STRING },
          adlToiletingDetails: { type: Type.STRING },
          adlEating: { type: Type.STRING },
          adlEatingDetails: { type: Type.STRING },
          adlTransferring: { type: Type.STRING },
          adlTransferringDetails: { type: Type.STRING },
          adlOral: { type: Type.STRING },
          adlOralDetails: { type: Type.STRING },
          adlVision: { type: Type.STRING },
          adlVisionDetails: { type: Type.STRING },
          adlHearing: { type: Type.STRING },
          adlHearingDetails: { type: Type.STRING },
          cognitiveStatus: { type: Type.STRING },
          mentalHealthSymptoms: { type: Type.STRING },
          livingArrangement: { type: Type.STRING },
          keyPerson: { type: Type.STRING },
          housingEnvironment: { type: Type.STRING },
          currentServices: { type: Type.STRING },
          notes: { type: Type.STRING }
        },
        required: ["name"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("テキストが生成されませんでした。");
    const data = JSON.parse(text);
    return data as PatientData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("情報の抽出に失敗しました。内容を確認してください。");
  }
};
