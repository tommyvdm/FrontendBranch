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
            <div className="lm-brand">Legal Mate</div>
            <nav className="lm-topnav">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/cases">Cases</NavLink>
              <NavLink to="/templates">Templates</NavLink>
              <NavLink to="/integrations">Integrations</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              <NavLink to="/help">Help</NavLink>
            </nav>
          </div>
          <input className="lm-input" placeholder="Search matters, documents, drafts" style={{ flex: 1 }} />
          <div className="actions">
            <Link className="lm-link-btn" to="/cases">+ New Case</Link>
          </div>
        </header>
        <div style={{ padding: '16px 24px' }}>{children}</div>
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
      <h1>Cases</h1>
      <div className="lm-card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>New Case</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="lm-input" placeholder="Case ID (e.g., M002)" value={id} onChange={(e) => setId(e.target.value)} />
          <input className="lm-input" placeholder="Case title (e.g., Doe v. Acme)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1 }} />
          <button className="lm-btn primary" onClick={create}>Create</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div className="lm-card" style={{ padding: 0 }}>
          <div style={{ borderBottom: '1px solid var(--lm-border)', padding: 10, fontWeight: 600 }}>Your Cases</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 8 }}>
            {items.map((m) => (
              <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 6px', borderRadius: 6 }}>
                <span>{m.title}</span>
                <Link className="lm-link-btn" to={`/matters/${m.id}/data`}>Open</Link>
              </li>
            ))}
            {items.length === 0 && <li style={{ padding: 8, opacity: 0.7 }}>No cases yet.</li>}
          </ul>
        </div>
        <div>
          <div className="lm-card">Select a case on the left to open its workspace.</div>
        </div>
      </div>
    </div>
  )
}

function MatterLayout() {
  const { matterId } = useParams();
  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0 }}>Matter {matterId}</h1>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Workspace</div>
        </div>
        <div>
          <Link className="lm-btn" to="/matters">Back to Matters</Link>
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
      <div style={{ marginTop: 12 }}>
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
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ border: '1px solid #eee', padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Matter ABC vs XYZ</strong>
            <span>Approved • Trust: 85% citations • No conflicts • Preset: Insurer</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Link to="/drafting">New Draft</Link>
            <Link to="/data">Open</Link>
          </div>
        </div>
        <div style={{ border: '1px solid #eee', padding: 12 }}>
          <strong>Usage metrics</strong>
          <div style={{ marginTop: 6, fontSize: 14 }}>
            {metrics ? (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(metrics, null, 2)}</pre>
            ) : (
              <span>Loading metrics…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return <h1>{title}</h1>
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
      <h1>Data</h1>
      {!params.matterId && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <label>Matter ID</label>
          <input value={matterId} onChange={(e) => setMatterId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
      )}
      {loading && <Loading />}
      <ErrorNotice message={error || ''} />
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          <div>
            <h3>Case Summary</h3>
            <p>{data.caseSummary || 'No case summary yet. Upload documents to generate summaries.'}</p>
            <h3>Documents</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {(data.documents && data.documents.length > 0) ? data.documents.map((d: any) => (
                <div key={d.docId} style={{ border: '1px solid #eee', padding: 8 }}>
                  <strong>{d.docId}</strong>
                  <div style={{ margin: '6px 0' }}>{d.summary}</div>
                  <ul>
                    {d.keyFacts?.map((f: any, i: number) => (
                      <li key={i}>{f.text} <em>({f.source}{f.page ? ` p.${f.page}` : ''})</em></li>
                    ))}
                  </ul>
                </div>
              )) : (
                <div className="lm-card">No documents yet. Use Documents → Upload to add files for OCR and summaries.</div>
              )}
            </div>
          </div>
          <aside style={{ border: '1px solid #eee', padding: 8 }}>
            <h3>Risk Check</h3>
            {trust ? (
              <div>
                <div><strong>Citation coverage:</strong> {(trust.citationCoverage * 100).toFixed(0)}%</div>
                <div><strong>Conflicts:</strong> {trust.conflicts?.length || 0}</div>
                <div><strong>Redaction preset:</strong> {trust.redactionPreset}</div>
                <div><strong>OCR alerts:</strong> {trust.ocrAlerts?.length || 0}</div>
                <div><strong>Missing docs:</strong> {(trust.missingDocuments || []).join(', ') || 'none'}</div>
              </div>
            ) : (<div>Loading trust…</div>)}
          </aside>
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
      <h1>Copilot</h1>
      {!params.matterId && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <label>Matter ID</label>
          <input value={matterId} onChange={(e) => setMatterId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
        <div style={{ border: '1px solid #eee', padding: 8, minHeight: 200 }}>
          {messages.length === 0 && (
            <div className="lm-card" style={{ marginBottom: 8 }}>
              Ask a question about this matter (e.g., “Summarize treatment and bills with citations”).
            </div>
          )}
          {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.role === 'user' ? 'You' : 'Copilot'}:</strong> {m.content}
            {m.citations && (
              <ul>
                {m.citations.map((c: any, j: number) => (
                  <li key={j}>{c.source}{c.page ? ` p.${c.page}` : ''}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        </div>
        <aside style={{ border: '1px solid #eee', padding: 8 }}>
          <h3>RAG Search</h3>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search matter docs…" style={{ flex: 1, padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
            <button onClick={doSearch}>Search</button>
          </div>
          <ul style={{ maxHeight: 240, overflow: 'auto' }}>
            {searchRes.map((it: any, i: number) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{it.source}{it.page ? ` p.${it.page}` : ''}</div>
                <div>{String(it.text || '').slice(0, 240)}…</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this matter…" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        <button onClick={send} disabled={busy}>
          {busy ? 'Sending…' : 'Send'}
        </button>
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
      <h1>Documents</h1>
      {!params.matterId && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <label>Matter ID</label>
          <input value={matterId} onChange={(e) => setMatterId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
        <input type="file" multiple onChange={onSelect} disabled={busy} />
        </div>
      )}
      {params.matterId && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input type="file" multiple onChange={onSelect} disabled={busy} />
        </div>
      )}
      <ErrorNotice message={err || ''} />
      <div style={{ display: 'grid', gap: 8 }}>
        {items.length === 0 && (
          <div className="lm-card">No uploads yet. Select a file to begin. Allowed types: PDF, DOCX, images.</div>
        )}
        {items.map((it, i) => (
          <div key={i} style={{ border: '1px solid #eee', padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{it.name}</strong>
              <span>Status: {it.status}</span>
            </div>
            <div>Type: {it.mime}</div>
            {it.documentId && <div>Document ID: {it.documentId}</div>}
            <div>OCR: scheduled</div>
            <div>Digital text: unknown</div>
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
      <h1>Drafting</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        <div>
          {!params.matterId && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <label>Matter ID</label>
              <input value={matterId} onChange={(e) => setMatterId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
            </div>
          )}
          <ol style={{ listStyle: 'decimal', paddingLeft: 18, marginBottom: 12 }}>
            {steps.map((s, i) => (
              <li key={s} style={{ margin: '6px 0', cursor: 'pointer', fontWeight: step === i ? 700 : 400 }} onClick={() => setStep(i)}>{s}</li>
            ))}
          </ol>
          {renderStep()}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button onClick={() => setStep((s: number) => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
            <button onClick={() => setStep((s: number) => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>Next</button>
          </div>
        </div>
        <div>
          <h3>Live Preview</h3>
          <pre style={{ whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: 12 }}>{preview()}</pre>
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
      <h1>Templates</h1>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h3>New Template</h3>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6, marginBottom: 6 }} />
          <textarea placeholder="Content with {{variables}}" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', height: 160, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={create}>Create</button>
          </div>
        </div>
        <div>
          <h3>Existing Templates</h3>
          <ul>
            {items.map((t: any) => (
              <li key={t.id}>{t.name} <small>updated {new Date(t.updatedAt).toLocaleString?.() || t.updatedAt}</small></li>
            ))}
          </ul>
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
      <h1>Integrations</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label>Org</label>
        <input value={orgId} onChange={(e) => setOrgId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
        <label>Provider</label>
        <select value={provider} onChange={(e) => setProvider(e.target.value as any)}>
          <option value="clio">Clio</option>
          <option value="microsoft">Microsoft 365</option>
          <option value="google">Google Workspace</option>
        </select>
        <button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
        {saved && <span style={{ color: 'green' }}>Saved</span>}
      </div>
      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        {provider === 'clio' && (
          <>
            <input placeholder="Client ID" value={value.clientId || ''} onChange={(e) => setField('clientId', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <input placeholder="Client Secret" value={value.clientSecret || ''} onChange={(e) => setField('clientSecret', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </>
        )}
        {provider === 'microsoft' && (
          <>
            <input placeholder="Tenant ID" value={value.tenantId || ''} onChange={(e) => setField('tenantId', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <input placeholder="Client ID" value={value.clientId || ''} onChange={(e) => setField('clientId', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <input placeholder="Client Secret" value={value.clientSecret || ''} onChange={(e) => setField('clientSecret', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </>
        )}
        {provider === 'google' && (
          <>
            <input placeholder="Client ID" value={value.clientId || ''} onChange={(e) => setField('clientId', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <input placeholder="Client Secret" value={value.clientSecret || ''} onChange={(e) => setField('clientSecret', e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </>
        )}
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
      <h1>Settings</h1>
      <h3>Subscription</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label>Plan</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value as any)}>
          <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <label>Seats</label>
        <input type="number" value={seats} onChange={(e) => setSeats(parseInt(e.target.value || '0', 10))} style={{ width: 100, padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
        <button disabled>Update (stub)</button>
      </div>
      <div style={{ opacity: 0.7 }}>Billing management is a stub for now.</div>
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
      <h1>Evidence Board</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div className="lm-card">
          <h3>Unreviewed</h3>
          <ul>
            {unreviewed.map((f) => (
              <li key={f}>
                {f} <button className="lm-btn" onClick={() => move(unreviewed, setUnreviewed, setRelevant, f)}>Mark relevant</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="lm-card">
          <h3>Relevant</h3>
          <ul>
            {relevant.map((f) => (
              <li key={f}>
                {f} <button className="lm-btn" onClick={() => promoteToExhibit(f)}>Make exhibit</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="lm-card">
          <h3>Exhibits</h3>
          <ul>
            {exhibits.map((e, i) => (
              <li key={i}><strong>Exhibit {e.number}:</strong> {e.name} {e.caption && <em>— {e.caption}</em>}</li>
            ))}
          </ul>
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
      <h1>Timeline</h1>
      <div className="lm-card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="lm-input" placeholder="YYYY-MM-DD" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="lm-input" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="lm-input" placeholder="Source (optional)" value={source} onChange={(e) => setSource(e.target.value)} />
          <button className="lm-btn" onClick={addEvent}>Add</button>
        </div>
      </div>
      <ul>
        {events.sort((a, b) => a.date.localeCompare(b.date)).map((ev, i) => (
          <li key={i}><strong>{ev.date}:</strong> {ev.title} {ev.source && <em>({ev.source})</em>}</li>
        ))}
      </ul>
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
      <h1>Damages</h1>
      <div className="lm-card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
          <input className="lm-input" placeholder="Provider/Service" value={provider} onChange={(e) => setProvider(e.target.value)} />
          <input className="lm-input" placeholder="YYYY-MM-DD" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="lm-input" placeholder="Billed" value={billed} onChange={(e) => setBilled(e.target.value)} />
          <input className="lm-input" placeholder="Paid (optional)" value={paid} onChange={(e) => setPaid(e.target.value)} />
          <button className="lm-btn" onClick={addLine}>Add</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>Provider</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>Date</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #eee' }}>Billed</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #eee' }}>Paid</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td style={{ borderBottom: '1px solid #f2f2f2' }}>{l.provider}</td>
              <td style={{ borderBottom: '1px solid #f2f2f2' }}>{l.date}</td>
              <td style={{ borderBottom: '1px solid #f2f2f2', textAlign: 'right' }}>{l.billed.toFixed(2)}</td>
              <td style={{ borderBottom: '1px solid #f2f2f2', textAlign: 'right' }}>{l.paid != null ? l.paid.toFixed(2) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8 }}>
        <strong>Total medical specials:</strong> ${specials.toFixed(2)}
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
      <h1>Review</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {!params.matterId && (
          <>
            <label>Matter ID</label>
            <input value={matterId} onChange={(e) => setMatterId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
          </>
        )}
        <span>Status: <strong>{status?.status || 'unknown'}</strong></span>
        <button onClick={approve} disabled={busy}>Approve</button>
      </div>
      <h3>Comments</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment (@name to mention)" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
        <button onClick={addComment} disabled={busy}>Add</button>
      </div>
      <ul>
        {comments.map((c: any) => (
          <li key={c.id}><strong>{c.authorId}</strong> [{new Date(c.createdAt).toLocaleString?.() || c.createdAt}]: {c.text}</li>
        ))}
      </ul>
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
      <h1>Export</h1>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            {!params.matterId && (
              <>
                <label>Matter ID</label>
                <input value={matterId} onChange={(e) => setMatterId(e.target.value)} style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} />
              </>
            )}
            <span>Status: <strong>{status?.status || 'unknown'}</strong></span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="DRAFT">DRAFT</option>
              <option value="FINAL" disabled={finalDisabled}>FINAL (requires approval)</option>
            </select>
            <label>Redaction preset</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value as any)}>
              <option value="Insurer">Insurer</option>
              <option value="Client">Client</option>
              <option value="CoCounsel">CoCounsel</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <textarea value={liability} onChange={(e) => setLiability(e.target.value)} placeholder="Liability" style={{ width: '100%', height: 120, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="Treatment" style={{ width: '100%', height: 120, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
            <textarea value={damages} onChange={(e) => setDamages(e.target.value)} placeholder="Damages" style={{ width: '100%', height: 120, padding: 8, border: '1px solid #ddd', borderRadius: 6 }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={doExport} disabled={busy || (mode === 'FINAL' && finalDisabled)}>{busy ? 'Exporting…' : 'Export'}</button>
          </div>
        </div>
        <div>
          <h3>Result</h3>
          {out ? (<div>Saved: {out} {mode === 'FINAL' && <div><em>Note: A non-redacted INTERNAL copy was also saved.</em></div>}</div>) : (<div>No export yet.</div>)}
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
