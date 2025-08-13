import React from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams, Outlet, Navigate } from 'react-router-dom'
import './App.css'
import { Loading, ErrorNotice } from './components/A11y'

// Expose React on window to avoid require() usage in browser
if (typeof window !== 'undefined') {
  ;(window as any).React = React
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lm-shell">
      <main className="lm-main">
        <header className="lm-topbar">
          <div className="lm-topbar-left">
            <Link to="/" className="lm-brand">Legal Mate</Link>
            <nav className="lm-topnav">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/cases">Cases</NavLink>
              <NavLink to="/templates">Templates</NavLink>
              <NavLink to="/integrations">Integrations</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              <NavLink to="/help">Help</NavLink>
            </nav>
          </div>
          <div className="lm-search-container" style={{ flex: 1, maxWidth: '400px' }}>
            <input className="lm-input lm-search-input" placeholder="Search matters, documents, drafts..." />
          </div>
          <div className="lm-topbar .actions">
            <Link className="lm-btn primary" to="/cases">+ New Case</Link>
          </div>
        </header>
        <div className="lm-content">{children}</div>
      </main>
    </div>
  )
}

function MattersList() {
  const ReactLib = React as any;
  const [items, setItems] = ReactLib.useState<Array<{ id: string; title: string; status?: string }>>([]);
  const [id, setId] = ReactLib.useState('M002');
  const [title, setTitle] = ReactLib.useState('New Case Title');

  async function load() {
    const r = await fetch('/api/cases', { headers: { 'x-user-role': 'Attorney' } });
    const j = await r.json();
    setItems(j.items || []);
  }
  ReactLib.useEffect(() => { load(); }, []);

  async function create() {
    if (!id.trim() || !title.trim()) return;
    try {
      const r = await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Attorney' }, body: JSON.stringify({ id, title }) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(`Create failed: ${j?.error || r.status}`);
        return;
      }
      setId(''); setTitle(''); await load();
    } catch (e: any) {
      alert('Network error creating case');
    }
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Cases</h1>
          <p className="lm-page-subtitle">Manage your legal matters and case files</p>
        </div>
      </div>
      
      <div className="lm-card mb-6">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Create New Case</h3>
          <p className="lm-card-subtitle">Start a new matter to organize documents and drafts</p>
        </div>
        <div className="lm-form-row">
          <div className="lm-form-group">
            <label className="lm-form-label">Case ID</label>
            <input className="lm-input" placeholder="e.g., M002" value={id} onChange={(e) => setId(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Case Title</label>
            <input className="lm-input" placeholder="e.g., Doe v. Acme Corp" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="lm-form-group flex items-end">
            <button className="lm-btn primary" onClick={create}>Create Case</button>
          </div>
        </div>
      </div>
      
      <div className="lm-sidebar-layout">
        <div className="lm-sidebar">
          <div className="lm-sidebar-header">Your Cases</div>
          <div className="lm-sidebar-content">
            <ul className="lm-sidebar-list">
            {items.map((m) => (
              <li key={m.id} className="lm-sidebar-item">
                <span className="font-medium">{m.title}</span>
                <Link className="lm-btn sm" to={`/matters/${m.id}/data`}>Open</Link>
              </li>
            ))}
            {items.length === 0 && (
              <li className="lm-sidebar-item">
                <span className="text-muted">No cases yet</span>
              </li>
            )}
          </ul>
          </div>
        </div>
        <div>
          <div className="lm-empty-state">
            <div className="lm-empty-title">Select a Case</div>
            <p className="lm-empty-description">Choose a case from the sidebar to open its workspace and begin working with documents, drafts, and evidence.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatterLayout() {
  const { matterId } = useParams();
  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Matter {matterId}</h1>
          <p className="lm-page-subtitle">Case workspace and document management</p>
        </div>
        <div>
          <Link className="lm-btn secondary" to="/cases">← Back to Cases</Link>
        </div>
      </div>
      
      <div className="lm-subnav">
        <NavLink to={`/matters/${matterId}/data`}>Data</NavLink>
        <NavLink to={`/matters/${matterId}/documents`}>Documents</NavLink>
        <NavLink to={`/matters/${matterId}/drafting`}>Drafting</NavLink>
        <NavLink to={`/matters/${matterId}/copilot`}>Copilot</NavLink>
        <NavLink to={`/matters/${matterId}/evidence`}>Evidence</NavLink>
        <NavLink to={`/matters/${matterId}/timeline`}>Timeline</NavLink>
        <NavLink to={`/matters/${matterId}/damages`}>Damages</NavLink>
        <NavLink to={`/matters/${matterId}/review`}>Review</NavLink>
        <NavLink to={`/matters/${matterId}/exports`}>Exports</NavLink>
      </div>
      
      <div>
        <Outlet />
      </div>
    </div>
  )
}

function Dashboard() {
  const ReactLib = React as any;
  const [metrics, setMetrics] = ReactLib.useState<any>(null);
  ReactLib.useEffect(() => {
    fetch('/metrics').then(r => r.json()).then(setMetrics).catch(() => {});
  }, []);
  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Dashboard</h1>
          <p className="lm-page-subtitle">Overview of your legal matters and recent activity</p>
        </div>
      </div>
      
      <div className="lm-dashboard-grid">
        <div className="lm-matter-card">
          <div className="lm-matter-header">
            <h3 className="lm-matter-title">Matter ABC vs XYZ</h3>
            <div className="flex gap-2">
              <span className="lm-chip success">Approved</span>
              <span className="lm-chip primary">Insurer</span>
            </div>
          </div>
          <div className="lm-trust-bar">
            <div className="lm-trust-item">
              <div className="lm-status-dot success"></div>
              <span>85% citations</span>
            </div>
            <div className="lm-trust-item">
              <div className="lm-status-dot success"></div>
              <span>No conflicts</span>
            </div>
            <div className="lm-trust-item">
              <div className="lm-status-dot primary"></div>
              <span>Preset: Insurer</span>
            </div>
          </div>
          <div className="lm-matter-actions">
            <Link className="lm-btn primary sm" to="/drafting">New Draft</Link>
            <Link className="lm-btn secondary sm" to="/data">Open Matter</Link>
          </div>
        </div>
        
        <div className="lm-metric-card">
          <div className="lm-card-header">
            <h3 className="lm-card-title">Usage Metrics</h3>
          </div>
          <div className="text-sm">
            {metrics ? (
              <pre className="text-xs">{JSON.stringify(metrics, null, 2)}</pre>
            ) : (
              <div className="lm-loading">
                <div className="lm-spinner"></div>
                <span>Loading metrics...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="lm-page-header">
      <div className="lm-page-title">
        <h1>{title}</h1>
        <p className="lm-page-subtitle">This feature is coming soon</p>
      </div>
    </div>
  )
}

function DataPage() {
  const params = useParams();
  const [matterId, setMatterId] = React.useState<string>((params as any).matterId || 'M001');
  React.useEffect(() => {
    const mid = (params as any).matterId;
    if (mid && matterId !== mid) setMatterId(mid);
  }, [params]);
  const ReactLib = React as any;
  const [data, setData] = ReactLib.useState<any>(null);
  const [trust, setTrust] = ReactLib.useState<any>(null);
  const [loading, setLoading] = ReactLib.useState(false);
  const [error, setError] = ReactLib.useState<string | null>(null);

  ReactLib.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const [sRes, tRes] = await Promise.all([
          fetch(`/api/data/${matterId}/summaries`),
          fetch(`/api/matters/${matterId}/trust`),
        ]);
        const sJson = await sRes.json();
        const tJson = await tRes.json();
        if (!cancelled) { setData(sJson); setTrust(tJson); }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, [matterId]);

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Case Data</h1>
          <p className="lm-page-subtitle">Document summaries and extracted information</p>
        </div>
      </div>
      
      {!params.matterId && (
        <div className="lm-card mb-6">
          <div className="lm-form-group">
            <label className="lm-form-label">Matter ID</label>
            <input className="lm-input" value={matterId} onChange={(e) => setMatterId(e.target.value)} />
          </div>
        </div>
      )}
      
      {loading && <Loading />}
      <ErrorNotice message={error || ''} />
      
      {data && (
        <div className="lm-sidebar-layout">
          <div>
            <div className="lm-card mb-6">
              <div className="lm-card-header">
                <h3 className="lm-card-title">Case Summary</h3>
              </div>
            <p>{data.caseSummary || 'No case summary yet. Upload documents to generate summaries.'}</p>
            </div>
            
            <div className="lm-card">
              <div className="lm-card-header">
                <h3 className="lm-card-title">Documents</h3>
              </div>
              <div className="lm-document-list">
              {(data.documents && data.documents.length > 0) ? data.documents.map((d: any) => (
                <div key={d.docId} className="lm-document-item">
                  <div className="lm-document-header">
                    <h4 className="lm-document-title">{d.docId}</h4>
                  </div>
                  <p className="mb-4">{d.summary}</p>
                  <ul>
                    {d.keyFacts?.map((f: any, i: number) => (
                      <li key={i}>
                        {f.text} 
                        <span className="text-muted"> — {f.source}{f.page ? ` p.${f.page}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )) : (
                <div className="lm-empty-state">
                  <div className="lm-empty-title">No Documents</div>
                  <p className="lm-empty-description">Use Documents → Upload to add files for OCR and summaries.</p>
                </div>
              )}
              </div>
            </div>
          </div>
          
          <div className="lm-sidebar">
            <div className="lm-sidebar-header">Risk Assessment</div>
            <div className="lm-sidebar-content">
            {trust ? (
              <div className="space-y-4">
                <div className="lm-trust-item">
                  <div className="lm-status-dot success"></div>
                  <div>
                    <div className="font-medium">Citation Coverage</div>
                    <div className="text-sm text-muted">{(trust.citationCoverage * 100).toFixed(0)}%</div>
                  </div>
                </div>
                <div className="lm-trust-item">
                  <div className="lm-status-dot success"></div>
                  <div>
                    <div className="font-medium">Conflicts</div>
                    <div className="text-sm text-muted">{trust.conflicts?.length || 0}</div>
                  </div>
                </div>
                <div className="lm-trust-item">
                  <div className="lm-status-dot primary"></div>
                  <div>
                    <div className="font-medium">Redaction Preset</div>
                    <div className="text-sm text-muted">{trust.redactionPreset}</div>
                  </div>
                </div>
                <div className="lm-trust-item">
                  <div className="lm-status-dot warning"></div>
                  <div>
                    <div className="font-medium">OCR Alerts</div>
                    <div className="text-sm text-muted">{trust.ocrAlerts?.length || 0}</div>
                  </div>
                </div>
                <div className="lm-trust-item">
                  <div className="lm-status-dot error"></div>
                  <div>
                    <div className="font-medium">Missing Documents</div>
                    <div className="text-sm text-muted">{(trust.missingDocuments || []).join(', ') || 'none'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lm-loading">
                <div className="lm-spinner"></div>
                <span>Loading assessment...</span>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CopilotPage() {
  const params = useParams();
  const ReactLib = React as any;
  const [matterId, setMatterId] = ReactLib.useState<string>((params as any).matterId || 'M001');
  React.useEffect(() => {
    const mid = (params as any).matterId;
    if (mid && matterId !== mid) setMatterId(mid);
  }, [params]);
  const [input, setInput] = ReactLib.useState('Summarize key injuries and bills.');
  const [messages, setMessages] = ReactLib.useState<any[]>([]);
  const [busy, setBusy] = ReactLib.useState(false);
  const [searchQ, setSearchQ] = ReactLib.useState('');
  const [searchRes, setSearchRes] = ReactLib.useState<any[]>([]);

  async function send() {
    if (!input.trim()) return;
    setBusy(true);
    const userMsg = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    try {
      const res = await fetch(`/api/copilot/${matterId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg.content, mode: 'DRAFT' }) });
      const json = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: json.answer, citations: json.citations }]);
    } finally {
      setBusy(false);
    }
  }

  async function doSearch() {
    if (!searchQ.trim()) return;
    const r = await fetch(`/api/copilot/${matterId}/search?q=${encodeURIComponent(searchQ)}`);
    const j = await r.json();
    setSearchRes(j.items || []);
  }

  return (
      <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>AI Copilot</h1>
          <p className="lm-page-subtitle">Ask questions about your case with AI-powered assistance</p>
        </div>
      </div>
      
      {!params.matterId && (
        <div className="lm-card mb-6">
          <div className="lm-form-group">
            <label className="lm-form-label">Matter ID</label>
            <input className="lm-input" value={matterId} onChange={(e) => setMatterId(e.target.value)} />
          </div>
        </div>
      )}
      
      <div className="lm-sidebar-layout">
        <div className="lm-chat-container" style={{ minHeight: '500px' }}>
          <div className="lm-chat-messages">
          {messages.length === 0 && (
            <div className="lm-empty-state">
              <div className="lm-empty-title">Start a Conversation</div>
              <p className="lm-empty-description">Ask questions about this matter, such as "Summarize treatment and bills with citations"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`lm-chat-message ${m.role}`}>
              <div className={`lm-chat-bubble ${m.role}`}>
                <div className="font-medium mb-1">{m.role === 'user' ? 'You' : 'AI Copilot'}</div>
                <div>{m.content}</div>
            {m.citations && (
                <ul className="mt-2 text-sm">
                {m.citations.map((c: any, j: number) => (
                    <li key={j} className="text-muted">📄 {c.source}{c.page ? ` p.${c.page}` : ''}</li>
                ))}
              </ul>
            )}
              </div>
            </div>
          ))}
          </div>
          <div className="lm-chat-input-container">
            <input 
              className="lm-chat-input lm-input" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about this matter..." 
              onKeyPress={(e) => e.key === 'Enter' && send()}
            />
            <button className="lm-btn primary" onClick={send} disabled={busy}>
              {busy ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
        
        <div className="lm-sidebar">
          <div className="lm-sidebar-header">Document Search</div>
          <div className="lm-sidebar-content">
            <div className="flex gap-2 mb-4">
              <input 
                className="lm-input" 
                value={searchQ} 
                onChange={(e) => setSearchQ(e.target.value)} 
                placeholder="Search documents..." 
                style={{ flex: 1 }}
              />
              <button className="lm-btn secondary sm" onClick={doSearch}>Search</button>
            </div>
            <div className="space-y-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {searchRes.map((it: any, i: number) => (
                <div key={i} className="p-3 border border-gray-200 rounded">
                  <div className="text-xs text-muted mb-1">
                    📄 {it.source}{it.page ? ` p.${it.page}` : ''}
                  </div>
                  <div className="text-sm">{String(it.text || '').slice(0, 200)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsPage() {
  const params = useParams();
  const ReactLib = React as any;
  const [matterId, setMatterId] = ReactLib.useState<string>((params as any).matterId || 'M001');
  React.useEffect(() => {
    const mid = (params as any).matterId;
    if (mid && matterId !== mid) setMatterId(mid);
  }, [params]);
  const [items, setItems] = ReactLib.useState<any[]>([]);
  const [busy, setBusy] = ReactLib.useState(false);
  const [err, setErr] = ReactLib.useState<string | null>(null);

  async function sha256Hex(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buf);
    const bytes = new Uint8Array(digest);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function uploadSingle(file: File) {
    const entry = { name: file.name, status: 'preparing', mime: file.type || 'application/octet-stream' } as any;
    setItems((xs) => [entry, ...xs]);
    try {
      const digest = await sha256Hex(file);
      const initRes = await fetch('/api/ingestion/uploads:init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'Paralegal' },
        body: JSON.stringify({ fileName: file.name, contentType: entry.mime, contentLength: file.size, matterId }),
      });
      if (!initRes.ok) {
        const j = await initRes.json().catch(() => ({}));
        throw new Error(j?.error || `init_failed_${initRes.status}`);
      }
      const { uploadUrl } = await initRes.json();
      setItems((xs) => [{ ...entry, status: 'uploading' }, ...xs.filter((i) => i !== entry)]);
      const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'x-content-sha256': digest, 'x-user-role': 'Paralegal' }, body: file });
      const payload = await putRes.json().catch(() => ({}));
      if (putRes.status === 201 && payload?.ok) {
        setItems((xs) => [{ ...entry, status: 'trusted', mime: payload.mime, documentId: payload.documentId }, ...xs.filter((i) => i !== entry)]);
      } else if (putRes.status === 200 && payload?.ok && payload?.duplicateOf) {
        setItems((xs) => [{ ...entry, status: `duplicate_of_${payload.duplicateOf}`, mime: payload.mime }, ...xs.filter((i) => i !== entry)]);
      } else {
        throw new Error(payload?.error || `upload_failed_${putRes.status}`);
      }
    } catch (e: any) {
      setErr(e?.message || 'Upload failed');
      setItems((xs) => [{ ...entry, status: 'error' }, ...xs.filter((i) => i !== entry)]);
    }
  }

  async function onSelect(ev: any) {
    const list: File[] = Array.from(ev.target.files || []);
    if (list.length === 0) return;
    setErr(null);
    setBusy(true);
    try {
      for (const f of list) {
        // sequential to reduce load; can be parallelized later
        // eslint-disable-next-line no-await-in-loop
        await uploadSingle(f);
      }
    } finally {
      setBusy(false);
      (ev.target as any).value = '';
    }
  }

  async function refreshExisting() {
    if (!matterId) return;
    try {
      const r = await fetch(`/api/matters/${matterId}/documents`, { headers: { 'x-user-role': 'Paralegal' } });
      const j = await r.json();
      const mapped = (j.items || []).map((m: any) => ({ name: m.originalFileName || m.fileName, status: 'trusted', mime: m.contentType, documentId: m.documentId }));
      setItems(mapped);
    } catch (_e) {
      // ignore
    }
  }

  ReactLib.useEffect(() => { refreshExisting(); }, [matterId]);

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Documents</h1>
          <p className="lm-page-subtitle">Upload and manage case documents with OCR processing</p>
        </div>
      </div>
      
      {!params.matterId && (
        <div className="lm-card mb-6">
          <div className="lm-form-row">
            <div className="lm-form-group">
              <label className="lm-form-label">Matter ID</label>
              <input className="lm-input" value={matterId} onChange={(e) => setMatterId(e.target.value)} />
            </div>
            <div className="lm-form-group flex items-end">
              <input 
                type="file" 
                multiple 
                onChange={onSelect} 
                disabled={busy}
                className="lm-input"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
        </div>
      )}
      
      {params.matterId && (
        <div className="lm-card mb-6">
          <div className="lm-card-header">
            <h3 className="lm-card-title">Upload Documents</h3>
            <p className="lm-card-subtitle">Supported formats: PDF, DOCX, JPG, PNG</p>
          </div>
          <input 
            type="file" 
            multiple 
            onChange={onSelect} 
            disabled={busy}
            className="lm-input"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
          />
        </div>
      )}
      
      <ErrorNotice message={err || ''} />
      
      <div className="lm-document-list">
        {items.length === 0 && (
          <div className="lm-empty-state">
            <div className="lm-empty-title">No Documents</div>
            <p className="lm-empty-description">Upload files to begin processing. Supported types: PDF, DOCX, and images.</p>
          </div>
        )}
        {items.map((it, i) => (
          <div key={i} className="lm-document-item">
            <div className="lm-document-header">
              <h4 className="lm-document-title">{it.name}</h4>
              <span className={`lm-chip ${it.status === 'trusted' ? 'success' : it.status === 'error' ? 'error' : 'warning'}`}>
                {it.status}
              </span>
            </div>
            <div className="lm-document-meta">
              <div>Type: {it.mime}</div>
              {it.documentId && <div>Document ID: {it.documentId}</div>}
              <div>OCR: scheduled</div>
              <div>Digital text: unknown</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DraftingPage() {
  const params = useParams();
  const ReactLib = React as any;
  const [matterId, setMatterId] = ReactLib.useState<string>((params as any).matterId || 'M001');
  React.useEffect(() => {
    const mid = (params as any).matterId;
    if (mid && matterId !== mid) setMatterId(mid);
  }, [params]);
  const steps = ['Parties', 'Incident', 'Liability', 'Damages', 'Exhibits', 'Review'];
  const [step, setStep] = ReactLib.useState(0);
  const [form, setForm] = ReactLib.useState<any>({
    claimant: '', defendant: '',
    incidentDate: '', incidentLocation: '',
    liability: '', damages: '', exhibits: ''
  });
  const [busy, setBusy] = ReactLib.useState(false);

  function update(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  function preview() {
    const parts: string[] = [];
    parts.push(`# Demand Letter Preview`);
    parts.push(`Parties: ${form.claimant || '[claimant]'} vs ${form.defendant || '[defendant]'}`);
    parts.push(`Incident: ${form.incidentDate || '[date]'} at ${form.incidentLocation || '[location]'}`);
    parts.push(`\nLiability:\n${form.liability || '(draft pending)'}\n`);
    parts.push(`Damages:\n${form.damages || '(draft pending)'}\n`);
    if (form.exhibits) parts.push(`Exhibits:\n${form.exhibits}`);
    return parts.join('\n');
  }

  async function insertFromCopilot(section: 'liability' | 'damages') {
    setBusy(true);
    try {
      const ask = section === 'liability' ? 'Draft a liability paragraph with citations.' : 'Draft a damages paragraph with citations.';
      const res = await fetch(`/api/copilot/${matterId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: ask }) });
      const json = await res.json();
      const citeNote = json.citations?.map((c: any) => `${c.source}${c.page ? ` p.${c.page}` : ''}`).join('; ');
      const text = json.answer + (citeNote ? `\n[cites: ${citeNote}]` : '');
      setForm((f: any) => ({ ...f, [section]: (f[section] ? f[section] + '\n' : '') + text }));
    } finally {
      setBusy(false);
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Claimant <small style={{ opacity: 0.6 }}>e.g., Jane Doe</small>
              <input value={form.claimant} onChange={(e) => update('claimant', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            </label>
            <label>Defendant <small style={{ opacity: 0.6 }}>e.g., ABC Logistics, Inc.</small>
              <input value={form.defendant} onChange={(e) => update('defendant', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            </label>
          </div>
        );
      case 1:
        return (
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Incident Date <small style={{ opacity: 0.6 }}>MM/DD/YYYY</small>
              <input value={form.incidentDate} onChange={(e) => update('incidentDate', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            </label>
            <label>Incident Location <small style={{ opacity: 0.6 }}>City, State</small>
              <input value={form.incidentLocation} onChange={(e) => update('incidentLocation', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            </label>
          </div>
        );
      case 2:
        return (
          <div>
            <div style={{ marginBottom: 8 }}>
              <button onClick={() => insertFromCopilot('liability')} disabled={busy}>Insert from Copilot</button>
            </div>
            <textarea value={form.liability} onChange={(e) => update('liability', e.target.value)} style={{ width: '100%', height: 160, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <div style={{ opacity: 0.6, marginTop: 6 }}>Tip: include citations like [1], [2] linking to sources.</div>
          </div>
        );
      case 3:
        return (
          <div>
            <div style={{ marginBottom: 8 }}>
              <button onClick={() => insertFromCopilot('damages')} disabled={busy}>Insert from Copilot</button>
            </div>
            <textarea value={form.damages} onChange={(e) => update('damages', e.target.value)} style={{ width: '100%', height: 160, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <div style={{ opacity: 0.6, marginTop: 6 }}>Tip: list specials and narratives, with citations.</div>
          </div>
        );
      case 4:
        return (
          <div>
            <textarea value={form.exhibits} onChange={(e) => update('exhibits', e.target.value)} placeholder="Exhibit 1: ...\nExhibit 2: ..." style={{ width: '100%', height: 140, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </div>
        );
      default:
        return <div>Review your draft on the right. You can export from the Exports page once approved.</div>
    }
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Document Drafting</h1>
          <p className="lm-page-subtitle">Create professional legal documents with AI assistance</p>
        </div>
      </div>
      
      <div className="lm-drafting-layout">
        <div className="lm-drafting-stepper">
          {!params.matterId && (
            <div className="lm-form-group mb-6">
              <label className="lm-form-label">Matter ID</label>
              <input className="lm-input" value={matterId} onChange={(e) => setMatterId(e.target.value)} />
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Document Steps</h3>
            <ol className="lm-stepper">
            {steps.map((s, i) => (
              <li key={s} className={`lm-stepper-item ${step === i ? 'active' : ''}`} onClick={() => setStep(i)}>
                <div className="lm-stepper-number">{i + 1}</div>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          </div>
          
          <div className="mb-6">
          {renderStep()}
          </div>
          
          <div className="flex gap-2">
            <button 
              className="lm-btn secondary" 
              onClick={() => setStep((s: number) => Math.max(0, s - 1))} 
              disabled={step === 0}
            >
              ← Previous
            </button>
            <button 
              className="lm-btn primary" 
              onClick={() => setStep((s: number) => Math.min(steps.length - 1, s + 1))} 
              disabled={step === steps.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
        
        <div className="lm-drafting-preview">
          <div className="lm-card-header">
            <h3 className="lm-card-title">Live Preview</h3>
            <p className="lm-card-subtitle">Document preview updates as you complete each step</p>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{preview()}</pre>
        </div>
      </div>
    </div>
  )
}

function TemplatesPage() {
  const ReactLib = React as any;
  const [items, setItems] = ReactLib.useState<any[]>([]);
  const [name, setName] = ReactLib.useState('Demand Letter');
  const [content, setContent] = ReactLib.useState('Hello {{claimant}}, ...');

  async function load() {
    const res = await fetch('/api/templates', { headers: { 'x-user-role': 'Admin' } });
    const json = await res.json();
    setItems(json.items || []);
  }
  ReactLib.useEffect(() => { load(); }, []);

  async function create() {
    await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' }, body: JSON.stringify({ name, content }) });
    setName(''); setContent('');
    await load();
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Document Templates</h1>
          <p className="lm-page-subtitle">Manage reusable document templates with variables</p>
        </div>
      </div>
      
      <div className="lm-grid-2">
        <div>
          <div className="lm-card">
            <div className="lm-card-header">
              <h3 className="lm-card-title">Create New Template</h3>
              <p className="lm-card-subtitle">Use {{variable}} syntax for dynamic content</p>
            </div>
            <div className="lm-form-group">
              <label className="lm-form-label">Template Name</label>
              <input 
                className="lm-input" 
                placeholder="e.g., Demand Letter" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="lm-form-group">
              <label className="lm-form-label">Template Content</label>
              <textarea 
                className="lm-textarea" 
                placeholder="Enter template content with {{variables}}..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                style={{ height: '200px' }}
              />
              <div className="lm-form-help">
                Use variables like {{claimant}}, {{defendant}}, {{incidentDate}} for dynamic content
              </div>
            </div>
            <button className="lm-btn primary" onClick={create}>Create Template</button>
          </div>
        </div>
        
        <div>
          <div className="lm-card">
            <div className="lm-card-header">
              <h3 className="lm-card-title">Existing Templates</h3>
            </div>
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="lm-empty-state">
                  <div className="lm-empty-title">No Templates</div>
                  <p className="lm-empty-description">Create your first template to get started</p>
                </div>
              ) : (
                items.map((t: any) => (
                  <div key={t.id} className="p-3 border border-gray-200 rounded">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted">
                      Updated {new Date(t.updatedAt).toLocaleString?.() || t.updatedAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntegrationsPage() {
  const ReactLib = React as any;
  const [orgId, setOrgId] = ReactLib.useState('org');
  const [provider, setProvider] = ReactLib.useState<'clio' | 'microsoft' | 'google'>('clio');
  const [value, setValue] = ReactLib.useState<any>({});
  const [loading, setLoading] = ReactLib.useState(false);
  const [saved, setSaved] = ReactLib.useState(false);

  async function load() {
    setLoading(true); setSaved(false);
    const r = await fetch('/api/integrations/get', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' }, body: JSON.stringify({ orgId }) });
    const j = await r.json();
    const cfg = j?.config || {};
    const pv = cfg[provider] || {};
    setValue(pv);
    setLoading(false);
  }
  ReactLib.useEffect(() => { load(); }, [orgId, provider]);

  function setField(k: string, v: string) { setValue((val: any) => ({ ...val, [k]: v })); }

  async function save() {
    setLoading(true); setSaved(false);
    await fetch('/api/integrations/set', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Admin' }, body: JSON.stringify({ orgId, provider, value }) });
    setLoading(false); setSaved(true);
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Integrations</h1>
          <p className="lm-page-subtitle">Connect with your existing legal software and cloud storage</p>
        </div>
      </div>
      
      <div className="lm-card mb-6">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Integration Settings</h3>
        </div>
        <div className="lm-form-row mb-4">
          <div className="lm-form-group">
            <label className="lm-form-label">Organization</label>
            <input className="lm-input" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Provider</label>
            <select className="lm-select" value={provider} onChange={(e) => setProvider(e.target.value as any)}>
              <option value="clio">Clio</option>
              <option value="microsoft">Microsoft 365</option>
              <option value="google">Google Workspace</option>
            </select>
          </div>
          <div className="lm-form-group flex items-end gap-2">
            <button className="lm-btn primary" onClick={save} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
            {saved && <span className="lm-chip success">Saved</span>}
          </div>
        </div>
      </div>
      
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Provider Configuration</h3>
          <p className="lm-card-subtitle">Enter your {provider} API credentials</p>
        </div>
        <div className="lm-form-group space-y-4" style={{ maxWidth: '600px' }}>
        {provider === 'clio' && (
          <>
            <div className="lm-form-group">
              <label className="lm-form-label">Client ID</label>
              <input className="lm-input" placeholder="Enter Clio Client ID" value={value.clientId || ''} onChange={(e) => setField('clientId', e.target.value)} />
            </div>
            <div className="lm-form-group">
              <label className="lm-form-label">Client Secret</label>
              <input className="lm-input" type="password" placeholder="Enter Clio Client Secret" value={value.clientSecret || ''} onChange={(e) => setField('clientSecret', e.target.value)} />
            </div>
          </>
        )}
        {provider === 'microsoft' && (
          <>
            <div className="lm-form-group">
              <label className="lm-form-label">Tenant ID</label>
              <input className="lm-input" placeholder="Enter Microsoft Tenant ID" value={value.tenantId || ''} onChange={(e) => setField('tenantId', e.target.value)} />
            </div>
            <div className="lm-form-group">
              <label className="lm-form-label">Client ID</label>
              <input className="lm-input" placeholder="Enter Microsoft Client ID" value={value.clientId || ''} onChange={(e) => setField('clientId', e.target.value)} />
            </div>
            <div className="lm-form-group">
              <label className="lm-form-label">Client Secret</label>
              <input className="lm-input" type="password" placeholder="Enter Microsoft Client Secret" value={value.clientSecret || ''} onChange={(e) => setField('clientSecret', e.target.value)} />
            </div>
          </>
        )}
        {provider === 'google' && (
          <>
            <div className="lm-form-group">
              <label className="lm-form-label">Client ID</label>
              <input className="lm-input" placeholder="Enter Google Client ID" value={value.clientId || ''} onChange={(e) => setField('clientId', e.target.value)} />
            </div>
            <div className="lm-form-group">
              <label className="lm-form-label">Client Secret</label>
              <input className="lm-input" type="password" placeholder="Enter Google Client Secret" value={value.clientSecret || ''} onChange={(e) => setField('clientSecret', e.target.value)} />
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const ReactLib = React as any;
  const [plan, setPlan] = ReactLib.useState<'Basic' | 'Pro' | 'Enterprise'>('Pro');
  const [seats, setSeats] = ReactLib.useState(5);
  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Settings</h1>
          <p className="lm-page-subtitle">Manage your subscription and account preferences</p>
        </div>
      </div>
      
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Subscription Management</h3>
          <p className="lm-card-subtitle">Manage your Legal Mate subscription plan and user seats</p>
        </div>
        <div className="lm-form-row mb-4">
          <div className="lm-form-group">
            <label className="lm-form-label">Subscription Plan</label>
            <select className="lm-select" value={plan} onChange={(e) => setPlan(e.target.value as any)}>
              <option value="Basic">Basic - $99/month</option>
              <option value="Pro">Pro - $199/month</option>
              <option value="Enterprise">Enterprise - Contact Sales</option>
            </select>
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">User Seats</label>
            <input 
              className="lm-input" 
              type="number" 
              value={seats} 
              onChange={(e) => setSeats(parseInt(e.target.value || '0', 10))} 
              min="1"
              max="100"
            />
          </div>
          <div className="lm-form-group flex items-end">
            <button className="lm-btn secondary" disabled>Update Plan</button>
          </div>
        </div>
        <div className="lm-chip warning">
          Billing management is currently in development
        </div>
      </div>
    </div>
  )
}

function EvidenceBoardPage() {
  const ReactLib = React as any;
  const [unreviewed, setUnreviewed] = ReactLib.useState<string[]>(['file1.pdf', 'file2.pdf']);
  const [relevant, setRelevant] = ReactLib.useState<string[]>([]);
  const [exhibits, setExhibits] = ReactLib.useState<{ name: string; caption?: string; number?: number }[]>([]);

  function move(from: string[], setFrom: any, to: any, item: string) {
    setFrom(from.filter((x) => x !== item));
    to((prev: any) => [...prev, item]);
  }

  function promoteToExhibit(name: string) {
    const caption = prompt('Exhibit caption?') || '';
    const number = exhibits.length + 1;
    setExhibits((xs) => [...xs, { name, caption, number }]);
    setRelevant((xs) => xs.filter((x) => x !== name));
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Evidence Board</h1>
          <p className="lm-page-subtitle">Organize and categorize case evidence and exhibits</p>
        </div>
      </div>
      
      <div className="lm-evidence-board">
        <div className="lm-evidence-column">
          <div className="lm-evidence-header">Unreviewed</div>
          <div>
            {unreviewed.map((f) => (
              <div key={f} className="lm-evidence-item">
                <div className="font-medium mb-2">{f}</div>
                <button className="lm-btn sm primary" onClick={() => move(unreviewed, setUnreviewed, setRelevant, f)}>
                  Mark Relevant
                </button>
              </div>
            ))}
            {unreviewed.length === 0 && (
              <div className="lm-empty-state">
                <div className="lm-empty-title">No Unreviewed Items</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lm-evidence-column">
          <div className="lm-evidence-header">Relevant</div>
          <div>
            {relevant.map((f) => (
              <div key={f} className="lm-evidence-item">
                <div className="font-medium mb-2">{f}</div>
                <button className="lm-btn sm secondary" onClick={() => promoteToExhibit(f)}>
                  Make Exhibit
                </button>
              </div>
            ))}
            {relevant.length === 0 && (
              <div className="lm-empty-state">
                <div className="lm-empty-title">No Relevant Items</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lm-evidence-column">
          <div className="lm-evidence-header">Exhibits</div>
          <div>
            {exhibits.map((e, i) => (
              <div key={i} className="lm-evidence-item">
                <div className="font-semibold text-primary mb-1">Exhibit {e.number}</div>
                <div className="font-medium">{e.name}</div>
                {e.caption && <div className="text-sm text-muted italic mt-1">{e.caption}</div>}
              </div>
            ))}
            {exhibits.length === 0 && (
              <div className="lm-empty-state">
                <div className="lm-empty-title">No Exhibits</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelinePage() {
  const ReactLib = React as any;
  const [events, setEvents] = ReactLib.useState<Array<{ date: string; title: string; source?: string }>>([
    { date: '2024-01-10', title: 'Incident', source: 'police_report.pdf' },
  ]);
  const [date, setDate] = ReactLib.useState('');
  const [title, setTitle] = ReactLib.useState('');
  const [source, setSource] = ReactLib.useState('');

  function addEvent() {
    if (!date || !title) return;
    setEvents((evs) => [...evs, { date, title, source }]);
    setDate(''); setTitle(''); setSource('');
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Case Timeline</h1>
          <p className="lm-page-subtitle">Track important events and dates in chronological order</p>
        </div>
      </div>
      
      <div className="lm-card mb-6">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Add New Event</h3>
        </div>
        <div className="lm-form-row">
          <div className="lm-form-group">
            <label className="lm-form-label">Date</label>
            <input className="lm-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Event Title</label>
            <input className="lm-input" placeholder="e.g., Incident occurred" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Source Document</label>
            <input className="lm-input" placeholder="e.g., police_report.pdf" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div className="lm-form-group flex items-end">
            <button className="lm-btn primary" onClick={addEvent}>Add Event</button>
          </div>
        </div>
      </div>
      
      <div className="lm-timeline">
        {events.sort((a, b) => a.date.localeCompare(b.date)).map((ev, i) => (
          <div key={i} className="lm-timeline-item">
            <div className="lm-timeline-content">
              <div className="lm-timeline-date">{new Date(ev.date).toLocaleDateString()}</div>
              <div className="lm-timeline-title">{ev.title}</div>
              {ev.source && <div className="lm-timeline-source">Source: {ev.source}</div>}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="lm-empty-state">
            <div className="lm-empty-title">No Timeline Events</div>
            <p className="lm-empty-description">Add events to build a chronological timeline of your case</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DamagesPage() {
  const ReactLib = React as any;
  const [lines, setLines] = ReactLib.useState<Array<{ provider: string; date: string; billed: number; paid?: number }>>([
    { provider: 'ER Visit', date: '2024-01-11', billed: 1250.0, paid: 400.0 },
  ]);
  const [provider, setProvider] = ReactLib.useState('');
  const [date, setDate] = ReactLib.useState('');
  const [billed, setBilled] = ReactLib.useState('');
  const [paid, setPaid] = ReactLib.useState('');

  function addLine() {
    const b = parseFloat(billed || '0');
    const p = paid ? parseFloat(paid) : undefined;
    if (!provider || !date || isNaN(b)) return;
    setLines((ls) => [...ls, { provider, date, billed: b, paid: p }]);
    setProvider(''); setDate(''); setBilled(''); setPaid('');
  }

  const specials = lines.reduce((sum, l) => sum + (l.billed || 0), 0);

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Damages Calculator</h1>
          <p className="lm-page-subtitle">Track medical expenses and calculate total damages</p>
        </div>
      </div>
      
      <div className="lm-card mb-6">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Add Medical Expense</h3>
        </div>
        <div className="lm-form-row">
          <div className="lm-form-group">
            <label className="lm-form-label">Provider/Service</label>
            <input className="lm-input" placeholder="e.g., Emergency Room Visit" value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Service Date</label>
            <input className="lm-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Amount Billed</label>
            <input className="lm-input" type="number" step="0.01" placeholder="0.00" value={billed} onChange={(e) => setBilled(e.target.value)} />
          </div>
          <div className="lm-form-group">
            <label className="lm-form-label">Amount Paid</label>
            <input className="lm-input" type="number" step="0.01" placeholder="0.00 (optional)" value={paid} onChange={(e) => setPaid(e.target.value)} />
          </div>
          <div className="lm-form-group flex items-end">
            <button className="lm-btn primary" onClick={addLine}>Add Expense</button>
          </div>
        </div>
      </div>
      
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Medical Expenses Summary</h3>
        </div>
        {lines.length === 0 ? (
          <div className="lm-empty-state">
            <div className="lm-empty-title">No Expenses Added</div>
            <p className="lm-empty-description">Add medical expenses to calculate total damages</p>
          </div>
        ) : (
          <>
      <table className="w-full">
        <thead>
          <tr>
            <th>Provider/Service</th>
            <th>Date</th>
            <th style={{ textAlign: 'right' }}>Amount Billed</th>
            <th style={{ textAlign: 'right' }}>Amount Paid</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td>{l.provider}</td>
              <td>{new Date(l.date).toLocaleDateString()}</td>
              <td style={{ textAlign: 'right' }}>${l.billed.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>{l.paid != null ? `$${l.paid.toFixed(2)}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="lm-divider"></div>
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">Total Medical Specials:</div>
        <div className="font-bold text-xl text-primary">${specials.toFixed(2)}</div>
      </div>
          </>
        )}
      </div>
    </div>
  )
}

function ReviewPage() {
  const params = useParams();
  const ReactLib = React as any;
  const [matterId, setMatterId] = ReactLib.useState<string>((params as any).matterId || 'M001');
  React.useEffect(() => {
    const mid = (params as any).matterId;
    if (mid && matterId !== mid) setMatterId(mid);
  }, [params]);
  const [status, setStatus] = ReactLib.useState<any>(null);
  const [comments, setComments] = ReactLib.useState<any[]>([]);
  const [text, setText] = ReactLib.useState('');
  const [busy, setBusy] = ReactLib.useState(false);

  async function load() {
    const [s, c] = await Promise.all([
      fetch('/api/review/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matterId }) }).then(r => r.json()),
      fetch('/api/review/comments/list', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Attorney' }, body: JSON.stringify({ matterId }) }).then(r => r.json()),
    ]);
    setStatus(s.status || null);
    setComments(c.comments || []);
  }
  ReactLib.useEffect(() => { load(); }, [matterId]);

  async function addComment() {
    if (!text.trim()) return;
    setBusy(true);
    await fetch('/api/review/comments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Attorney' }, body: JSON.stringify({ matterId, section: 'general', text }) });
    setText('');
    await load();
    setBusy(false);
  }

  async function approve() {
    setBusy(true);
    await fetch('/api/review/approve', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': 'Attorney' }, body: JSON.stringify({ matterId, approverId: 'attorney-1' }) });
    await load();
    setBusy(false);
  }

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Document Review</h1>
          <p className="lm-page-subtitle">Review and approve documents before final export</p>
        </div>
      </div>
      
      <div className="lm-card mb-6">
        <div className="lm-form-row">
        {!params.matterId && (
          <div className="lm-form-group">
            <label className="lm-form-label">Matter ID</label>
            <input className="lm-input" value={matterId} onChange={(e) => setMatterId(e.target.value)} />
          </div>
        )}
          <div className="lm-form-group flex items-center gap-4">
            <div>
              <span className="text-muted">Status: </span>
              <span className={`lm-chip ${status?.status === 'approved' ? 'success' : 'warning'}`}>
                {status?.status || 'unknown'}
              </span>
            </div>
            <button className="lm-btn primary" onClick={approve} disabled={busy}>
              {busy ? 'Approving...' : 'Approve Document'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="lm-card">
        <div className="lm-card-header">
          <h3 className="lm-card-title">Review Comments</h3>
          <p className="lm-card-subtitle">Add comments and collaborate on document review</p>
        </div>
        
        <div className="flex gap-2 mb-6">
          <input 
            className="lm-input" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Add a comment (@name to mention someone)..." 
            style={{ flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && addComment()}
          />
          <button className="lm-btn primary" onClick={addComment} disabled={busy}>
            {busy ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
        
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="lm-empty-state">
              <div className="lm-empty-title">No Comments</div>
              <p className="lm-empty-description">Add the first comment to start the review discussion</p>
            </div>
          ) : (
            comments.map((c: any) => (
              <div key={c.id} className="p-4 border border-gray-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{c.authorId}</span>
                  <span className="text-sm text-muted">
                    {new Date(c.createdAt).toLocaleString?.() || c.createdAt}
                  </span>
                </div>
                <div>{c.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ExportsPage() {
  const params = useParams();
  const ReactLib = React as any;
  const [matterId, setMatterId] = ReactLib.useState<string>((params as any).matterId || 'M001');
  React.useEffect(() => {
    const mid = (params as any).matterId;
    if (mid && matterId !== mid) setMatterId(mid);
  }, [params]);
  const [status, setStatus] = ReactLib.useState<any>(null);
  const [preset, setPreset] = ReactLib.useState<'Insurer' | 'Client' | 'CoCounsel'>('Insurer');
  const [mode, setMode] = ReactLib.useState<'DRAFT' | 'FINAL'>('DRAFT');
  const [liability, setLiability] = ReactLib.useState('Liability section...');
  const [treatment, setTreatment] = ReactLib.useState('Treatment section...');
  const [damages, setDamages] = ReactLib.useState('Damages section...');
  const [out, setOut] = ReactLib.useState<string | null>(null);
  const [busy, setBusy] = ReactLib.useState(false);

  async function refreshStatus() {
    const s = await fetch('/api/review/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matterId }) }).then(r => r.json());
    setStatus(s.status || null);
  }
  ReactLib.useEffect(() => { refreshStatus(); }, [matterId]);

  async function doExport() {
    setBusy(true); setOut(null);
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'Attorney' },
      body: JSON.stringify({ matterId, sections: { liability, treatment, damages }, status: mode, redact: mode === 'FINAL', preset })
    });
    const j = await res.json().catch(() => ({}));
    if (j?.path) setOut(j.path);
    setBusy(false);
  }

  const finalDisabled = (status?.status !== 'approved');

  return (
    <div>
      <div className="lm-page-header">
        <div className="lm-page-title">
          <h1>Document Export</h1>
          <p className="lm-page-subtitle">Export finalized documents with proper redaction and formatting</p>
        </div>
      </div>
      
      <div className="lm-grid-2">
        <div>
          <div className="lm-card mb-6">
            <div className="lm-card-header">
              <h3 className="lm-card-title">Export Settings</h3>
            </div>
            <div className="lm-form-row mb-4">
            {!params.matterId && (
              <div className="lm-form-group">
                <label className="lm-form-label">Matter ID</label>
                <input className="lm-input" value={matterId} onChange={(e) => setMatterId(e.target.value)} />
              </div>
            )}
              <div className="lm-form-group">
                <div>
                  <span className="text-muted">Approval Status: </span>
                  <span className={`lm-chip ${status?.status === 'approved' ? 'success' : 'warning'}`}>
                    {status?.status || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lm-card mb-6">
            <div className="lm-card-header">
              <h3 className="lm-card-title">Export Configuration</h3>
            </div>
            <div className="lm-form-row mb-4">
              <div className="lm-form-group">
                <label className="lm-form-label">Export Mode</label>
                <select className="lm-select" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                  <option value="DRAFT">Draft Version</option>
                  <option value="FINAL" disabled={finalDisabled}>Final Version (requires approval)</option>
                </select>
                {finalDisabled && (
                  <div className="lm-form-help text-warning">Document must be approved before final export</div>
                )}
              </div>
              <div className="lm-form-group">
                <label className="lm-form-label">Redaction Preset</label>
                <select className="lm-select" value={preset} onChange={(e) => setPreset(e.target.value as any)}>
                  <option value="Insurer">Insurance Company</option>
                  <option value="Client">Client Copy</option>
                  <option value="CoCounsel">Co-Counsel</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="lm-card">
            <div className="lm-card-header">
              <h3 className="lm-card-title">Document Sections</h3>
            </div>
            <div className="space-y-4">
              <div className="lm-form-group">
                <label className="lm-form-label">Liability Section</label>
                <textarea 
                  className="lm-textarea" 
                  value={liability} 
                  onChange={(e) => setLiability(e.target.value)} 
                  placeholder="Enter liability content..."
                  style={{ height: '120px' }}
                />
              </div>
              <div className="lm-form-group">
                <label className="lm-form-label">Treatment Section</label>
                <textarea 
                  className="lm-textarea" 
                  value={treatment} 
                  onChange={(e) => setTreatment(e.target.value)} 
                  placeholder="Enter treatment details..."
                  style={{ height: '120px' }}
                />
              </div>
              <div className="lm-form-group">
                <label className="lm-form-label">Damages Section</label>
                <textarea 
                  className="lm-textarea" 
                  value={damages} 
                  onChange={(e) => setDamages(e.target.value)} 
                  placeholder="Enter damages calculation..."
                  style={{ height: '120px' }}
                />
              </div>
            </div>
            <div className="mt-6">
              <button 
                className="lm-btn primary lg" 
                onClick={doExport} 
                disabled={busy || (mode === 'FINAL' && finalDisabled)}
              >
                {busy ? 'Exporting Document...' : `Export ${mode} Version`}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="lm-card">
            <div className="lm-card-header">
              <h3 className="lm-card-title">Export Result</h3>
            </div>
            {out ? (
              <div className="space-y-4">
                <div className="lm-chip success">Export Successful</div>
                <div>
                  <div className="font-medium mb-2">Exported File:</div>
                  <code className="text-sm">{out}</code>
                </div>
                {mode === 'FINAL' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm text-blue-800">
                      <strong>Note:</strong> A non-redacted INTERNAL copy was also saved for your records.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="lm-empty-state">
                <div className="lm-empty-title">No Export Yet</div>
                <p className="lm-empty-description">Configure your export settings and click Export to generate the document</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<MattersList />} />
          {/* legacy top-level routes still work but encourage using /matters/:id/... */}
          <Route path="/data" element={<DataPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/drafting" element={<DraftingPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/evidence" element={<EvidenceBoardPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/damages" element={<DamagesPage />} />
          <Route path="/exports" element={<Placeholder title="Exports" />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<Placeholder title="Help" />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/exports" element={<ExportsPage />} />

          {/* Matter workspace with sub-tabs */}
          <Route path="/matters/:matterId" element={<MatterLayout />}>
            <Route index element={<Navigate to="data" replace />} />
            <Route path="data" element={<DataPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="drafting" element={<DraftingPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="evidence" element={<EvidenceBoardPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="damages" element={<DamagesPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="exports" element={<ExportsPage />} />
          </Route>
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
