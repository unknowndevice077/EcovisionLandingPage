'use client';

import React, { useState } from 'react';
import { s } from '../styles';

interface RealDetection {
  className: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

const CLASS_COLOR_MAP: Record<string, string> = {
  assault: '#ff3b30',
  violence: '#ff3b30',
  weapon: '#ffcc00',
  gun: '#ffcc00',
  theft: '#00b0ff',
  vandalism: '#aa00ff',
  person: '#76b900'
};

const DEFAULT_COLOR = '#a8d400';

export function InferenceSandbox() {
  const [dragActive, setDragActive] = useState(false);
  const [demoImage, setDemoImage] = useState<string | null>(null);
  const [inferencing, setInferencing] = useState(false);
  const [inferenceComplete, setInferenceComplete] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(40);
  const [iouThreshold, setIouThreshold] = useState<number>(45);
  const [activeTab, setActiveTab] = useState<'detections' | 'json'>('detections');
  const [allDetections, setAllDetections] = useState<RealDetection[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [inferenceLatency, setInferenceLatency] = useState<number>(0);

  const processRealInference = async (targetFile: File) => {
    setInferencing(true);
    setInferenceComplete(false);
    setErrorLog(null);

    const formData = new FormData();
    formData.append("file", targetFile);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The local AI engine failed to process the image"); // Simplified jargon[cite: 6]
      }

      setAllDetections(data.predictions);
      setInferenceLatency(data.latency || 0);
      
      const uniqueClasses = Array.from(new Set(data.predictions.map((d: RealDetection) => d.className.toLowerCase()))) as string[];
      setSelectedClasses(uniqueClasses);
      setInferenceComplete(true);

    } catch (err: any) {
      setErrorLog(err.message || "Could not connect to the local Python server"); // Simplified jargon[cite: 6]
      setDemoImage(null);
    } finally {
      setInferencing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDemoImage(URL.createObjectURL(file));
      processRealInference(file);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDemoImage(URL.createObjectURL(file));
      processRealInference(file);
    }
  };

  const toggleClassFilter = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const visibleDetections = allDetections.filter(det => {
    const passesConfidence = det.confidence * 100 >= confidenceThreshold;
    const passesClass = selectedClasses.includes(det.className.toLowerCase());
    return passesConfidence && passesClass;
  });

  const getDistinctModelClasses = () => {
    const classes = allDetections.map(d => d.className.toLowerCase());
    return Array.from(new Set(classes));
  };

  const clearSandbox = () => {
    setDemoImage(null);
    setInferenceComplete(false);
    setAllDetections([]);
    setErrorLog(null);
  };

  return (
    <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="playground">
      <div style={s.secInner}>
        
        <div className="reveal">
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>
            Live Testing Area
          </div>
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>
            YOLOv11 Live Camera Sandbox.
          </h2>
        </div>

        {errorLog && (
          <div style={{ background: '#1a0505', border: '1px solid #ff3b30', padding: '16px 24px', fontFamily: 'var(--fm)', fontSize: 13, color: '#ff8882', marginTop: 32 }}>
            ❌ <b>Server Connection Failure:</b> {errorLog}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Make sure your Python script is running in the background by typing `python predict.py` in your terminal.</div>
          </div>
        )}

        <div className="reveal d1" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 2, background: 'var(--border)', border: '1px solid var(--border)', marginTop: 48, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
          
          <div style={{ background: '#020502', minHeight: 580, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: demoImage ? '32px' : '0' }}>
            {!demoImage ? (
              <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                   style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, transition: 'background 0.3s', background: dragActive ? 'rgba(118, 185, 0, 0.04)' : 'transparent' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(118,185,0,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}/>
                <div style={{ width: 80, height: 80, border: '1px dashed rgba(118, 185, 0, 0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', background: 'rgba(2,5,2,0.6)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 32, height: 32 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--fh)', fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, color: '#fff' }}>Upload an Image for AI Testing</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Upload an image file to run it through your custom model</p>
                </div>
                <label style={{ padding: '12px 28px', background: 'var(--green)', color: '#020502', fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)', display: 'inline-block', cursor: 'none' }}>
                  Select Image File
                  <input type="file" onChange={handleManualUpload} accept="image/*" style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', maxWidth: '100%', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <img src={demoImage} alt="Live Model Stream Frame Target" style={{ display: 'block', maxWidth: '100%', height: 'auto', maxHeight: 560, objectFit: 'contain' }} />
                  
                  {navigator && inferencing && (
                    <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--green), transparent)', boxShadow: '0 0 15px var(--green)', animation: 'playgroundLaser 1.5s linear infinite', zIndex: 30 }}/>
                  )}

                  {inferencing && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,5,2,0.4)', backdropFilter: 'blur(4px)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--green)', letterSpacing: '3px', background: '#020502', padding: '12px 24px', border: '1px solid var(--border)', textTransform: 'uppercase', fontWeight: 700 }}>
                        ⏳ RUNNING AI DETECTION VIA PYTHON
                      </div>
                    </div>
                  )}

                  {inferenceComplete && visibleDetections.map((det, index) => {
                    const currentClsColor = CLASS_COLOR_MAP[det.className.toLowerCase()] || DEFAULT_COLOR;
                    return (
                      <div key={index} style={{
                        position: 'absolute',
                        top: `${det.y}%`,
                        left: `${det.x}%`,
                        width: `${det.w}%`,
                        height: `${det.h}%`,
                        border: `2px solid ${currentClsColor}`,
                        background: `${currentClsColor}08`,
                        pointerEvents: 'none',
                        fontFamily: 'var(--fm)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: -20,
                          left: -2,
                          background: currentClsColor,
                          color: '#020502',
                          fontSize: 10,
                          padding: '1px 6px',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}>
                          {det.className} [{(det.confidence * 100).toFixed(0)}%]
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#060d06', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
              <button onClick={() => setActiveTab('detections')}
                      style={{ padding: '16px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', background: activeTab === 'detections' ? '#0a160a' : 'none', color: activeTab === 'detections' ? 'var(--green)' : 'var(--muted)', border: 'none', borderBottom: activeTab === 'detections' ? '2px solid var(--green)' : 'none', cursor: 'none' }}>
                Active Detections
              </button>
              <button onClick={() => setActiveTab('json')}
                      style={{ padding: '16px', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', background: activeTab === 'json' ? '#0a160a' : 'none', color: activeTab === 'json' ? 'var(--green)' : 'var(--muted)', border: 'none', borderBottom: activeTab === 'json' ? '2px solid var(--green)' : 'none', cursor: 'none' }}>
                Raw JSON Stream
              </button>
            </div>

            <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 28, overflowY: 'auto' }}>
              {activeTab === 'detections' ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: 11, marginBottom: 8, color: 'var(--text)' }}>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Confidence Cutoff</span>
                        <b style={{ color: 'var(--green)' }}>{confidenceThreshold}%</b>
                      </div>
                      <input type="range" min="5" max="95" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))} aria-label="Model Confidence Threshold"
                             style={{ width: '100%', accentColor: 'var(--green)', height: '4px', background: 'var(--border)', outline: 'none' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: 11, marginBottom: 8, color: 'var(--text)' }}>
                        <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Box Overlap Limit (IoU)</span>
                        <b style={{ color: 'var(--green)' }}>{iouThreshold}%</b>
                      </div>
                      <input type="range" min="10" max="90" value={iouThreshold} onChange={(e) => setIouThreshold(Number(e.target.value))} aria-label="NMS Overlap Threshold"
                             style={{ width: '100%', accentColor: 'var(--green)', height: '4px', background: 'var(--border)', outline: 'none' }} />
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderBottom: '1px solid var(--border)' }} />

                  <div>
                    <h4 style={{ fontFamily: 'var(--fm)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: 16 }}>
                      Detected Threat Classes
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {inferenceComplete && getDistinctModelClasses().length > 0 ? (
                        getDistinctModelClasses().map(clsName => {
                          const isChecked = selectedClasses.includes(clsName);
                          const clsColor = CLASS_COLOR_MAP[clsName] || DEFAULT_COLOR;
                          const classOccurrencesCount = allDetections.filter(d => d.className.toLowerCase() === clsName && d.confidence * 100 >= confidenceThreshold).length;

                          return (
                            <label key={clsName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.15)', border: `1px solid ${isChecked ? 'var(--border-glow)' : 'transparent'}`, borderRadius: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <input type="checkbox" checked={isChecked} onChange={() => toggleClassFilter(clsName)} style={{ accentColor: clsColor, cursor: 'none' }} />
                                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: clsColor }} />
                                <span style={{ fontFamily: 'var(--fb)', fontSize: 14, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{clsName}</span>
                              </div>
                              <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--muted)', padding: '2px 6px', background: 'var(--surface)', borderRadius: '4px' }}>
                                {classOccurrencesCount}
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <div style={{ fontFamily: 'var(--fm)', fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '20px', border: '1px dashed var(--border)' }}>
                          Waiting for your image upload stream...
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <pre style={{ flex: 1, background: '#020502', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', fontFamily: 'var(--fm)', fontSize: 11, color: '#a2bfa2', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {demoImage && visibleDetections.length > 0 ? JSON.stringify({
                      model_file: "best.pt",
                      hardware: "Local AI Server",
                      performance: { response_time: `${inferenceLatency.toFixed(1)}ms` },
                      active_filters: { confidence_cutoff: confidenceThreshold / 100, box_overlap_limit: iouThreshold / 100 },
                      predictions: visibleDetections.map(d => ({
                        class: d.className,
                        confidence: d.confidence,
                        box_coordinates: { center_x: d.x, center_y: d.y, width: d.w, height: d.h }
                      }))
                    }, null, 2) : JSON.stringify({ predictions: [], status: "Waiting for an image upload..." }, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--fm)', fontSize: 11 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>AI Response Speed | Matches:</span>
                <b style={{ color: 'var(--green)', fontSize: 13, fontFamily: 'var(--fm)' }}>
                  {demoImage ? `${inferenceLatency.toFixed(1)}ms` : '0.0ms'} | {demoImage ? visibleDetections.length : 0} elements
                </b>
              </div>
              {demoImage && (
                <button onClick={clearSandbox} style={{ width: '100%', marginTop: 14, padding: '10px', background: 'none', border: '1px solid #ff3b30', color: '#ff3b30', fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s', cursor: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ff3b30'; e.currentTarget.style.color = '#020502'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#ff3b30'; }}>
                  Reset Active Workspace
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}