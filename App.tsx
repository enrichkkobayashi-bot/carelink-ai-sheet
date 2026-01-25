
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeAdmissionInfo } from './services/geminiService';
import { PatientData, INITIAL_PATIENT_DATA } from './types';
import AdmissionSheetForm from './components/AdmissionSheetForm';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js workerの設定（ローカルのnode_modulesから読み込む）
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// サイドバーのURL設定を定数として定義
const SIDEBAR_URLS = {
  MONITORING: 'https://my-projyect-moni.vercel.app/',
  MEETING: 'https://my-project-kaigi.vercel.app/',
  CARE_PLAN: 'https://enrichkkobayashi-bot.github.io/kaigo-plan-system/',
  SUPPORT_PLAN: 'https://care-plan-assistant.vercel.app/',
  ADMISSION_SHEET: 'https://carelink-ai-sheet.vercel.app/',
};



const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; content: string }>>([]);


  // ファイルの内容を読み込む関数（PDFとテキストに対応）
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // PDFファイルの場合
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            console.log(`PDFファイル読み込み開始: ${file.name}, サイズ: ${arrayBuffer.byteLength} bytes`);

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log(`PDF読み込み成功: ${pdf.numPages}ページ`);

            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => {
                  if ('str' in item) {
                    return item.str;
                  }
                  return '';
                })
                .filter(text => text.trim().length > 0)
                .join(' ');

              fullText += pageText + '\n';
              console.log(`ページ ${i}/${pdf.numPages} 処理完了: ${pageText.length}文字`);
            }

            console.log(`PDF全体の抽出完了: ${fullText.length}文字`);
            resolve(fullText.trim());
          } catch (err) {
            console.error('PDF読み込みエラー詳細:', err);
            reject(new Error(`PDFの解析に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`));
          }
        };
        reader.onerror = (err) => {
          console.error('FileReader エラー:', err);
          reject(new Error('ファイルの読み込みに失敗しました'));
        };
        reader.readAsArrayBuffer(file);
      } else {
        // テキストファイルの場合
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          console.log(`テキストファイル読み込み成功: ${file.name}, ${text.length}文字`);
          resolve(text);
        };
        reader.onerror = (err) => {
          console.error('テキストファイル読み込みエラー:', err);
          reject(new Error('テキストファイルの読み込みに失敗しました'));
        };
        reader.readAsText(file);
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from<File>(files)) {
      try {
        console.log(`ファイル処理開始: ${file.name}, タイプ: ${file.type}, サイズ: ${file.size} bytes`);
        const text = await readFileContent(file);
        setUploadedFiles(prev => [...prev, { name: file.name, content: text }]);
        setError(null); // 成功したらエラーをクリア
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';
        setError(`ファイル ${file.name} の読み込みに失敗しました。\n詳細: ${errorMessage}`);
      }
    }

    // Reset input to allow re-uploading the same file
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (const file of Array.from<File>(files)) {
        try {
          console.log(`ドロップファイル処理開始: ${file.name}, タイプ: ${file.type}, サイズ: ${file.size} bytes`);
          const text = await readFileContent(file);
          setUploadedFiles(prev => [...prev, { name: file.name, content: text }]);
          setError(null); // 成功したらエラーをクリア
        } catch (err) {
          console.error(`Error reading file ${file.name}:`, err);
          const errorMessage = err instanceof Error ? err.message : '不明なエラー';
          setError(`ファイル ${file.name} の読み込みに失敗しました。\n詳細: ${errorMessage}`);
        }
      }
    }
  };

  const handleAnalyze = async () => {
    console.log('=== AI分析開始 ===');
    console.log('uploadedFiles:', uploadedFiles);
    console.log('uploadedFiles.length:', uploadedFiles.length);

    // アップロードされたファイルの内容を結合
    const uploadedText = uploadedFiles.map(file => file.content).join('\n\n');
    console.log('uploadedText length:', uploadedText.length);

    console.log('inputText length:', inputText.length);

    // inputTextとuploadedTextを結合（両方ある場合）
    const combinedText = [uploadedText, inputText].filter(t => t.trim()).join('\n\n');
    console.log('combinedText length:', combinedText.length);

    if (!combinedText.trim()) {
      console.log('エラー: combinedTextが空です');
      setError("分析するテキストを入力するかファイルをアップロードしてください。");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeAdmissionInfo(combinedText);
      setPatientData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDataChange = (field: keyof PatientData, value: string) => {
    if (!patientData) return;
    setPatientData({ ...patientData, [field]: value });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("入力内容をリセットしてもよろしいですか？")) {
      setPatientData(null);
      setInputText('');
      setUploadedFiles([]);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 no-print">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col shadow-xl z-20">
          <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h1 className="text-xl font-bold tracking-wide">CareLink</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-gray-500 text-xs font-bold uppercase mb-3 px-2 tracking-wider">Navigation</div>
            {(() => {
              const menuItems = [
                {
                  name: 'モニタリング',
                  url: SIDEBAR_URLS.MONITORING,
                  active: false,
                  icon: (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  )
                },
                {
                  name: '担当者会議',
                  url: SIDEBAR_URLS.MEETING,
                  active: false,
                  icon: (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  )
                },
                {
                  name: '要介護プラン',
                  url: SIDEBAR_URLS.CARE_PLAN,
                  active: false,
                  icon: (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  )
                },
                {
                  name: '要支援プラン',
                  url: SIDEBAR_URLS.SUPPORT_PLAN,
                  active: false,
                  icon: (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  )
                },
                {
                  name: '入院時情報連携',
                  url: SIDEBAR_URLS.ADMISSION_SHEET,
                  active: true,
                  icon: (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  )
                },
              ];

              // デバッグ用: 環境変数の値を確認
              console.log('=== サイドバーURL設定（レンダリング時） ===');
              console.log('Menu Items:', menuItems);

              return menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  onClick={(e) => {
                    console.log(`クリックされたメニュー: ${item.name}`);
                    console.log(`遷移先URL: ${item.url}`);
                    console.log(`target属性: ${!item.active ? '_blank' : '(なし)'}`);
                  }}
                  {...(!item.active && { target: "_blank", rel: "noopener noreferrer" })}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center group no-underline ${item.active
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40 transform scale-105'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:pl-5'
                    }`}
                >
                  {item.icon}
                  {item.name}
                </a>
              ))
            })()}
          </nav>

        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto h-screen bg-gray-50 relative">
          <div className="p-6 md:p-12 max-w-6xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">AI 入院時情報連携</h1>
              <p className="text-lg text-gray-600">
                面談の記録やアセスメント、患者メモを入力して、<br />
                厚生労働省様式の入院時情報連携シートを自動生成します。
              </p>
            </header>

            {!patientData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Left: Upload Zone */}
                <div className="flex flex-col">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mb-2 text-lg font-bold text-gray-700">資料をアップロード</p>
                      <p className="text-sm text-gray-500">PDF ・ テキスト (複数可)</p>
                    </div>
                    <input type="file" className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} multiple />
                  </label>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">📎 アップロード済みファイル</h3>
                      <ul className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                            <button
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                              title="削除"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right: Text Input */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                  <textarea
                    className="flex-grow w-full h-full p-4 text-gray-700 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition-all"
                    placeholder="相談記録の要約やアセスメント情報を入力してください..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6 flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <span className="text-indigo-700 font-medium">✨ AIが情報を抽出しました。必要に応じて修正してください。</span>
                <div className="space-x-4">
                  <button
                    onClick={handlePrint}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    🖨️ A4で印刷 / PDF保存
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    やり直す
                  </button>
                </div>
              </div>
            )}

            {!patientData && (
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`flex items-center space-x-2 px-10 py-4 text-xl font-bold rounded-2xl transition-all shadow-xl ${isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-400 hover:bg-indigo-500 text-white'
                    }`}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ AIアセスメント実行</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Form Editor in UI */}
            {patientData && (
              <div className="mt-8 transition-opacity duration-500 ease-in opacity-100">
                <AdmissionSheetForm data={patientData} onChange={handleDataChange} isPrintMode={false} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print-only component - Outside standard layout */}
      <div className="print-only hidden">
        {patientData && (
          <AdmissionSheetForm data={patientData} onChange={handleDataChange} isPrintMode={true} />
        )}
      </div>
    </>
  );
};

export default App;
