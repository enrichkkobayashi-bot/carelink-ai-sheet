
import React from 'react';
import { PatientData } from '../types';
import { ADL_OPTIONS, GENDER_OPTIONS, LIVING_ARRANGEMENT_OPTIONS, CARE_LEVEL_OPTIONS } from '../constants';

const SENSORY_OPTIONS = ['問題なし', '低下', 'その他'];

interface AdmissionSheetFormProps {
  data: PatientData;
  onChange: (field: keyof PatientData, value: string) => void;
  isPrintMode?: boolean;
}

const AdmissionSheetForm: React.FC<AdmissionSheetFormProps> = ({ data, onChange, isPrintMode = false }) => {
  const Input = ({ label, value, field, type = "text", placeholder = "" }: { label: string, value: string, field: keyof PatientData, type?: string, placeholder?: string }) => (
    <div className={`flex flex-col border-b border-gray-300 ${isPrintMode ? 'p-1' : 'p-2'}`}>
      <label className="text-xs font-bold text-gray-600 mb-1">{label}</label>
      {isPrintMode ? (
        <span className="min-h-[1.5rem] whitespace-pre-wrap">{value || 'ー'}</span>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm outline-none focus:bg-blue-50 transition-colors bg-transparent"
        />
      )}
    </div>
  );

  const Select = ({ label, value, field, options }: { label: string, value: string, field: keyof PatientData, options: string[] }) => (
    <div className={`flex flex-col border-b border-gray-300 ${isPrintMode ? 'p-1' : 'p-2'}`}>
      <label className="text-xs font-bold text-gray-600 mb-1">{label}</label>
      {isPrintMode ? (
        <span className="text-sm font-medium">{value || 'ー'}</span>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full text-sm outline-none focus:bg-blue-50 bg-transparent"
        >
          <option value="">選択してください</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}
    </div>
  );

  const TextArea = ({ label, value, field, rows = 3 }: { label: string, value: string, field: keyof PatientData, rows?: number }) => (
    <div className={`flex flex-col border-b border-gray-300 ${isPrintMode ? 'p-1' : 'p-2'}`}>
      <label className="text-xs font-bold text-gray-600 mb-1">{label}</label>
      {isPrintMode ? (
        <span className="min-h-[3rem] text-sm whitespace-pre-wrap leading-relaxed">{value || 'ー'}</span>
      ) : (
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full text-sm outline-none focus:bg-blue-50 bg-transparent resize-none"
        />
      )}
    </div>
  );

  return (
    <div className={`mx-auto max-w-[210mm] bg-white ${isPrintMode ? '' : 'shadow-2xl mb-10'}`}>
      {/* ページ 1 */}
      <div className={`${isPrintMode ? 'p-4 page-break' : 'p-8'}`}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold border-b-2 border-black inline-block px-10 pb-1">入院時情報連携シート</h1>
          <div className="mt-2 text-right text-xs space-y-1">
            <div className="flex justify-end items-center gap-2">
              <label className="font-semibold">記入日:</label>
              {isPrintMode ? (
                <span className="min-w-[120px]">{data.entryDate || 'ー'}</span>
              ) : (
                <input
                  type="date"
                  value={data.entryDate}
                  onChange={(e) => onChange('entryDate', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                />
              )}
            </div>
            <div className="flex justify-end items-center gap-2">
              <label className="font-semibold">入院日:</label>
              {isPrintMode ? (
                <span className="min-w-[120px]">{data.admissionDate || 'ー'}</span>
              ) : (
                <input
                  type="date"
                  value={data.admissionDate}
                  onChange={(e) => onChange('admissionDate', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                />
              )}
            </div>
            <div className="flex justify-end items-center gap-2">
              <label className="font-semibold">情報提供日:</label>
              {isPrintMode ? (
                <span className="min-w-[120px]">{data.informationProvidedDate || 'ー'}</span>
              ) : (
                <input
                  type="date"
                  value={data.informationProvidedDate}
                  onChange={(e) => onChange('informationProvidedDate', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                />
              )}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-12 border-t border-l border-r border-gray-800">
          <div className="col-span-8 grid grid-cols-12 border-r border-gray-800">
            <div className="col-span-12 grid grid-cols-12 border-b border-gray-800">
              <div className="col-span-4 border-r border-gray-800">
                <Input label="フリガナ" value={data.nameKana} field="nameKana" />
              </div>
              <div className="col-span-8">
                <Input label="氏名" value={data.name} field="name" />
              </div>
            </div>
            <div className="col-span-6 border-b border-r border-gray-800">
              <Input label="生年月日" value={data.birthDate} field="birthDate" placeholder="YYYY/MM/DD" />
            </div>
            <div className="col-span-3 border-b border-r border-gray-800">
              <Input label="年齢" value={data.age} field="age" />
            </div>
            <div className="col-span-3 border-b border-gray-800">
              <Select label="性別" value={data.gender} field="gender" options={GENDER_OPTIONS} />
            </div>
            <div className="col-span-12 border-b border-gray-800">
              <Input label="住所" value={data.address} field="address" />
            </div>
            <div className="col-span-6 border-b border-r border-gray-800">
              <Input label="電話番号" value={data.phone} field="phone" />
            </div>
            <div className="col-span-6 border-b border-gray-800">
              <Select label="介護認定" value={data.longTermCareLevel} field="longTermCareLevel" options={CARE_LEVEL_OPTIONS} />
            </div>
          </div>

          <div className="col-span-4 flex flex-col border-gray-800">
            <div className="p-2 bg-blue-50 border-b border-gray-800 font-bold text-xs text-blue-800">担当ケアマネジャー</div>
            <Input label="氏名" value={data.careManagerName} field="careManagerName" />
            <Input label="事業所名" value={data.careManagerOffice} field="careManagerOffice" />
            <Input label="連絡先(TEL)" value={data.careManagerPhone} field="careManagerPhone" />
            <Input label="連絡先(FAX)" value={data.careManagerFax} field="careManagerFax" />
          </div>
        </div>

        <div className="grid grid-cols-12 border-l border-r border-gray-800">
          <div className="col-span-12 p-1 bg-blue-100 border-t border-b border-gray-800 font-bold text-xs text-blue-800">緊急連絡先</div>
          <div className="col-span-5 border-b border-r border-gray-800">
            <Input label="氏名" value={data.emergencyContact1} field="emergencyContact1" />
          </div>
          <div className="col-span-3 border-b border-r border-gray-800">
            <Input label="続柄" value={data.emergencyContact1Relation} field="emergencyContact1Relation" />
          </div>
          <div className="col-span-4 border-b border-gray-800">
            <Input label="電話番号" value={data.emergencyContact1Phone} field="emergencyContact1Phone" />
          </div>
        </div>

        <div className="grid grid-cols-12 border-l border-r border-gray-800">
          <div className="col-span-12 p-1 bg-blue-100 border-b border-gray-800 font-bold text-xs text-blue-800">医療情報</div>

          <div className="col-span-5 border-b border-r border-gray-800">
            <Input label="かかりつけ医療機関" value={data.medicalInstitutionName} field="medicalInstitutionName" />
          </div>
          <div className="col-span-3 border-b border-r border-gray-800">
            <Input label="主治医" value={data.doctorName} field="doctorName" />
          </div>
          <div className="col-span-4 border-b border-gray-800">
            <Input label="電話番号" value={data.medicalPhone} field="medicalPhone" />
          </div>
          <div className="col-span-6 border-b border-r border-gray-800">
            <TextArea label="主疾患" value={data.primaryDiagnosis} field="primaryDiagnosis" rows={2} />
          </div>
          <div className="col-span-6 border-b border-gray-800">
            <TextArea label="併存疾患" value={data.secondaryDiagnosis} field="secondaryDiagnosis" rows={2} />
          </div>
          <div className="col-span-12 border-b border-gray-800">
            <TextArea label="既往歴" value={data.pastMedicalHistory} field="pastMedicalHistory" />
          </div>
          <div className="col-span-6 border-b border-r border-gray-800">
            <TextArea label="アレルギー" value={data.allergies} field="allergies" rows={1} />
          </div>
          <div className="col-span-6 border-b border-gray-800">
            <TextArea label="特に伝えたい医療情報" value={data.keyMedicalHistory} field="keyMedicalHistory" rows={1} />
          </div>
        </div>

        <div className="grid grid-cols-12 border-l border-r border-b border-gray-800">
          <div className="col-span-12 p-1 bg-blue-50 border-b border-gray-800 font-bold text-xs text-blue-800">生活状況・社会背景</div>
          <div className="col-span-4 border-b border-r border-gray-800">
            <Select label="居住状況" value={data.livingArrangement} field="livingArrangement" options={LIVING_ARRANGEMENT_OPTIONS} />
          </div>
          <div className="col-span-8 border-b border-gray-800">
            <Input label="キーパーソン" value={data.keyPerson} field="keyPerson" />
          </div>
          <div className="col-span-12">
            <TextArea label="住環境（段差、手すり等）" value={data.housingEnvironment} field="housingEnvironment" />
          </div>
        </div>
      </div>

      {/* ページ 2 */}
      <div className={`${isPrintMode ? 'p-4' : 'p-8 border-t-2 border-dashed border-blue-200 mt-10 pt-10'}`}>
        {!isPrintMode && <div className="text-center mb-6 text-blue-500 font-bold">2ページ目</div>}

        <div className="grid grid-cols-12 border-t border-l border-r border-gray-800">
          <div className="col-span-12 p-1 bg-blue-100 border-b border-gray-800 font-bold text-xs text-blue-800">ADL（身体機能・自立度）</div>
          <div className="col-span-4 border-b border-r border-gray-800">
            <Select label="歩行" value={data.adlWalking} field="adlWalking" options={ADL_OPTIONS} />
          </div>
          <div className="col-span-4 border-b border-r border-gray-800">
            <Select label="移乗" value={data.adlTransferring} field="adlTransferring" options={ADL_OPTIONS} />
          </div>
          <div className="col-span-4 border-b border-gray-800">
            <Select label="排泄" value={data.adlToileting} field="adlToileting" options={ADL_OPTIONS} />
          </div>

          {/* 詳細情報 */}
          <div className="col-span-4 border-b border-r border-gray-800">
            <TextArea label="歩行の詳細" value={data.adlWalkingDetails} field="adlWalkingDetails" rows={3} />
          </div>
          <div className="col-span-4 border-b border-r border-gray-800">
            <TextArea label="移乗の詳細" value={data.adlTransferringDetails} field="adlTransferringDetails" rows={3} />
          </div>
          <div className="col-span-4 border-b border-gray-800">
            <TextArea label="排泄の詳細" value={data.adlToiletingDetails} field="adlToiletingDetails" rows={3} />
          </div>
          <div className="col-span-6 border-b border-r border-gray-800">
            <Select label="入浴" value={data.adlBathing} field="adlBathing" options={ADL_OPTIONS} />
          </div>
          <div className="col-span-6 border-b border-gray-800">
            <Select label="食事" value={data.adlEating} field="adlEating" options={ADL_OPTIONS} />
          </div>

          {/* 入浴・食事の詳細 */}
          <div className="col-span-6 border-b border-r border-gray-800">
            <TextArea label="入浴の詳細" value={data.adlBathingDetails} field="adlBathingDetails" rows={2} />
          </div>
          <div className="col-span-6 border-b border-gray-800">
            <TextArea label="食事の詳細" value={data.adlEatingDetails} field="adlEatingDetails" rows={2} />
          </div>

          {/* 口腔・視力・聴力 */}
          <div className="col-span-4 border-b border-r border-gray-800">
            <Select label="口腔の状態" value={data.adlOral} field="adlOral" options={ADL_OPTIONS} />
          </div>
          <div className="col-span-4 border-b border-r border-gray-800">
            <Select label="視力の状態" value={data.adlVision} field="adlVision" options={SENSORY_OPTIONS} />
          </div>
          <div className="col-span-4 border-b border-gray-800">
            <Select label="聴力の状態" value={data.adlHearing} field="adlHearing" options={SENSORY_OPTIONS} />
          </div>

          {/* 口腔・視力・聴力 詳細 */}
          <div className="col-span-4 border-b border-r border-gray-800">
            <TextArea label="口腔の詳細" value={data.adlOralDetails} field="adlOralDetails" rows={2} />
          </div>
          <div className="col-span-4 border-b border-r border-gray-800">
            <TextArea label="視力の詳細" value={data.adlVisionDetails} field="adlVisionDetails" rows={2} />
          </div>
          <div className="col-span-4 border-b border-gray-800">
            <TextArea label="聴力の詳細" value={data.adlHearingDetails} field="adlHearingDetails" rows={2} />
          </div>
        </div>

        <div className="grid grid-cols-12 border-l border-r border-gray-800">
          <div className="col-span-12 p-1 bg-blue-100 border-b border-gray-800 font-bold text-xs text-blue-800">認知機能・精神状態</div>
          <div className="col-span-12 border-b border-gray-800">
            <TextArea label="認知症・物忘れの状況" value={data.cognitiveStatus} field="cognitiveStatus" />
          </div>
          <div className="col-span-12 border-b border-gray-800">
            <TextArea label="精神症状・行動障害（不眠、幻覚等）" value={data.mentalHealthSymptoms} field="mentalHealthSymptoms" />
          </div>
        </div>

        <div className="grid grid-cols-12 border-l border-r border-gray-800">
          <div className="col-span-12 p-1 bg-blue-50 border-b border-gray-800 font-bold text-xs text-blue-800">利用中の介護サービス</div>
          <div className="col-span-12 border-b border-gray-800">
            <TextArea label="サービス名・頻度" value={data.currentServices} field="currentServices" rows={5} />
          </div>
        </div>

        <div className="grid grid-cols-12 border-l border-r border-b border-gray-800">
          <div className="col-span-12 p-1 bg-blue-100 border-b border-gray-800 font-bold text-xs text-blue-800">その他伝えたいこと（性格、習慣、こだわり等）</div>
          <div className="col-span-12">
            {isPrintMode ? (
              <div className="p-2">
                <span className="min-h-[8rem] text-sm whitespace-pre-wrap leading-relaxed block">{data.notes || 'ー'}</span>
              </div>
            ) : (
              <textarea
                value={data.notes}
                rows={8}
                onChange={(e) => onChange('notes', e.target.value)}
                className="w-full text-sm outline-none focus:bg-blue-50 bg-transparent resize-none p-2"
                placeholder="性格、習慣、こだわり、その他伝えたいことを入力してください..."
              />
            )}
          </div>
        </div>

        <div className="mt-6 text-right text-xs text-gray-500">
          作成日: {new Date().toLocaleDateString('ja-JP')}
        </div>
      </div>
    </div>
  );
};

export default AdmissionSheetForm;
