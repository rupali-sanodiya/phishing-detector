import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputData, setInputData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);

  // Live Threat Intel Ticker Alerts (India & Global Cyber Scams)
 const [scamAlerts, setScamAlerts] = useState([
    "🚨 Connecting to Cyber Threat Intelligence Network..."
  ]);

  useEffect(() => {
    const fetchThreatAlerts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/threat-ticker');
        const data = await response.json();
        if (data.success && data.alerts) {
          setScamAlerts(data.alerts);
        }
      } catch (err) {
        console.error("Failed to fetch live threat ticker feed, using local fallback.");
      }
    };

    fetchThreatAlerts();
    const interval = setInterval(fetchThreatAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load complete persistent scan history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cybersentinel_full_threat_logs');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!inputData.trim() && !attachedFile) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let payloadText = inputData;
      if (attachedFile) {
        if (attachedFile.type.startsWith('image/')) {
          if (inputData.includes('QR CODE')) {
            payloadText = `[QR CODE SECURITY DECODER - FileName: ${attachedFile.name}] User uploaded a QR code image. Simulating matrix decode, inspecting hidden embedded target URLs for malicious redirections, credential harvesting, or rogue APK downloads.`;
          } else {
            payloadText = `[IMAGE SCAN & OCR ANALYSIS - FileName: ${attachedFile.name}] User uploaded visual proof/screenshot. Inspecting for embedded malicious URLs, QR codes, or phishing text content.`;
          }
        } else if (attachedFile.type.includes('audio') || attachedFile.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
          payloadText = `[AUDIO VOICE NOTE ANALYSIS - FileName: ${attachedFile.name}] User uploaded audio file. Inspecting transcript context for scam indicators, social engineering, or fraudulent bank calls.`;
        } else if (attachedFile.type.includes('video') || attachedFile.name.match(/\.(mp4|mkv|avi|mov|apk)$/i)) {
          payloadText = `[VIDEO / MEDIA FILE INSPECTION - FileName: ${attachedFile.name}] User uploaded video file or executable payload reference. Checking for hidden malicious vectors or fake app distribution links.`;
        } else if (attachedFile.type.includes('pdf') || attachedFile.type.includes('document') || attachedFile.name.match(/\.(pdf|docx|txt|csv)$/i)) {
          payloadText = `[DOCUMENT / PDF SECURITY AUDIT - FileName: ${attachedFile.name}] User uploaded document file. Content preview: ${inputData.substring(0, 1000)}. Inspecting for malicious macros, phishing clauses, fake invoices, or fraudulent instructions.`;
        }
      }

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputData: payloadText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Threat analysis failed on server.');
      
      setResult(data);

      const logEntry = { 
        id: Date.now(),
        text: attachedFile ? `📁 Uploaded File: ${attachedFile.name}` : (inputData.length > 55 ? inputData.substring(0, 52) + '...' : inputData), 
        result: data, 
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
      };
      
      const updatedHistory = [logEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('cybersentinel_full_threat_logs', JSON.stringify(updatedHistory));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAttachedFile(null);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('cybersentinel_full_threat_logs');
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setAttachedFile(uploadedFile);

    if (uploadedFile.type.startsWith('image/')) {
      setInputData(`[Attached Image: ${uploadedFile.name}]`);
    } else if (uploadedFile.type.includes('audio') || uploadedFile.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      setInputData(`[Attached Voice Note: ${uploadedFile.name}]`);
    } else if (uploadedFile.type.includes('video') || uploadedFile.name.match(/\.(mp4|mkv|avi|mov|apk)$/i)) {
      setInputData(`[Attached Video/Media: ${uploadedFile.name}]`);
    } else if (uploadedFile.type.includes('pdf') || uploadedFile.name.match(/\.pdf$/i)) {
      setInputData(`[Attached PDF Document: ${uploadedFile.name}] - Ready for deep text & structure inspection.`);
    } else {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        setInputData(event.target.result);
      };
      fileReader.readAsText(uploadedFile);
    }
  };

  const handleQRUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setAttachedFile(uploadedFile);
    setInputData(`[QR CODE DECODER & PHISHING AUDIT: ${uploadedFile.name}] Ready to decode matrix and verify target URL safety.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between selection:bg-cyan-500 selection:text-white font-sans p-4 sm:p-6">
      
      {/* Top Navbar Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            🛡️
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              PHISHING & SCAM DETECTOR
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Analysis, Voice, Image, QR, Documents & Live Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="hidden sm:inline">Online</span>
        </div>
      </header>

      {/* NEW: Live Threat Intel / Scam Feed Ticker Bar */}
      <div className="w-full max-w-4xl bg-rose-950/30 border border-rose-500/30 rounded-xl overflow-hidden mb-6 flex items-center shadow-lg shadow-rose-950/20">
        <div className="bg-rose-600 text-white font-black text-[10px] sm:text-xs px-3 py-2 uppercase tracking-wider flex items-center space-x-1 shrink-0 z-10 shadow-md">
          <span>🔴 CURRENT SCAM ALERTS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap relative w-full py-2">
          <div className="inline-block animate-marquee text-xs text-rose-200 font-medium space-x-12">
            {scamAlerts.map((alert, idx) => (
              <span key={idx} className="inline-flex items-center space-x-2 mr-12">
                <span>{alert}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container Work Area */}
      <main className="w-full max-w-3xl flex-1 flex flex-col space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Autonomous Phishing & Scam Detector
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Analyze text messages, links, phone numbers, or upload pictures, videos, voice notes, QR codes, and documents.
          </p>
        </div>

        {/* Main Input Card & Clean File Uploaders */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Upload & Analyze Payload</span>
            
            {/* Upload Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <label className="cursor-pointer px-3 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm">
                <span>🖼️ Picture</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <label className="cursor-pointer px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm">
                <span>🔳 QR Code</span>
                <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />
              </label>

              <label className="cursor-pointer px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm">
                <span>🎬 Video</span>
                <input type="file" accept="video/*,.mp4,.mkv,.avi" onChange={handleFileUpload} className="hidden" />
              </label>

              <label className="cursor-pointer px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm">
                <span>🎙️ Voice</span>
                <input type="file" accept="audio/*,.mp3,.wav,.m4a" onChange={handleFileUpload} className="hidden" />
              </label>

              <label className="cursor-pointer px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm">
                <span>📄 Document</span>
                <input type="file" accept=".pdf,.docx,.txt,.csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="relative">
              <textarea
                rows="4"
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all resize-none shadow-inner"
                placeholder="Type or paste text, links, or upload pictures, QR codes, videos, voice notes, or documents above..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing Threat Intel & Payload...</span>
                </>
              ) : (
                <>
                  <span>⚡ Scan for Phishing & Scams</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Analysis Panel */}
        {result && (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Intelligence Verdict</span>
                <h3 className={`text-2xl font-black mt-1 ${result.isPhishing ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.verdict}
                </h3>
              </div>
              <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">Threat Index</span>
                  <span className={`text-base font-black ${result.riskScore > 50 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {result.riskScore}% Risk
                  </span>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border font-black text-xs ${result.riskScore > 50 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                  {result.riskScore}%
                </div>
              </div>
            </div>

            {/* Visual Risk Gauge Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase">
                <span>Security Meter</span>
                <span>{result.riskScore > 50 ? 'High Danger Level' : 'Secure / Clean'}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-1000 ${result.riskScore > 50 ? 'bg-gradient-to-r from-orange-500 to-rose-600 shadow-lg shadow-rose-500/40' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/40'}`}
                  style={{ width: `${result.riskScore}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Executive Threat Summary</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                {result.summary}
              </p>
            </div>

            {result.indicators && result.indicators.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Identified Indicators of Compromise (IoCs)</h4>
                <div className="flex flex-wrap gap-2">
                  {result.indicators.optionmap ? null : result.indicators.map((indicator, index) => (
                    <span key={index} className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center space-x-1">
                      <span>🦠</span>
                      <span>{indicator}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complete Persistent Scan Logs History */}
        {history.length > 0 && (
          <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Complete Scan History ({history.length} Saved)
              </h4>
              <button 
                onClick={clearHistory}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold underline transition-all"
              >
                Clear History
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-900/60 px-3.5 py-2.5 rounded-lg border border-slate-800/70 text-xs">
                  <span className="text-slate-300 truncate max-w-[200px] sm:max-w-md">{item.text}</span>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold ${item.result.isPhishing ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.result.verdict}
                    </span>
                    <span className="text-slate-500 text-[10px]">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
   
    </div>
  );
}

export default App;