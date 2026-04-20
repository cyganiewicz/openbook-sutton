// InternalPortal.jsx — Department Head & Town Manager internal views

const { useState, useMemo } = React;

// ── Shared helpers ────────────────────────────────────────────────────────────
function pct(a, b) { return ((b - a) / a) * 100; }

const REQ_STATUS = {
  not_started: { label: 'Not Started', bg: '#f5f5f5', color: '#777', dot: '#aaa' },
  draft:       { label: 'Draft',       bg: '#e8f4fd', color: '#1565c0', dot: '#64b5f6' },
  submitted:   { label: 'Submitted',   bg: '#e8f5e9', color: '#2e7d32', dot: '#66bb6a' },
  under_review:{ label: 'Under Review',bg: '#fff8e1', color: '#e65100', dot: '#ffa726' },
  approved:    { label: 'Approved',    bg: '#e0f7fa', color: '#00695c', dot: '#26c6da' },
};

function StatusPill({ status }) {
  const s = REQ_STATUS[status] || REQ_STATUS.not_started;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 10px 3px 7px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>{title}</h1>
      {sub && <p style={{ margin: 0, color: '#5a7a66', fontSize: 14 }}>{sub}</p>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde8e2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>{children}</div>;
}

const th = { padding: '11px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5a7a66', textAlign: 'left' };
const td = { padding: '13px 14px' };

// ── Dept Head: Dashboard ──────────────────────────────────────────────────────
function DeptDashboard({ deptId, onNav }) {
  const dept = DEPARTMENTS.find(d => d.id === deptId);
  if (!dept) return null;

  const totalRequest = dept.lineItems.reduce((s, li) => s + li.fy27_request, 0);
  const changeVsPrior = pct(dept.fy26_approved, totalRequest);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <SectionHeader title={`${dept.shortName} — FY2027 Budget Cycle`} sub={`Logged in as: ${dept.head}`} />

      {/* Status banner */}
      <div style={{ background: dept.request_status === 'approved' ? '#e0f7fa' : dept.request_status === 'submitted' ? '#e8f5e9' : '#fff8e1', borderRadius: 10, padding: '16px 22px', border: `1px solid ${dept.request_status === 'approved' ? '#b2ebf2' : dept.request_status === 'submitted' ? '#c8e6c9' : '#ffe082'}`, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1b2e22', marginBottom: 2 }}>Budget Request Status</div>
          <StatusPill status={dept.request_status} />
          {dept.tm_note && <div style={{ marginTop: 8, fontSize: 13, color: '#4a6a58' }}><strong>Town Manager note:</strong> {dept.tm_note}</div>}
        </div>
        {dept.request_status !== 'approved' && (
          <button onClick={() => onNav('dept/budget-request')}
            style={{ background: '#1b3a2a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {dept.request_status === 'not_started' || dept.request_status === 'draft' ? 'Start Request →' : 'Edit Request →'}
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="FY2027 Request" value={fmt(totalRequest)} sub="Total submitted" />
        <StatCard label="FY2026 Approved" value={fmt(dept.fy26_approved)} sub="Prior year baseline" />
        <StatCard label="Year-over-Year" value={`${changeVsPrior > 0 ? '+' : ''}${changeVsPrior.toFixed(1)}%`} sub="Change vs. prior year" />
      </div>

      {/* Line items summary */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Budget Request Summary</h3>
          <button onClick={() => onNav('dept/budget-request')} style={{ background: 'none', border: '1px solid #c8ddd4', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#2d6a4f', cursor: 'pointer' }}>Edit →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f2f7f4' }}>
            <th style={{ ...th, paddingLeft: 22 }}>Line Item</th>
            <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
            <th style={{ ...th, textAlign: 'right' }}>FY2027 Request</th>
            <th style={{ ...th, textAlign: 'right' }}>Change</th>
          </tr></thead>
          <tbody>
            {dept.lineItems.map((li, i) => {
              const c = pct(li.fy26_approved, li.fy27_request);
              return (
                <tr key={li.code} style={{ borderBottom: i < dept.lineItems.length - 1 ? '1px solid #eef3f0' : 'none' }}>
                  <td style={{ ...td, paddingLeft: 22 }}>
                    <span style={{ fontSize: 11, color: '#aac4b4', marginRight: 8 }}>{li.code}</span>
                    <span style={{ fontWeight: 500, color: '#2a4a38' }}>{li.name}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#6a8c78' }}>{fmtFull(li.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(li.fy27_request)}</td>
                  <td style={{ ...td, textAlign: 'right', fontSize: 12, fontWeight: 600, color: c > 5 ? '#c0392b' : c > 0 ? '#e67e22' : '#27ae60' }}>
                    {c > 0 ? '+' : ''}{c.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f2f7f4', borderTop: '2px solid #c8ddd4' }}>
              <td style={{ ...td, paddingLeft: 22, fontWeight: 700 }}>Total</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(dept.fy26_approved)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1b3a2a' }}>{fmtFull(totalRequest)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: changeVsPrior > 5 ? '#c0392b' : '#5a7a66' }}>
                {changeVsPrior > 0 ? '+' : ''}{changeVsPrior.toFixed(1)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* Capital requests */}
      <Card>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Capital Project Requests</h3>
          <button onClick={() => onNav('dept/capital-request')} style={{ background: 'none', border: '1px solid #c8ddd4', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#2d6a4f', cursor: 'pointer' }}>+ New Request</button>
        </div>
        <div style={{ padding: '14px 22px' }}>
          {CAPITAL_PROJECTS.filter(p => p.department === deptId).map(proj => (
            <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eef3f0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1b2e22', marginBottom: 3 }}>{proj.name}</div>
                <div style={{ fontSize: 12, color: '#7a9a86' }}>{proj.years.map(y => `${y.year}: ${fmtFull(y.amount)}`).join(' · ')}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1b2e22' }}>{fmtFull(proj.total)}</div>
                <StatusPill status={proj.status} />
              </div>
            </div>
          ))}
          {CAPITAL_PROJECTS.filter(p => p.department === deptId).length === 0 && (
            <div style={{ color: '#8aaa96', fontSize: 13, padding: '12px 0' }}>No capital requests submitted for this department.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Dept Head: Budget Request Form ────────────────────────────────────────────
function BudgetRequestForm({ deptId, onNav }) {
  const dept = DEPARTMENTS.find(d => d.id === deptId);
  if (!dept) return null;

  const [lineItems, setLineItems] = useState(
    dept.lineItems.map(li => ({ ...li, fy27_request: li.fy27_request, justification: '' }))
  );
  const [narrative, setNarrative] = useState(dept.request_note || '');
  const [saved, setSaved] = useState(false);

  const totalRequest = lineItems.reduce((s, li) => s + (parseInt(li.fy27_request) || 0), 0);
  const totalPrior = dept.fy26_approved;
  const change = pct(totalPrior, totalRequest);

  function updateItem(i, field, val) {
    const updated = [...lineItems];
    updated[i] = { ...updated[i], [field]: field === 'fy27_request' ? (parseInt(val) || 0) : val };
    setLineItems(updated);
    setSaved(false);
  }

  function handleSave(submit = false) {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <button onClick={() => onNav('dept/dashboard')} style={{ background: 'none', border: 'none', color: '#5a7a66', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back to Dashboard</button>
      <SectionHeader title={`FY2027 Budget Request — ${dept.shortName}`} sub="Complete all line items and provide justification narrative before submitting." />

      {saved && (
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 8, padding: '12px 18px', marginBottom: 20, color: '#2e7d32', fontWeight: 600, fontSize: 13 }}>
          Budget request saved successfully.
        </div>
      )}

      {/* Line Items */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Line Item Detail</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a9a86' }}>Enter your FY2027 requested amounts. Amounts exceeding 10% over prior year require additional justification.</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f2f7f4' }}>
              <th style={{ ...th, paddingLeft: 22 }}>Line Item</th>
              <th style={{ ...th, textAlign: 'right' }}>FY2025 Actual</th>
              <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
              <th style={{ ...th, textAlign: 'right', color: '#1b3a2a' }}>FY2027 Request</th>
              <th style={{ ...th, textAlign: 'right' }}>Chg</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, i) => {
              const c = pct(li.fy26_approved, li.fy27_request);
              const high = c > 10;
              return (
                <tr key={li.code} style={{ borderBottom: '1px solid #eef3f0', background: high ? '#fffdf0' : 'transparent' }}>
                  <td style={{ ...td, paddingLeft: 22 }}>
                    <span style={{ fontSize: 11, color: '#aac4b4', marginRight: 8 }}>{li.code}</span>
                    <span style={{ fontWeight: 500, color: '#2a4a38' }}>{li.name}</span>
                    {high && <span style={{ marginLeft: 8, fontSize: 10, background: '#fff3cd', color: '#856404', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>HIGH</span>}
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#8aaa96', fontSize: 12 }}>{fmtFull(li.fy25_actual)}</td>
                  <td style={{ ...td, textAlign: 'right', color: '#6a8c78' }}>{fmtFull(li.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <input
                      type="number"
                      value={li.fy27_request}
                      onChange={e => updateItem(i, 'fy27_request', e.target.value)}
                      style={{ width: 110, padding: '6px 10px', borderRadius: 6, border: `1.5px solid ${high ? '#ffc107' : '#c8ddd4'}`, fontSize: 13, textAlign: 'right', fontFamily: 'Figtree, sans-serif', fontWeight: 600, outline: 'none' }}
                    />
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontSize: 12, fontWeight: 600, color: c > 10 ? '#c0392b' : c > 0 ? '#e67e22' : '#27ae60' }}>
                    {c > 0 ? '+' : ''}{c.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#1b3a2a', color: '#fff' }}>
              <td style={{ ...td, paddingLeft: 22, fontWeight: 700 }} colSpan={2}>Total Request</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(totalPrior)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{fmtFull(totalRequest)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: change > 10 ? '#ffb3b3' : '#c9a227' }}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* Narrative */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Budget Narrative / Justification</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a9a86' }}>Explain significant changes from prior year and describe department priorities and goals for FY2027.</p>
        </div>
        <div style={{ padding: 22 }}>
          <textarea value={narrative} onChange={e => { setNarrative(e.target.value); setSaved(false); }}
            rows={6} placeholder="Describe the rationale for your FY2027 budget request, key initiatives, staffing changes, and any other relevant context..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #c8ddd4', fontSize: 13, fontFamily: 'Figtree, sans-serif', lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={() => handleSave(false)} style={{ background: '#fff', border: '1.5px solid #c8ddd4', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#2d6a4f', cursor: 'pointer' }}>Save Draft</button>
        <button onClick={() => { handleSave(true); onNav('dept/dashboard'); }}
          style={{ background: '#1b3a2a', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          Submit to Town Manager →
        </button>
      </div>
    </div>
  );
}

// ── Dept Head: Capital Request Form ──────────────────────────────────────────
function CapitalRequestForm({ deptId, onNav }) {
  const dept = DEPARTMENTS.find(d => d.id === deptId);
  const [form, setForm] = useState({ name: '', category: 'Equipment', description: '', priority: 'medium', funding_source: 'General Fund', fy27: '', fy28: '', fy29: '' });
  const [submitted, setSubmitted] = useState(false);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  if (submitted) return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>
      <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '40px 32px', textAlign: 'center', border: '1px solid #c8e6c9' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1b3a2a', fontFamily: "'Source Serif 4', serif" }}>Capital Request Submitted</h2>
        <p style={{ margin: '0 0 24px', color: '#4a6a58', fontSize: 14 }}>Your capital project request has been submitted for Town Manager review.</p>
        <button onClick={() => onNav('dept/dashboard')} style={{ background: '#1b3a2a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
    </div>
  );

  const inputStyle = { width: '100%', padding: '9px 13px', borderRadius: 7, border: '1.5px solid #c8ddd4', fontSize: 13, fontFamily: 'Figtree, sans-serif', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#3a5444', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>
      <button onClick={() => onNav('dept/dashboard')} style={{ background: 'none', border: 'none', color: '#5a7a66', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back to Dashboard</button>
      <SectionHeader title="New Capital Project Request" sub={`Department: ${dept?.name} — FY2027 Capital Improvement Plan`} />

      <Card>
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Project Name *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Ladder Truck Replacement" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                {['Equipment', 'Infrastructure', 'Buildings & Facilities', 'Technology', 'Parks & Recreation', 'Planning & Studies'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority *</label>
              <select value={form.priority} onChange={e => setField('priority', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                <option value="high">High — Safety / Legal / Compliance</option>
                <option value="medium">Medium — Operational Need</option>
                <option value="low">Low — Desirable Improvement</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Project Description *</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)}
              rows={4} placeholder="Describe the project scope, current condition/problem being addressed, and expected outcome..."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div>
            <label style={labelStyle}>Proposed Funding Source</label>
            <select value={form.funding_source} onChange={e => setField('funding_source', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
              {['General Fund', 'Borrowing', 'Free Cash / Stabilization', 'Enterprise Fund', 'Federal/State Grant', 'CPA Funds', 'Borrowing / Federal Aid (80%)'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estimated Cost by Year</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {['fy27', 'fy28', 'fy29'].map((yr, i) => (
                <div key={yr}>
                  <div style={{ fontSize: 11, color: '#7a9a86', marginBottom: 5, fontWeight: 600 }}>FY{2027 + i}</div>
                  <input type="number" value={form[yr]} onChange={e => setField(yr, e.target.value)}
                    placeholder="$0" style={inputStyle} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
            <button onClick={() => onNav('dept/dashboard')} style={{ background: '#fff', border: '1.5px solid #c8ddd4', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => setSubmitted(true)} style={{ background: '#1b3a2a', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
              Submit Request →
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Town Manager: Dashboard ───────────────────────────────────────────────────
function TMDashboard({ onNav }) {
  const stats = getSubmissionStats(DEPARTMENTS);
  const totalRequested = DEPARTMENTS.reduce((s, d) => s + d.fy27_request, 0);
  const totalPrior = DEPARTMENTS.reduce((s, d) => s + d.fy26_approved, 0);
  const budgetGap = totalRequested - totalPrior;

  const catTotals = {};
  DEPARTMENTS.forEach(d => {
    catTotals[d.category] = (catTotals[d.category] || 0) + d.fy27_request;
  });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      <SectionHeader title="Town Manager — Budget Dashboard" sub="FY2027 Budget Cycle · All Departments" />

      {/* Progress bar */}
      <Card style={{ padding: '18px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1b2e22' }}>Submission Progress</div>
          <div style={{ fontSize: 12, color: '#5a7a66' }}>{stats.submitted + stats.under_review + stats.approved} of {DEPARTMENTS.length} departments</div>
        </div>
        <div style={{ background: '#eef3f0', borderRadius: 8, height: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((stats.submitted + stats.under_review + stats.approved) / DEPARTMENTS.length) * 100}%`, background: '#2d6a4f', borderRadius: 8, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {[
            { label: 'Not Started', count: stats.not_started, color: '#aaa' },
            { label: 'Submitted', count: stats.submitted, color: '#2d6a4f' },
            { label: 'Under Review', count: stats.under_review, color: '#e67e22' },
            { label: 'Approved', count: stats.approved, color: '#16a085' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ color: '#5a7a66' }}>{s.label}:</span>
              <span style={{ fontWeight: 700, color: '#1b2e22' }}>{s.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Requested" value={fmt(totalRequested)} sub="All departments FY2027" delta={pct(totalPrior, totalRequested)} accent />
        <StatCard label="Prior Year Total" value={fmt(totalPrior)} sub="FY2026 Approved" />
        <StatCard label="Budget Gap" value={`+${fmt(budgetGap)}`} sub="Requested above prior year" />
        <StatCard label="Capital Requested" value={fmt(CAPITAL_PROJECTS.filter(p => p.years[0]?.year === 'FY2027').reduce((s, p) => s + p.years[0].amount, 0))} sub="FY2027 capital projects" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>FY2026 Approved vs. FY2027 Requested</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#7a9a86' }}>Top 8 departments by request</p>
          <BarChart
            labels={[...DEPARTMENTS].sort((a,b) => b.fy27_request - a.fy27_request).slice(0,8).map(d => d.shortName)}
            datasets={[
              { label: 'FY2026 Approved', data: [...DEPARTMENTS].sort((a,b) => b.fy27_request - a.fy27_request).slice(0,8).map(d => d.fy26_approved), backgroundColor: 'rgba(64,145,108,0.35)', borderColor: '#40916c', borderWidth: 1.5, borderRadius: 4 },
              { label: 'FY2027 Request', data: [...DEPARTMENTS].sort((a,b) => b.fy27_request - a.fy27_request).slice(0,8).map(d => d.fy27_request), backgroundColor: '#1b3a2a', borderColor: '#1b3a2a', borderWidth: 1.5, borderRadius: 4 },
            ]}
            height={230}
          />
        </Card>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Budget by Category</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#7a9a86' }}>FY2027 proposed — all departments</p>
          <DonutChart
            labels={Object.keys(catTotals).map(k => CATEGORIES[k]?.label)}
            values={Object.values(catTotals)}
            colors={Object.keys(catTotals).map(k => CATEGORY_COLORS[k])}
            centerLabel={fmt(totalRequested)} centerSub="Total" height={230}
          />
        </Card>
      </div>

      {/* All depts table */}
      <Card>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>All Department Requests</h3>
          <button onClick={() => onNav('tm/budget-review')} style={{ background: '#1b3a2a', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Open Budget Builder →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f2f7f4' }}>
            <th style={{ ...th, paddingLeft: 22 }}>Department</th>
            <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
            <th style={{ ...th, textAlign: 'right' }}>FY2027 Request</th>
            <th style={{ ...th, textAlign: 'right' }}>Change</th>
            <th style={th}>Status</th>
            <th style={th}>TM Note</th>
            <th style={th}></th>
          </tr></thead>
          <tbody>
            {DEPARTMENTS.map((dept, i) => {
              const c = pct(dept.fy26_approved, dept.fy27_request);
              return (
                <tr key={dept.id} style={{ borderBottom: i < DEPARTMENTS.length - 1 ? '1px solid #eef3f0' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fbf9'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...td, paddingLeft: 22 }}>
                    <div style={{ fontWeight: 600, color: '#1b2e22' }}>{dept.name}</div>
                    <div style={{ fontSize: 11, color: '#8aaa96' }}>{CATEGORIES[dept.category]?.label}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#6a8c78' }}>{fmtFull(dept.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(dept.fy27_request)}</td>
                  <td style={{ ...td, textAlign: 'right', fontSize: 12, fontWeight: 600, color: c > 8 ? '#c0392b' : c > 4 ? '#e67e22' : '#27ae60' }}>
                    {c > 0 ? '+' : ''}{c.toFixed(1)}%
                  </td>
                  <td style={td}><StatusPill status={dept.request_status} /></td>
                  <td style={{ ...td, fontSize: 12, color: '#5a7a66', maxWidth: 180 }}>
                    {dept.tm_note ? <span style={{ fontStyle: 'italic' }}>{dept.tm_note.slice(0, 60)}{dept.tm_note.length > 60 ? '…' : ''}</span> : <span style={{ color: '#c8ddd4' }}>—</span>}
                  </td>
                  <td style={td}>
                    <button onClick={() => onNav('tm/department', dept.id)} style={{ fontSize: 12, fontWeight: 600, color: '#2d6a4f', background: '#e8f5ee', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>Review →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Town Manager: Department Review ──────────────────────────────────────────
function TMDeptReview({ deptId, onNav }) {
  const [depts, setDepts] = useState(DEPARTMENTS.map(d => ({ ...d, lineItems: d.lineItems.map(li => ({ ...li })) })));
  const dept = depts.find(d => d.id === deptId) || depts[0];
  const [tmNote, setTmNote] = useState(dept.tm_note || '');
  const [status, setStatus] = useState(dept.request_status);
  const [saved, setSaved] = useState(false);

  function updateRecommended(liIdx, val) {
    setDepts(prev => prev.map(d => d.id === deptId ? {
      ...d, lineItems: d.lineItems.map((li, i) => i === liIdx ? { ...li, fy27_recommended: parseInt(val) || 0 } : li)
    } : d));
    setSaved(false);
  }

  const totalRequest = dept.lineItems.reduce((s, li) => s + li.fy27_request, 0);
  const totalRecommended = dept.lineItems.reduce((s, li) => s + (li.fy27_recommended ?? li.fy27_request), 0);
  const savings = totalRequest - totalRecommended;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <button onClick={() => onNav('tm/dashboard')} style={{ background: 'none', border: 'none', color: '#5a7a66', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 }}>← Back to TM Dashboard</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>{dept.name}</h1>
          <p style={{ margin: 0, color: '#5a7a66', fontSize: 14 }}>Budget review — FY2027</p>
        </div>
        <StatusPill status={status} />
      </div>

      {/* Comparison summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="FY2026 Approved" value={fmtFull(dept.fy26_approved)} sub="Baseline" />
        <StatCard label="Dept Request" value={fmtFull(totalRequest)} sub={`+${pct(dept.fy26_approved, totalRequest).toFixed(1)}% vs prior`} />
        <StatCard label="TM Recommendation" value={fmtFull(totalRecommended)} sub={savings > 0 ? `${fmtFull(savings)} below request` : 'Matches request'} accent={savings > 0} />
        <StatCard label="vs. Prior Year" value={`${pct(dept.fy26_approved, totalRecommended) > 0 ? '+' : ''}${pct(dept.fy26_approved, totalRecommended).toFixed(1)}%`} sub="Recommended change" />
      </div>

      {saved && <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#2e7d32', fontWeight: 600, fontSize: 13 }}>Changes saved.</div>}

      {/* Department narrative */}
      {dept.request_note && (
        <Card style={{ padding: '18px 22px', marginBottom: 20, background: '#fffdf5', border: '1px solid #e8d88a' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5a4000', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Department Narrative</div>
          <p style={{ margin: 0, fontSize: 13, color: '#5a4a10', lineHeight: 1.7 }}>{dept.request_note}</p>
        </Card>
      )}

      {/* Line item review table */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Line Item Review</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a9a86' }}>Enter TM recommendation for each line item. Leave blank to accept department request.</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f2f7f4' }}>
              <th style={{ ...th, paddingLeft: 22 }}>Line Item</th>
              <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
              <th style={{ ...th, textAlign: 'right' }}>Dept Request</th>
              <th style={{ ...th, textAlign: 'right', color: '#1b3a2a' }}>TM Recommendation</th>
              <th style={{ ...th, textAlign: 'right' }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {dept.lineItems.map((li, i) => {
              const rec = li.fy27_recommended ?? li.fy27_request;
              const variance = rec - li.fy27_request;
              return (
                <tr key={li.code} style={{ borderBottom: i < dept.lineItems.length - 1 ? '1px solid #eef3f0' : 'none', background: variance < 0 ? '#fef9f0' : 'transparent' }}>
                  <td style={{ ...td, paddingLeft: 22 }}>
                    <span style={{ fontSize: 11, color: '#aac4b4', marginRight: 8 }}>{li.code}</span>
                    <span style={{ fontWeight: 500 }}>{li.name}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#8aaa96' }}>{fmtFull(li.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmtFull(li.fy27_request)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <input type="number" value={li.fy27_recommended ?? li.fy27_request}
                      onChange={e => updateRecommended(i, e.target.value)}
                      style={{ width: 120, padding: '6px 10px', borderRadius: 6, border: '1.5px solid #2d6a4f', fontSize: 13, textAlign: 'right', fontFamily: 'Figtree, sans-serif', fontWeight: 600, outline: 'none', background: '#f0faf4' }} />
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontSize: 12, fontWeight: 600, color: variance < 0 ? '#c0392b' : variance > 0 ? '#27ae60' : '#aaa' }}>
                    {variance === 0 ? '—' : `${variance > 0 ? '+' : ''}${fmtFull(variance)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#1b3a2a', color: '#fff' }}>
              <td style={{ ...td, paddingLeft: 22, fontWeight: 700 }}>Total</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(dept.fy26_approved)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(totalRequest)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{fmtFull(totalRecommended)}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: savings > 0 ? '#ffd700' : '#aaa' }}>
                {savings > 0 ? `-${fmtFull(savings)}` : savings < 0 ? `+${fmtFull(Math.abs(savings))}` : '—'}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* TM Note & Status */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Town Manager Notes & Status</h3>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea value={tmNote} onChange={e => { setTmNote(e.target.value); setSaved(false); }} rows={3}
            placeholder="Add internal notes, questions for department head, or budget rationale..."
            style={{ width: '100%', padding: '10px 13px', borderRadius: 7, border: '1.5px solid #c8ddd4', fontSize: 13, fontFamily: 'Figtree, sans-serif', lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3a5444' }}>Set Status:</span>
            {['under_review', 'approved'].map(s => (
              <button key={s} onClick={() => setStatus(s)}
                style={{ padding: '6px 14px', borderRadius: 6, border: `2px solid ${status === s ? '#2d6a4f' : '#c8ddd4'}`, background: status === s ? '#e8f5ee' : '#fff', fontSize: 12, fontWeight: 600, color: status === s ? '#1b3a2a' : '#5a7a66', cursor: 'pointer' }}>
                {REQ_STATUS[s]?.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={() => onNav('tm/dashboard')} style={{ background: '#fff', border: '1.5px solid #c8ddd4', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => { setSaved(true); setTimeout(() => onNav('tm/dashboard'), 1200); }}
          style={{ background: '#1b3a2a', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          Save & Return →
        </button>
      </div>
    </div>
  );
}

// ── Town Manager: Capital Review ──────────────────────────────────────────────
function TMCapitalReview({ onNav }) {
  const [statuses, setStatuses] = useState({});
  const [notes, setNotes] = useState({});

  const fy27Total = CAPITAL_PROJECTS.filter(p => p.years[0]?.year === 'FY2027').reduce((s, p) => s + p.years[0].amount, 0);
  const overall5yr = CAPITAL_PROJECTS.reduce((s, p) => s + p.total, 0);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <SectionHeader title="Capital Plan Review" sub="FY2027–FY2031 — Review and recommend capital projects" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="FY2027 Capital" value={fmt(fy27Total)} sub="Year 1 total investment" accent />
        <StatCard label="5-Year Total" value={fmt(overall5yr)} sub="FY2027–FY2031" />
        <StatCard label="Projects" value={CAPITAL_PROJECTS.length} sub={`${CAPITAL_PROJECTS.filter(p=>p.status==='recommended').length} recommended, ${CAPITAL_PROJECTS.filter(p=>p.status==='planned').length} planned`} />
      </div>

      <Card>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>All Capital Projects</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f2f7f4' }}>
            <th style={{ ...th, paddingLeft: 22 }}>Project</th>
            <th style={th}>Dept</th>
            <th style={{ ...th, textAlign: 'right' }}>Total</th>
            <th style={th}>Years</th>
            <th style={th}>Status</th>
            <th style={th}>TM Note</th>
          </tr></thead>
          <tbody>
            {CAPITAL_PROJECTS.map((proj, i) => {
              const dept = DEPARTMENTS.find(d => d.id === proj.department);
              return (
                <tr key={proj.id} style={{ borderBottom: i < CAPITAL_PROJECTS.length - 1 ? '1px solid #eef3f0' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fbf9'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...td, paddingLeft: 22 }}>
                    <div style={{ fontWeight: 600, color: '#1b2e22' }}>{proj.name}</div>
                    <div style={{ fontSize: 11, color: '#8aaa96' }}>{proj.category} · {proj.funding_source}</div>
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#5a7a66' }}>{dept?.shortName || proj.department}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(proj.total)}</td>
                  <td style={{ ...td, fontSize: 12, color: '#5a7a66' }}>{proj.years.map(y => y.year).join(', ')}</td>
                  <td style={td}>
                    <select value={statuses[proj.id] || proj.status}
                      onChange={e => setStatuses(prev => ({ ...prev, [proj.id]: e.target.value }))}
                      style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #c8ddd4', fontSize: 12, fontFamily: 'Figtree, sans-serif', background: '#fff' }}>
                      <option value="recommended">Recommended</option>
                      <option value="planned">Planned</option>
                      <option value="under_review">Under Review</option>
                      <option value="deferred">Deferred</option>
                      <option value="funded">Funded</option>
                    </select>
                  </td>
                  <td style={td}>
                    <input value={notes[proj.id] || ''} onChange={e => setNotes(prev => ({ ...prev, [proj.id]: e.target.value }))}
                      placeholder="Add note..."
                      style={{ width: 160, padding: '5px 9px', borderRadius: 5, border: '1px solid #c8ddd4', fontSize: 12, fontFamily: 'Figtree, sans-serif' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Town Manager: Publish ─────────────────────────────────────────────────────
function TMPublish({ onNav }) {
  const [published, setPublished] = useState(false);
  const approved = DEPARTMENTS.filter(d => d.request_status === 'approved').length;
  const total = DEPARTMENTS.length;
  const ready = approved >= total * 0.8;

  if (published) return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
      <div style={{ background: '#e8f5e9', borderRadius: 14, padding: '48px 40px', textAlign: 'center', border: '1px solid #c8e6c9' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#2d6a4f' }}>✓</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 700, color: '#1b3a2a', fontFamily: "'Source Serif 4', serif" }}>FY2027 Budget Published</h2>
        <p style={{ margin: '0 0 28px', color: '#4a6a58', fontSize: 14, lineHeight: 1.6 }}>The FY2027 Town of Sutton Proposed Budget is now live on the public portal. Residents can view all department budgets, narratives, and the capital plan.</p>
        <button onClick={() => onNav('public/dashboard')} style={{ background: '#1b3a2a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>View Public Portal →</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>
      <SectionHeader title="Publish Budget" sub="Review and publish the FY2027 proposed budget to the public portal" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Departments Approved" value={`${approved} / ${total}`} sub="Required before publishing" />
        <StatCard label="Total Budget" value={fmt(DEPARTMENTS.reduce((s,d) => s+d.fy27_request, 0))} sub="FY2027 General Fund" />
        <StatCard label="Capital Projects" value={CAPITAL_PROJECTS.length} sub="In 5-year plan" />
      </div>

      {!ready && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#856404' }}>
          <strong>Heads up:</strong> {total - approved} departments still have pending requests. You may publish now or complete all reviews first.
        </div>
      )}

      <Card style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #eef3f0' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Publication Checklist</h3>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'All department requests reviewed', done: approved >= total - 2 },
            { label: 'Capital plan projects finalized', done: true },
            { label: 'Revenue projections confirmed', done: true },
            { label: 'Budget narrative reviewed', done: approved > 0 },
            { label: 'Enterprise fund budgets approved', done: true },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? '#2d6a4f' : '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: item.done ? '#1b2e22' : '#888', fontWeight: item.done ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={() => onNav('tm/dashboard')} style={{ background: '#fff', border: '1.5px solid #c8ddd4', borderRadius: 8, padding: '11px 24px', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer' }}>Back</button>
        <button onClick={() => setPublished(true)} style={{ background: '#1b3a2a', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
          Publish to Public Portal →
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  DeptDashboard, BudgetRequestForm, CapitalRequestForm,
  TMDashboard, TMDeptReview, TMCapitalReview, TMPublish,
  StatusPill
});
