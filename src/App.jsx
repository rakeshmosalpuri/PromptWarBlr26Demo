import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, Workflow, Activity, Share2, FileText,
  AlertTriangle, Mic, Image as ImageIcon, CheckCircle, BrainCircuit
} from 'lucide-react';
import './index.css';

// Mocked Gemini Response Schema (The "Structured Action")
const MOCK_GEMINI_OUTPUT = {
  priority: 'CRITICAL',
  actionType: 'DISPATCH_EMERGENCY_MEDICAL',
  location: { lat: 34.0522, lng: -118.2437, address: "700 W 7th St, LA" },
  contextSummary: "Patient exhibits severe allergic reaction. Traffic is heavy on Route 6.",
  recommendedResponse: "Dispatch EMT unit immediate. Provide EpiPen.",
  confidenceScore: 0.98
};

function App() {
  const [inputStage, setInputStage] = useState('IDLE'); // IDLE, UPLOADING, PROCESSING, DONE
  const [logs, setLogs] = useState([]);
  const [actionPayload, setActionPayload] = useState(null);
  const logEndRef = useRef(null);

  const addLog = (msg, type = 'process') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute:'numeric', second:'numeric', fractionalSecondDigits: 2 });
    setLogs(prev => [...prev, { time, msg, type }]);
  };

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSimulateInput = () => {
    setInputStage('PROCESSING');
    setLogs([]);
    setActionPayload(null);
    
    addLog('Received unstructured multimodal payload (Audio 2.3MB, JPEG 4.1MB)...', 'process');
    
    setTimeout(() => {
      addLog('Connecting to Gemini 1.5 Pro cognitive engine...', 'process');
    }, 800);

    setTimeout(() => {
      addLog('Parsing handwriting OCR and transcribing paniced audio...', 'process');
    }, 1800);

    setTimeout(() => {
      addLog('Synthesizing intent. Mapped symptom: Anaphylaxis.', 'process');
    }, 2500);

    setTimeout(() => {
      addLog('Enforcing strict JSON schema (societal_dispatch_v1.0)...', 'process');
    }, 3200);

    setTimeout(() => {
      addLog('Intent synthesized and validated via guardrails.', 'success');
      setActionPayload(MOCK_GEMINI_OUTPUT);
      setInputStage('DONE');
    }, 4000);
  };

  const handleDispatch = () => {
    addLog(`System action executed! Webhook sent to ${actionPayload.actionType} API.`, 'success');
    alert("Action webhooks dispatched successfully!");
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">
            <Share2 color="#fff" size={24} />
          </div>
          <h1 className="logo-text">OmniBridge <span style={{fontSize:'0.6em', opacity: 0.5}}>GEMINI INTENT ENGINE</span></h1>
        </div>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● System Online</span>
        </div>
      </header>

      {/* THREE COLUMN DASHBOARD */}
      <div className="dashboard">
        {/* COL 1: Input Ingestion */}
        <section className="glass-panel" style={{zIndex: 3}}>
          <h2 className="panel-header"><UploadCloud /> 1. Ingestion Layer</h2>
          <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
            Accepts raw chaotic inputs: photos of handwritten medical notes, distressed 911 audio calls, or erratic sensor data strings.
          </p>

          <div 
            className={`dropzone ${inputStage === 'PROCESSING' ? 'active' : ''}`}
            onClick={inputStage === 'IDLE' || inputStage === 'DONE' ? handleSimulateInput : undefined}
          >
            <div style={{display:'flex', justifyContent:'center', gap:'1rem', marginBottom:'1rem'}}>
              <Mic size={32} />
              <ImageIcon size={32} />
              <FileText size={32} />
            </div>
            {inputStage === 'PROCESSING' ? (
              <p style={{color: 'var(--accent-blue)', fontWeight: 600}}>Uploading & Initiating analysis...</p>
            ) : (
              <>
                <p><strong>Click or Drag & Drop</strong> unstructured real-world data here</p>
                <button className="btn-upload">Simulate Crisis Input</button>
              </>
            )}
          </div>
        </section>

        {/* COL 2: Cognitive Bridge (Gemini) */}
        <section className="glass-panel" style={{zIndex: 2, transform: 'scale(1.02)'}}>
          <h2 className="panel-header"><BrainCircuit /> 2. Gemini Cognitive Core</h2>
          
          <div className="bridge-animation" style={{ opacity: inputStage === 'PROCESSING' ? 1 : 0.3 }}>
             <div className="bridge-node"></div>
             <div className="bridge-node"></div>
             <div className="bridge-node"></div>
          </div>

          <div className="processing-container">
            <h3 style={{fontSize: '0.8rem', textTransform:'uppercase', color:'var(--text-muted)'}}>Runtime Execution Logs</h3>
            <div className="log-window">
              {logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.type}`}>
                  <span className="time">[{log.time}]</span> {log.msg}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </section>

        {/* COL 3: Structured Output & Action */}
        <section className="glass-panel" style={{zIndex: 1}}>
          <h2 className="panel-header"><Workflow /> 3. Dispatch Action</h2>
          <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
            Gemini outputs strictly formatted intent mappings, verified against sociétal response schemas.
          </p>

          {!actionPayload && (
             <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex: 1, opacity: 0.3}}>
               <Activity size={48} />
               <p style={{marginTop:'1rem'}}>Awaiting processed intent...</p>
             </div>
          )}

          {actionPayload && (
            <div style={{flex: 1, display:'flex', flexDirection:'column'}}>
               <div className={`action-card ${actionPayload.priority.toLowerCase()}`}>
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                    <span className={`pill ${actionPayload.priority.toLowerCase()}`}>{actionPayload.priority} PRIORITY</span>
                    {actionPayload.confidenceScore > 0.9 && <span title="Verified by Gemini Constraints"><CheckCircle size={16} color="var(--success)"/></span>}
                 </div>
                 <h4 style={{fontSize:'1rem', marginBottom:'0.25rem'}}>{actionPayload.actionType}</h4>
                 <p style={{fontSize:'0.8rem', color:'var(--text-main)', opacity:0.8}}>{actionPayload.recommendedResponse}</p>
               </div>

               <h3 style={{fontSize: '0.75rem', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.5rem'}}>System Payload Generation:</h3>
               <div className="json-view">
{`{
  "`}<span className="json-key">priority</span>{`": "`}<span className="json-string">{actionPayload.priority}</span>{`",
  "`}<span className="json-key">actionType</span>{`": "`}<span className="json-string">{actionPayload.actionType}</span>{`",
  "`}<span className="json-key">location</span>{`": {
    "`}<span className="json-key">lat</span>{`": `}<span className="json-number">{actionPayload.location.lat}</span>{`,
    "`}<span className="json-key">lng</span>{`": `}<span className="json-number">{actionPayload.location.lng}</span>{`
  },
  "`}<span className="json-key">confidence</span>{`": `}<span className="json-number">{actionPayload.confidenceScore}</span>{`
}`}
               </div>

               <button className="trigger-btn" onClick={handleDispatch}>
                 Execute System Actions
               </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
