// PublicPortal.jsx — Public-facing views for OpenBook

const { useState, useMemo } = React;

// ── Helpers ──────────────────────────────────────────────────────────────────
function pctChange(a, b) { return ((b - a) / a) * 100; }

const STATUS_BADGE = {
  recommended: { label: 'Recommended', bg: '#e8f5e9', color: '#2e7d32' },
  funded:      { label: 'Funded',       bg: '#e3f2fd', color: '#1565c0' },
  planned:     { label: 'Planned',      bg: '#fff8e1', color: '#e65100' },
  under_review:{ label: 'Under Review', bg: '#fce4ec', color: '#880e4f' },
  deferred:    { label: 'Deferred',     bg: '#f3e5f5', color: '#6a1b9a' },
};

function Badge({ status }) {
  const s = STATUS_BADGE[status] || { label: status, bg: '#f5f5f5', color: '#555' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase' }}>
      {s.label}
    </span>
  );
}

// ── Public Dashboard ──────────────────────────────────────────────────────────
function PublicDashboard({ onNav }) {
  const total27 = TOWN.totalBudget;
  const total26 = TOWN.priorBudget;
  const catTotals = getByCategoryTotals(DEPARTMENTS);

  const catLabels = Object.keys(catTotals).map(k => CATEGORIES[k]?.label || k);
  const catValues = Object.values(catTotals);
  const catColors = Object.keys(catTotals).map(k => CATEGORY_COLORS[k]);

  const topDepts = [...DEPARTMENTS]
    .sort((a, b) => b.fy27_request - a.fy27_request)
    .slice(0, 8);

  const revLabels = REVENUE.fy27.map(r => r.source);
  const revValues = REVENUE.fy27.map(r => r.amount);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5a7a66', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
          Town of Sutton, Massachusetts
        </div>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif", lineHeight: 1.2 }}>
          FY2027 Operating Budget Overview
        </h1>
        <p style={{ margin: '10px 0 0', color: '#5a7a66', fontSize: 15, maxWidth: 680, lineHeight: 1.6 }}>
          The Town of Sutton's Proposed FY2027 General Fund budget is presented for public review. 
          The fiscal year runs July 1, 2026 through June 30, 2027.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        <StatCard label="Proposed Budget" value={fmt(total27)} sub="General Fund" delta={pctChange(total26, total27)} accent />
        <StatCard label="Prior Year Budget" value={fmt(total26)} sub="FY2026 Approved" />
        <StatCard label="Tax Rate" value={`$${TOWN.taxRate.toFixed(2)}`} sub="per $1,000 assessed value" delta={pctChange(TOWN.priorTaxRate, TOWN.taxRate)} />
        <StatCard label="Enterprise Funds" value={fmt(ENTERPRISE_FUNDS.reduce((s, f) => s + f.fy27_request, 0))} sub="Water & Sewer" />
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Budget by Category */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #dde8e2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1b2e22' }}>Budget by Category</h3>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: '#7a9a86' }}>FY2027 Proposed General Fund — {fmt(total27)} total</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
            <DonutChart labels={catLabels} values={catValues} colors={catColors} centerLabel={fmt(total27)} centerSub="Total Budget" height={220} />
            <ChartLegend labels={catLabels} colors={catColors} values={catValues} total={total27} />
          </div>
        </div>

        {/* Revenue Sources */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #dde8e2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1b2e22' }}>Revenue Sources</h3>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: '#7a9a86' }}>How the FY2027 budget is funded</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
            <DonutChart labels={revLabels} values={revValues} colors={['#2d6a4f','#40916c','#c9a227','#74c69d']} centerLabel="4 Sources" centerSub="of Revenue" height={220} />
            <ChartLegend labels={revLabels} colors={['#2d6a4f','#40916c','#c9a227','#74c69d']} values={revValues} total={total27} />
          </div>
        </div>
      </div>

      {/* Top Departments Bar + Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #dde8e2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1b2e22' }}>Top Departments — FY2027 vs FY2026</h3>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: '#7a9a86' }}>Proposed vs. prior year approved</p>
          <BarChart
            labels={topDepts.map(d => d.shortName)}
            datasets={[
              { label: 'FY2026 Approved', data: topDepts.map(d => d.fy26_approved), backgroundColor: 'rgba(64,145,108,0.35)', borderColor: '#40916c', borderWidth: 1.5, borderRadius: 4 },
              { label: 'FY2027 Proposed', data: topDepts.map(d => d.fy27_request), backgroundColor: '#2d6a4f', borderColor: '#1b4332', borderWidth: 1.5, borderRadius: 4 },
            ]}
            height={250}
          />
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #dde8e2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1b2e22' }}>5-Year Budget Trend</h3>
          <p style={{ margin: '0 0 18px', fontSize: 12, color: '#7a9a86' }}>FY2023–FY2027 General Fund</p>
          <LineChart
            labels={BUDGET_HISTORY.map(h => h.year)}
            datasets={[{
              label: 'Total Budget',
              data: BUDGET_HISTORY.map(h => h.amount),
              borderColor: '#2d6a4f',
              backgroundColor: 'rgba(45,106,79,0.12)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: BUDGET_HISTORY.map(h => h.proposed ? '#c9a227' : '#2d6a4f'),
              pointRadius: 5,
              pointHoverRadius: 7,
            }]}
            height={250}
          />
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { label: 'View All Departments', sub: '16 departments & divisions', action: () => onNav('public/departments') },
          { label: 'Capital Plan', sub: '15 projects, FY2027–FY2031', action: () => onNav('public/capital') },
          { label: 'Enterprise Funds', sub: 'Water & Sewer operations', action: () => onNav('public/enterprise') },
        ].map(link => (
          <button key={link.label} onClick={link.action} style={{ background: '#f2f7f4', border: '1px solid #dde8e2', borderRadius: 10, padding: '20px 22px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e6f0eb'}
            onMouseLeave={e => e.currentTarget.style.background = '#f2f7f4'}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1b3a2a', marginBottom: 4 }}>{link.label} →</div>
            <div style={{ fontSize: 12, color: '#6a8c78' }}>{link.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Department List ───────────────────────────────────────────────────────────
function DepartmentList({ onNav }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = useMemo(() => DEPARTMENTS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || d.category === catFilter;
    return matchSearch && matchCat;
  }), [search, catFilter]);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>Department Budgets</h1>
        <p style={{ margin: 0, color: '#5a7a66', fontSize: 14 }}>FY2027 proposed operating budgets for all town departments</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..."
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 7, border: '1px solid #c8ddd4', fontSize: 13, outline: 'none', fontFamily: 'Figtree, sans-serif' }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 7, border: '1px solid #c8ddd4', fontSize: 13, background: '#fff', fontFamily: 'Figtree, sans-serif', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde8e2', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f2f7f4', borderBottom: '1px solid #dde8e2' }}>
              <th style={th}>Department</th>
              <th style={{ ...th, textAlign: 'right' }}>FY2025 Actual</th>
              <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
              <th style={{ ...th, textAlign: 'right' }}>FY2027 Proposed</th>
              <th style={{ ...th, textAlign: 'right' }}>Change</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept, i) => {
              const chg = pctChange(dept.fy26_approved, dept.fy27_request);
              return (
                <tr key={dept.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #eef3f0' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fbf9'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...td, paddingLeft: 20 }}>
                    <div style={{ fontWeight: 600, color: '#1b2e22' }}>{dept.name}</div>
                    <div style={{ fontSize: 11, color: '#8aaa96', marginTop: 1 }}>{CATEGORIES[dept.category]?.label}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: '#5a7a66' }}>{fmtFull(dept.fy25_actual)}</td>
                  <td style={{ ...td, textAlign: 'right', color: '#5a7a66' }}>{fmtFull(dept.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1b2e22' }}>{fmtFull(dept.fy27_request)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: chg > 5 ? '#c0392b' : chg > 0 ? '#e67e22' : '#27ae60' }}>
                      {chg > 0 ? '+' : ''}{chg.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ ...td, paddingRight: 20 }}>
                    <button onClick={() => onNav('public/department', dept.id)}
                      style={{ fontSize: 12, fontWeight: 600, color: '#2d6a4f', background: '#e8f5ee', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#1b3a2a', color: '#fff' }}>
              <td style={{ ...td, paddingLeft: 20, fontWeight: 700, fontSize: 13 }}>TOTAL — General Fund</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(DEPARTMENTS.reduce((s, d) => s + d.fy25_actual, 0))}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(DEPARTMENTS.reduce((s, d) => s + d.fy26_approved, 0))}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(DEPARTMENTS.reduce((s, d) => s + d.fy27_request, 0))}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>
                {pctChange(DEPARTMENTS.reduce((s, d) => s + d.fy26_approved, 0), DEPARTMENTS.reduce((s, d) => s + d.fy27_request, 0)).toFixed(1)}%
              </td>
              <td style={td}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const th = { padding: '12px 14px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5a7a66', textAlign: 'left' };
const td = { padding: '13px 14px' };

// ── Department Detail ─────────────────────────────────────────────────────────
function DepartmentDetail({ deptId, onNav }) {
  const dept = DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
  const chg = pctChange(dept.fy26_approved, dept.fy27_request);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      {/* Breadcrumb */}
      <button onClick={() => onNav('public/departments')} style={{ background: 'none', border: 'none', color: '#5a7a66', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← All Departments
      </button>

      {/* Header Card */}
      <div style={{ background: '#1b3a2a', borderRadius: 12, padding: '28px 32px', marginBottom: 24, color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
          {CATEGORIES[dept.category]?.label}
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>{dept.name}</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>{dept.head}</p>
        <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
          <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>FY2027 PROPOSED</div><div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>{fmtFull(dept.fy27_request)}</div></div>
          <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>FY2026 APPROVED</div><div style={{ fontSize: 22, fontWeight: 700 }}>{fmtFull(dept.fy26_approved)}</div></div>
          <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>YEAR CHANGE</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: chg > 5 ? '#ffb3b3' : '#c9a227' }}>{chg > 0 ? '+' : ''}{chg.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mission */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #dde8e2' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#1b2e22', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission</h3>
            <p style={{ margin: 0, color: '#3a5444', fontSize: 14, lineHeight: 1.75 }}>{dept.mission}</p>
            {dept.highlights?.length > 0 && (
              <ul style={{ margin: '14px 0 0', padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dept.highlights.map((h, i) => <li key={i} style={{ fontSize: 13, color: '#4a6a58', lineHeight: 1.5 }}>{h}</li>)}
              </ul>
            )}
          </div>

          {/* Line Items */}
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde8e2', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #eef3f0' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Budget Detail by Line Item</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f2f7f4' }}>
                  <th style={{ ...th, paddingLeft: 22 }}>Line Item</th>
                  <th style={{ ...th, textAlign: 'right' }}>FY2025 Actual</th>
                  <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
                  <th style={{ ...th, textAlign: 'right' }}>FY2027 Proposed</th>
                </tr>
              </thead>
              <tbody>
                {dept.lineItems.map((li, i) => (
                  <tr key={li.code} style={{ borderBottom: i < dept.lineItems.length - 1 ? '1px solid #eef3f0' : 'none' }}>
                    <td style={{ ...td, paddingLeft: 22 }}>
                      <span style={{ fontSize: 11, color: '#aac4b4', marginRight: 8 }}>{li.code}</span>
                      <span style={{ fontWeight: 500, color: '#2a4a38' }}>{li.name}</span>
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: '#6a8c78' }}>{fmtFull(li.fy25_actual)}</td>
                    <td style={{ ...td, textAlign: 'right', color: '#6a8c78' }}>{fmtFull(li.fy26_approved)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1b2e22' }}>{fmtFull(li.fy27_request)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f2f7f4', borderTop: '2px solid #c8ddd4' }}>
                  <td style={{ ...td, paddingLeft: 22, fontWeight: 700 }}>Total</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(dept.fy25_actual)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(dept.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1b3a2a' }}>{fmtFull(dept.fy27_request)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Bar Chart */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 22, border: '1px solid #dde8e2' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>3-Year Comparison</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#7a9a86' }}>FY2025 Actual · FY2026 Approved · FY2027 Proposed</p>
            <BarChart
              labels={['FY2025\nActual', 'FY2026\nApproved', 'FY2027\nProposed']}
              datasets={[{
                label: 'Budget',
                data: [dept.fy25_actual, dept.fy26_approved, dept.fy27_request],
                backgroundColor: ['rgba(45,106,79,0.4)', 'rgba(45,106,79,0.65)', '#2d6a4f'],
                borderColor: ['#2d6a4f', '#2d6a4f', '#1b4332'],
                borderWidth: 1.5, borderRadius: 5,
              }]}
              showLegend={false}
              height={200}
            />
          </div>

          {/* Contact */}
          {dept.phone && (
            <div style={{ background: '#fff', borderRadius: 10, padding: 22, border: '1px solid #dde8e2' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1b2e22' }}>Contact</h3>
              <div style={{ fontSize: 13, color: '#3a5444', lineHeight: 2 }}>
                <div><strong>Department Head:</strong><br />{dept.head}</div>
                {dept.phone && <div style={{ marginTop: 10 }}><strong>Phone:</strong> {dept.phone}</div>}
                {dept.email && <div><strong>Email:</strong> {dept.email}</div>}
              </div>
            </div>
          )}

          {/* FY27 Narrative */}
          {dept.request_note && (
            <div style={{ background: '#fff8e7', borderRadius: 10, padding: 22, border: '1px solid #e8d88a' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#5a4000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Narrative</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#5a4a10', lineHeight: 1.7 }}>{dept.request_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Enterprise Funds ──────────────────────────────────────────────────────────
function EnterpriseFunds() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>Enterprise Funds</h1>
        <p style={{ margin: 0, color: '#5a7a66', fontSize: 14 }}>Self-supporting utility operations funded by user fees, not property taxes</p>
      </div>

      {ENTERPRISE_FUNDS.map(fund => (
        <div key={fund.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde8e2', marginBottom: 24, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ background: fund.id === 'water' ? '#1b3a2a' : '#2a3a5a', padding: '22px 28px', color: '#fff' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, fontFamily: "'Source Serif 4', serif" }}>{fund.name}</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{fund.head}</p>
          </div>
          <div style={{ padding: 28 }}>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#3a5444', lineHeight: 1.7 }}>{fund.mission}</p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
              {fund.stats.map(s => (
                <div key={s.label} style={{ background: '#f2f7f4', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#5a7a66', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Line items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f2f7f4' }}>
                  <th style={th}>Line Item</th>
                  <th style={{ ...th, textAlign: 'right' }}>FY2026 Approved</th>
                  <th style={{ ...th, textAlign: 'right' }}>FY2027 Proposed</th>
                  <th style={{ ...th, textAlign: 'right' }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {fund.lineItems.map((li, i) => {
                  const c = pctChange(li.fy26_approved, li.fy27_request);
                  return (
                    <tr key={li.name} style={{ borderBottom: i < fund.lineItems.length - 1 ? '1px solid #eef3f0' : 'none' }}>
                      <td style={{ ...td, fontWeight: 500, color: '#2a4a38' }}>{li.name}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#6a8c78' }}>{fmtFull(li.fy26_approved)}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(li.fy27_request)}</td>
                      <td style={{ ...td, textAlign: 'right', fontSize: 12, fontWeight: 600, color: c > 5 ? '#c0392b' : '#5a7a66' }}>{c > 0 ? '+' : ''}{c.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f2f7f4', borderTop: '2px solid #c8ddd4' }}>
                  <td style={{ ...td, fontWeight: 700 }}>Total</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{fmtFull(fund.fy26_approved)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#1b3a2a' }}>{fmtFull(fund.fy27_request)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#5a7a66' }}>
                    {pctChange(fund.fy26_approved, fund.fy27_request).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Capital Plan ──────────────────────────────────────────────────────────────
function CapitalPlan() {
  const [yearFilter, setYearFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const years = ['FY2027', 'FY2028', 'FY2029', 'FY2030', 'FY2031'];
  const depts = [...new Set(CAPITAL_PROJECTS.map(p => p.department))];

  const filtered = useMemo(() => CAPITAL_PROJECTS.filter(p => {
    const matchYear = yearFilter === 'all' || p.years.some(y => y.year === yearFilter);
    const matchDept = deptFilter === 'all' || p.department === deptFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchYear && matchDept && matchStatus && matchSearch;
  }), [yearFilter, deptFilter, statusFilter, search]);

  const totalFiltered = filtered.reduce((s, p) => s + p.total, 0);

  // By year totals for bar chart
  const byYear = years.map(yr => ({
    year: yr,
    total: CAPITAL_PROJECTS.reduce((s, p) => s + (p.years.find(y => y.year === yr)?.amount || 0), 0)
  }));

  const getDeptName = id => {
    const d = DEPARTMENTS.find(x => x.id === id);
    return d?.shortName || id.toUpperCase();
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>Capital Improvement Plan</h1>
        <p style={{ margin: 0, color: '#5a7a66', fontSize: 14 }}>FY2027–FY2031 — Major infrastructure, equipment, and facility projects</p>
      </div>

      {/* Summary bar chart */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #dde8e2', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1b2e22' }}>Capital Investment by Fiscal Year</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#7a9a86' }}>All projects — {fmt(CAPITAL_PROJECTS.reduce((s,p) => s+p.total,0))} total over 5 years</p>
        <BarChart
          labels={byYear.map(b => b.year)}
          datasets={[{
            label: 'Capital Investment',
            data: byYear.map(b => b.total),
            backgroundColor: byYear.map((b, i) => i === 0 ? '#2d6a4f' : i === 1 ? '#40916c' : i === 2 ? '#52b788' : '#74c69d'),
            borderRadius: 5, borderWidth: 0,
          }]}
          showLegend={false}
          height={180}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
          style={{ flex: 1, minWidth: 180, padding: '8px 13px', borderRadius: 7, border: '1px solid #c8ddd4', fontSize: 13, fontFamily: 'Figtree, sans-serif' }} />
        {[
          { label: 'Year', value: yearFilter, set: setYearFilter, opts: [['all', 'All Years'], ...years.map(y => [y, y])] },
          { label: 'Dept', value: deptFilter, set: setDeptFilter, opts: [['all', 'All Departments'], ...depts.map(d => [d, getDeptName(d)])] },
          { label: 'Status', value: statusFilter, set: setStatusFilter, opts: [['all', 'All Statuses'], ...Object.entries(STATUS_BADGE).map(([k,v]) => [k, v.label])] },
        ].map(f => (
          <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
            style={{ padding: '8px 13px', borderRadius: 7, border: '1px solid #c8ddd4', fontSize: 13, background: '#fff', fontFamily: 'Figtree, sans-serif', cursor: 'pointer' }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', background: '#1b3a2a', borderRadius: 7, color: '#fff', fontSize: 13, fontWeight: 600 }}>
          {filtered.length} projects · {fmt(totalFiltered)}
        </div>
      </div>

      {/* Project Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(proj => (
          <div key={proj.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde8e2', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1b2e22' }}>{proj.name}</h3>
                  <Badge status={proj.status} />
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#7a9a86' }}>
                  <span>{getDeptName(proj.department)}</span>
                  <span>·</span>
                  <span>{proj.category}</span>
                  <span>·</span>
                  <span>{proj.funding_source}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif" }}>{fmtFull(proj.total)}</div>
                <div style={{ fontSize: 11, color: '#7a9a86' }}>Total Project Cost</div>
              </div>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#3a5444', lineHeight: 1.65 }}>{proj.description}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {proj.years.map(y => (
                <div key={y.year} style={{ background: '#f2f7f4', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ color: '#5a7a66' }}>{y.year}: </span>
                  <span style={{ color: '#1b2e22' }}>{fmtFull(y.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8aaa96', fontSize: 14 }}>No projects match your filters.</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PublicDashboard, DepartmentList, DepartmentDetail, EnterpriseFunds, CapitalPlan });
