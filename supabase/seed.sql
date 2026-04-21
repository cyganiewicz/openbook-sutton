-- ============================================================
-- OpenBook — Town of Sutton, MA
-- Seed Data (FY2027 Budget Cycle)
--
-- Run AFTER schema.sql.  Safe to re-run (uses ON CONFLICT DO UPDATE).
-- ============================================================

-- ── Enterprise Funds ──────────────────────────────────────────────────────────

INSERT INTO enterprise_funds (id, name, short_name, head, mission, stats, fy25_actual, fy26_approved, fy27_request, line_items) VALUES
('water', 'Water Enterprise Fund', 'Water', 'Richard Gagne, DPW Director',
 'The Water Enterprise Fund provides for the operation, maintenance, and capital improvement of the town''s public water supply system, serving approximately 2,800 residential and commercial connections.',
 '[{"label":"Active Connections","value":"2,812"},{"label":"Avg Daily Demand","value":"1.2 MGD"},{"label":"Water Rate (per 100 cf)","value":"$4.85"},{"label":"Debt Outstanding","value":"$1.8M"}]',
 1682000, 1782000, 1892000,
 '[{"name":"Personnel Services","fy26_approved":548000,"fy27_request":582000},{"name":"Contracted Operations","fy26_approved":425000,"fy27_request":448000},{"name":"Chemicals & Supplies","fy26_approved":185000,"fy27_request":198000},{"name":"Utilities","fy26_approved":142000,"fy27_request":158000},{"name":"Debt Service","fy26_approved":285000,"fy27_request":298000},{"name":"Capital Outlay","fy26_approved":198000,"fy27_request":208000}]'),
('sewer', 'Sewer Enterprise Fund', 'Sewer', 'Richard Gagne, DPW Director',
 'The Sewer Enterprise Fund manages the collection, treatment, and disposal of wastewater from approximately 1,400 residential and commercial sewer connections, ensuring environmental compliance.',
 '[{"label":"Active Connections","value":"1,412"},{"label":"Avg Daily Flow","value":"0.48 MGD"},{"label":"Sewer Rate (per 100 cf)","value":"$7.25"},{"label":"Debt Outstanding","value":"$2.4M"}]',
 1118000, 1175000, 1248000,
 '[{"name":"Personnel Services","fy26_approved":322000,"fy27_request":342000},{"name":"WRSD Treatment Assessment","fy26_approved":485000,"fy27_request":512000},{"name":"Contracted Operations","fy26_approved":142000,"fy27_request":152000},{"name":"Supplies & Maintenance","fy26_approved":85000,"fy27_request":92000},{"name":"Debt Service","fy26_approved":125000,"fy27_request":148000}]')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, short_name=EXCLUDED.short_name, head=EXCLUDED.head,
  mission=EXCLUDED.mission, stats=EXCLUDED.stats,
  fy25_actual=EXCLUDED.fy25_actual, fy26_approved=EXCLUDED.fy26_approved,
  fy27_request=EXCLUDED.fy27_request, line_items=EXCLUDED.line_items;

-- ── Departments ───────────────────────────────────────────────────────────────

INSERT INTO departments (id, name, short_name, category, head, phone, email, mission, highlights, fy25_actual, fy26_approved, fy27_request, fy27_recommended, fy27_approved, request_status, request_note, tm_note) VALUES

('tm', 'Town Manager & Select Board', 'Town Manager', 'general_govt',
 'Andrew Dowd, Town Manager', '(508) 865-8722', 'manager@suttonma.org',
 'The Town Manager''s Office provides executive leadership and administrative oversight for all town departments, implements Select Board policy directives, and ensures the efficient and transparent delivery of municipal services to Sutton residents.',
 ARRAY['Third year of the FY2025–2027 Strategic Plan implementation','New resident communications platform launches Q1 FY2027','Workforce development and succession planning initiative underway'],
 412000, 438000, 465000, NULL, NULL, 'submitted',
 'FY2027 request reflects 3% COLA per collective bargaining agreement and expanded communications initiatives.', NULL),

('treasurer', 'Treasurer/Collector', 'Treasurer/Collector', 'general_govt',
 'Lisa Perkins, Treasurer/Collector', '(508) 865-8726', 'treasurer@suttonma.org',
 'The Treasurer/Collector''s Office manages the collection of all municipal revenues, including property taxes, excise taxes, and departmental fees, while maintaining sound investment of town funds.',
 ARRAY['Property tax collection rate: 98.9% — above state average','Online payment portal launched FY2026 — 34% of bills now paid digitally','Investment portfolio yield improved 42 basis points'],
 348000, 362000, 385000, NULL, NULL, 'submitted',
 'Increased professional services reflects growing complexity of investment management and state compliance reporting.', NULL),

('accounting', 'Accounting', 'Accounting', 'general_govt',
 'Maria Santos, Town Accountant', '(508) 865-8724', 'accounting@suttonma.org',
 'The Accounting Department maintains all financial records, prepares financial statements, processes payroll and accounts payable, and ensures compliance with Massachusetts General Laws governing municipal finance.',
 ARRAY['Clean audit opinion — 8th consecutive year','New chart of accounts structure implemented','OPEB funding plan established per PERAC requirements'],
 262000, 278000, 295000, NULL, NULL, 'under_review',
 'Personnel increase reflects addition of part-time accounting assistant to manage increased grant tracking requirements.',
 'Solid request. Will review PT position justification.'),

('assessing', 'Assessing', 'Assessing', 'general_govt',
 'Robert Chen, Principal Assessor', '(508) 865-8721', 'assessing@suttonma.org',
 'The Board of Assessors determines the fair market value of all taxable property in Sutton for equitable distribution of the property tax burden, and administers exemption programs for qualifying residents.',
 ARRAY['Triennial recertification completed by DOR — FY2025','Average single-family assessed value: $498,400','Elderly & veteran exemption program serves 142 households'],
 202000, 215000, 228000, NULL, NULL, 'submitted',
 'Cyclical inspection program continues FY2027. Personnel request includes step increases per pay plan.', NULL),

('clerk', 'Town Clerk', 'Town Clerk', 'general_govt',
 'Patricia Walsh, Town Clerk', '(508) 865-8723', 'townclerk@suttonma.org',
 'The Town Clerk''s Office is the official keeper of town records, administers all elections, issues licenses and permits, and provides vital public records access in accordance with Massachusetts law.',
 ARRAY['3 elections administered in FY2026','Voter registration rate: 78% of eligible residents','Records digitization project 62% complete'],
 175000, 187000, 198000, NULL, NULL, 'submitted',
 'FY2027 is an election-heavy year. Election worker costs reflect current wage rates and anticipated turnout.', NULL),

('inspectional', 'Inspectional Services', 'Inspectional Services', 'general_govt',
 'James Kovac, Building Commissioner', '(508) 865-8730', 'building@suttonma.org',
 'Inspectional Services ensures safety of the built environment by enforcing state building, plumbing, electrical, and gas codes, administering zoning bylaws, and supporting responsible development.',
 ARRAY['Building permits issued FY2026: 412 — 18% increase','Permit revenue: $382,000 — 14% above projections','Online permit system reduced processing time 40%'],
 305000, 325000, 348000, NULL, NULL, 'submitted',
 'Sustained development activity requires additional inspection capacity. Request includes 0.5 FTE additional inspector.', NULL),

('health', 'Health Department', 'Health', 'human_services',
 'Dr. Susan Marcotte, Health Director', '(508) 865-8725', 'health@suttonma.org',
 'The Health Department protects and promotes the health and wellness of Sutton residents by enforcing sanitary and environmental codes, responding to public health emergencies, and providing preventive health programs.',
 ARRAY['Led town-wide COVID recovery and resilience planning','Food establishment inspections: 100% completion rate','Partnered with UMass Extension on tick-borne illness awareness'],
 252000, 268000, 285000, NULL, NULL, 'not_started', '', NULL),

('communications', 'Communications', 'Communications', 'general_govt',
 'Sarah Kim, Communications Manager', '(508) 865-8728', 'communications@suttonma.org',
 'The Communications Department manages the town''s public information, digital platforms, and media relations to foster an informed and engaged community.',
 ARRAY['Town website traffic up 28% year-over-year','E-newsletter subscribers: 4,200 — up from 2,800 in FY2024','Launched OpenBook transparency portal (FY2027)'],
 162000, 175000, 186000, NULL, NULL, 'submitted',
 'OpenBook portal hosting and maintenance included in technology line. Social media management contract renewed.',
 'Priority department this year — support the launch.'),

('library', 'Library', 'Sutton Public Library', 'culture_rec',
 'Margaret Hooper, Library Director', '(508) 865-8723 x205', 'library@suttonma.org',
 'The Sutton Free Public Library connects all community members to knowledge, ideas, and each other through free access to information, cultural programming, and lifelong learning.',
 ARRAY['Annual circulation: 68,400 items — highest on record','Program attendance: 14,200 — 38% increase over FY2025','Library card holders: 5,812 (63% of population)'],
 565000, 598000, 632000, NULL, NULL, 'submitted',
 'Personnel reflects step increases and addition of 0.5 FTE children''s librarian to meet program demand.', NULL),

('hr', 'Human Resources', 'Human Resources', 'general_govt',
 'Diana Russo, HR Director', '(508) 865-8729', 'hr@suttonma.org',
 'Human Resources supports the town''s employees through recruitment, onboarding, benefits administration, labor relations, and compliance with employment law.',
 ARRAY['42 positions hired or promoted in FY2026','Employee engagement survey: 71% participation rate','New DEI training curriculum adopted town-wide'],
 152000, 162000, 172000, 172000, 172000, 'approved',
 'Modest increase reflects negotiation support during upcoming collective bargaining cycle.',
 'Approved as submitted. Labor relations work is essential this year.'),

('planning', 'Planning & Community Development', 'Planning', 'general_govt',
 'Kevin O''Brien, Town Planner', '(508) 865-8731', 'planning@suttonma.org',
 'The Planning & Community Development Department guides the long-range growth of Sutton through comprehensive planning, zoning administration, grant management, and coordination with regional agencies.',
 ARRAY['Master Plan update adopted — January 2026','MBTA Communities zoning bylaw developed and submitted','$1.2M in MassWorks and CPA grants secured FY2026'],
 278000, 298000, 318000, NULL, NULL, 'under_review',
 'Increased professional services supports MBTA Communities implementation and master plan implementation.',
 'Reviewing grant match requirements vs. request.'),

('fire', 'Fire Department', 'Fire', 'public_safety',
 'Chief Michael Brennan', '(508) 865-8747', 'fire@suttonma.org',
 'The Sutton Fire Department provides emergency response services including fire suppression, emergency medical services, technical rescue, and hazardous materials response across 34 square miles.',
 ARRAY['Emergency calls FY2026: 2,148 (+6.2%)','EMS calls represent 61% of total call volume','ISO rating: Class 5 — supporting lower homeowner insurance rates'],
 1942000, 2048000, 2185000, NULL, NULL, 'submitted',
 'Personnel increase reflects new contract terms and call pay incentive program to address volunteer recruitment challenges.', NULL),

('police', 'Police Department', 'Police', 'public_safety',
 'Chief Daniel Sullivan', '(508) 865-8740', 'police@suttonma.org',
 'The Sutton Police Department is committed to protecting the safety and rights of all people in Sutton through community policing, responsive patrol services, and criminal investigation.',
 ARRAY['Part I crimes: 112 — 8.2% reduction year-over-year','Community outreach events: 24 in FY2026','Body-worn camera program expansion to all patrol officers'],
 2525000, 2665000, 2842000, NULL, NULL, 'submitted',
 'Personnel reflects new collective bargaining agreement ratified November 2025. Adds 0.5 FTE administrative support.', NULL),

('dpw', 'Public Works', 'Public Works', 'public_works',
 'Richard Gagne, DPW Director', '(508) 865-8750', 'dpw@suttonma.org',
 'The Department of Public Works maintains 87 miles of roads, stormwater systems, public grounds, solid waste and recycling, and all town-owned buildings and facilities.',
 ARRAY['87 miles of roads maintained — 14.2 miles resurfaced FY2026','Solid waste & recycling diversion rate: 42%','ADA transition plan implementation ongoing across town facilities'],
 2185000, 2312000, 2478000, NULL, NULL, 'submitted',
 'Fuel, materials, and contracted services costs rising. Request includes COLA increases and additional seasonal help.', NULL),

('senior', 'Senior Center', 'Senior Center', 'human_services',
 'Patricia Dunleavy, Director', '(508) 865-8727', 'senior@suttonma.org',
 'The Sutton Senior Center provides social, educational, health, and supportive services to residents aged 60 and older, promoting independence, dignity, and quality of life.',
 ARRAY['Unduplicated seniors served: 842 in FY2026','Meals served through CNAAA partnership: 12,400','Transportation services: 1,850 trips provided'],
 258000, 275000, 292000, NULL, NULL, 'not_started', '', NULL),

('schools', 'Sutton Public Schools', 'Schools', 'education',
 'Dr. Anthony Connors, Superintendent', '(508) 865-8764', 'superintendent@suttonschools.net',
 'Sutton Public Schools serves approximately 1,820 PreK–12 students committed to academic excellence, whole-child development, and preparing students for success in a changing world.',
 ARRAY['Enrollment: 1,820 students (PreK–12)','Graduation rate: 96.4% — above state average','District ranked in top 25% of MA districts for growth metrics'],
 7562000, 7985000, 8456000, NULL, NULL, 'submitted',
 'Town assessment increase of 5.9% reflects enrollment growth, special education out-of-district costs (+12%), and new collective bargaining agreements.', NULL),

('debt', 'Debt Service', 'Debt Service', 'debt',
 'Maria Santos, Town Accountant', '', '',
 'Debt Service represents the town''s principal and interest payments on bonds and notes issued to finance capital projects approved by Town Meeting.',
 ARRAY['Outstanding bonded debt: $7.2M','Debt-to-assessed-value ratio: 1.2%','Three bonds maturing in FY2028'],
 1125000, 1185000, 1248000, 1248000, 1248000, 'approved',
 'Fixed obligation based on debt schedules.', 'Fixed obligation — approved.'),

('benefits', 'Employee Benefits', 'Benefits', 'benefits',
 'Diana Russo, HR Director', '', '',
 'Employee Benefits encompasses the town''s share of health insurance premiums, retirement contributions, Medicare, unemployment, and workers'' compensation for all municipal employees.',
 ARRAY['Health insurance covered for 287 active and retiree subscribers','Pension contribution rate set by WORCRA — 12.8% of payroll','Workers'' comp experience modifier: 0.82 (favorable)'],
 1385000, 1462000, 1542000, NULL, NULL, 'submitted',
 'Health insurance premiums increasing 7.5% per GIC rates. Pension contribution driven by WORCRA schedule.', NULL)

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, short_name=EXCLUDED.short_name, category=EXCLUDED.category,
  head=EXCLUDED.head, phone=EXCLUDED.phone, email=EXCLUDED.email,
  mission=EXCLUDED.mission, highlights=EXCLUDED.highlights,
  fy25_actual=EXCLUDED.fy25_actual, fy26_approved=EXCLUDED.fy26_approved,
  fy27_request=EXCLUDED.fy27_request, fy27_recommended=EXCLUDED.fy27_recommended,
  fy27_approved=EXCLUDED.fy27_approved, request_status=EXCLUDED.request_status,
  request_note=EXCLUDED.request_note, tm_note=EXCLUDED.tm_note;

-- ── Line Items ────────────────────────────────────────────────────────────────
-- Truncate and re-insert (safe because we own the seed data)
DELETE FROM line_items WHERE dept_id IN (
  'tm','treasurer','accounting','assessing','clerk','inspectional',
  'health','communications','library','hr','planning','fire','police',
  'dpw','senior','schools','debt','benefits'
);

INSERT INTO line_items (dept_id, code, name, fy25_actual, fy26_approved, fy27_request, fy27_recommended, sort_order) VALUES
-- Town Manager
('tm','1100','Salaries & Wages',308000,325000,342000,NULL,1),
('tm','2100','Professional Services',52000,58000,62000,NULL,2),
('tm','2200','Communications & Printing',18000,24000,28000,NULL,3),
('tm','3100','Office Supplies',8000,12000,14000,NULL,4),
('tm','5100','Travel & Training',12000,14000,15000,NULL,5),
('tm','5900','Other Charges',14000,5000,4000,NULL,6),
-- Treasurer/Collector
('treasurer','1100','Salaries & Wages',268000,278000,292000,NULL,1),
('treasurer','2100','Professional Services',42000,48000,54000,NULL,2),
('treasurer','2200','Technology & Software',18000,20000,22000,NULL,3),
('treasurer','3100','Office Supplies',8000,9000,9000,NULL,4),
('treasurer','5100','Training & Dues',5000,7000,8000,NULL,5),
-- Accounting
('accounting','1100','Salaries & Wages',195000,208000,218000,NULL,1),
('accounting','1200','Part-time',0,0,18000,NULL,2),
('accounting','2100','Audit & Professional Services',38000,40000,42000,NULL,3),
('accounting','2200','Technology & Software',14000,16000,16000,NULL,4),
('accounting','3100','Supplies',3000,3000,3000,NULL,5),
-- Assessing
('assessing','1100','Salaries & Wages',148000,158000,165000,NULL,1),
('assessing','2100','Appraisal & Professional Services',32000,35000,38000,NULL,2),
('assessing','2200','CAMA Software',12000,14000,16000,NULL,3),
('assessing','3100','Supplies & Mileage',5000,5000,6000,NULL,4),
('assessing','5100','Training & Dues',3000,3000,3000,NULL,5),
-- Town Clerk
('clerk','1100','Salaries & Wages',122000,130000,136000,NULL,1),
('clerk','1300','Election Workers',18000,22000,26000,NULL,2),
('clerk','2100','Professional Services',12000,14000,14000,NULL,3),
('clerk','3100','Supplies & Printing',14000,14000,15000,NULL,4),
('clerk','5100','Training',4000,4000,4000,NULL,5),
-- Inspectional Services
('inspectional','1100','Salaries & Wages',224000,238000,252000,NULL,1),
('inspectional','1400','Inspector Stipends',22000,24000,28000,NULL,2),
('inspectional','2100','Professional Services',28000,30000,32000,NULL,3),
('inspectional','2200','Technology',12000,14000,14000,NULL,4),
('inspectional','3100','Vehicle & Supplies',6000,7000,8000,NULL,5),
-- Health Department
('health','1100','Salaries & Wages',188000,200000,210000,NULL,1),
('health','2100','Contracted Health Services',32000,36000,38000,NULL,2),
('health','2200','Lab & Inspection Services',14000,16000,18000,NULL,3),
('health','3100','Supplies & Equipment',8000,8000,10000,NULL,4),
('health','5100','Training & Dues',5000,5000,6000,NULL,5),
-- Communications
('communications','1100','Salaries & Wages',118000,128000,132000,NULL,1),
('communications','2100','Design & Media Services',18000,22000,24000,NULL,2),
('communications','2200','Technology & Platforms',14000,16000,20000,NULL,3),
('communications','3100','Supplies & Printing',6000,6000,6000,NULL,4),
('communications','5100','Training',2000,3000,4000,NULL,5),
-- Library
('library','1100','Salaries & Wages',418000,442000,468000,NULL,1),
('library','3200','Library Materials',68000,72000,76000,NULL,2),
('library','2100','Technology & Online Resources',34000,38000,40000,NULL,3),
('library','3100','Supplies & Programs',22000,24000,26000,NULL,4),
('library','5100','Training & Conference',8000,10000,10000,NULL,5),
-- Human Resources
('hr','1100','Salaries & Wages',112000,120000,126000,126000,1),
('hr','2100','Professional Services / LR',22000,26000,30000,30000,2),
('hr','2200','HRIS & Technology',10000,10000,10000,10000,3),
('hr','3100','Supplies & Wellness',4000,4000,4000,4000,4),
('hr','5100','Training & Dues',4000,4000,4000,4000,5),
-- Planning
('planning','1100','Salaries & Wages',195000,208000,218000,NULL,1),
('planning','2100','Professional & Planning Services',52000,62000,72000,NULL,2),
('planning','2200','GIS & Technology',14000,16000,18000,NULL,3),
('planning','3100','Supplies & Printing',8000,8000,8000,NULL,4),
('planning','5100','Training & Conference',4000,4000,4000,NULL,5),
-- Fire Department
('fire','1100','Salaries & Wages (Career)',1245000,1315000,1402000,NULL,1),
('fire','1300','Call Firefighter Pay',185000,198000,218000,NULL,2),
('fire','1400','Overtime',168000,175000,188000,NULL,3),
('fire','2100','Contracted Services',85000,92000,98000,NULL,4),
('fire','3200','Protective Gear & Supplies',125000,128000,135000,NULL,5),
('fire','4200','Vehicle Maintenance & Fuel',68000,72000,78000,NULL,6),
('fire','5100','Training & EMS Certification',42000,48000,52000,NULL,7),
-- Police Department
('police','1100','Salaries & Wages',1865000,1975000,2108000,NULL,1),
('police','1400','Overtime',225000,235000,255000,NULL,2),
('police','2100','Contracted Services',145000,152000,162000,NULL,3),
('police','3200','Supplies & Equipment',125000,130000,138000,NULL,4),
('police','4200','Vehicle & Fuel',98000,105000,112000,NULL,5),
('police','5100','Training',42000,48000,52000,NULL,6),
-- Public Works
('dpw','1100','Salaries & Wages',965000,1025000,1088000,NULL,1),
('dpw','1300','Seasonal & Part-time',68000,72000,85000,NULL,2),
('dpw','1400','Overtime (Snow & Ice)',125000,130000,138000,NULL,3),
('dpw','2100','Contracted Services',348000,365000,388000,NULL,4),
('dpw','3200','Materials & Supplies',285000,295000,318000,NULL,5),
('dpw','4100','Fuel',185000,195000,215000,NULL,6),
('dpw','4200','Vehicle & Equipment Maint.',145000,155000,165000,NULL,7),
-- Senior Center
('senior','1100','Salaries & Wages',185000,198000,210000,NULL,1),
('senior','2100','Contracted Program Services',38000,42000,46000,NULL,2),
('senior','3100','Supplies & Program Materials',18000,20000,22000,NULL,3),
('senior','4200','Van Maintenance',8000,8000,8000,NULL,4),
('senior','5100','Training',4000,4000,4000,NULL,5),
-- Sutton Public Schools
('schools','1000','Town Assessment — Sutton Public Schools',7562000,7985000,8456000,NULL,1),
-- Debt Service
('debt','7100','Principal Payments',725000,765000,808000,808000,1),
('debt','7200','Interest Payments',285000,298000,312000,312000,2),
('debt','7300','Short-term Note Interest',62000,72000,80000,80000,3),
('debt','7400','Issuance Costs',28000,38000,42000,42000,4),
-- Employee Benefits
('benefits','6100','Health Insurance (GIC)',842000,892000,958000,NULL,1),
('benefits','6200','Pension / Retirement Contribution',325000,348000,365000,NULL,2),
('benefits','6300','Medicare',128000,135000,142000,NULL,3),
('benefits','6400','Workers'' Compensation',62000,65000,58000,NULL,4),
('benefits','6500','Unemployment Insurance',18000,18000,18000,NULL,5);

-- ── Capital Projects ──────────────────────────────────────────────────────────

INSERT INTO capital_projects (id, name, department, description, category, priority, funding_source, status, total, years, tm_note) VALUES
('cap001','Highway Truck Replacement (10-Wheel Dump)','dpw',
 'Replacement of 2006 International 10-wheel dump truck that has exceeded useful life. Used for snow & ice removal, road maintenance, and materials transport.',
 'Equipment','high','General Fund / Stabilization','recommended',285000,
 '[{"year":"FY2027","amount":285000}]',NULL),

('cap002','Fire Engine Replacement (Engine 3)','fire',
 'Replacement of 2002 Pierce Arrow XT pumper that has exceeded NFPA 1901 service life standards. Required for ISO rating maintenance and firefighter safety.',
 'Equipment','high','General Fund / Borrowing','recommended',620000,
 '[{"year":"FY2027","amount":620000}]',NULL),

('cap003','Manchaug Road Bridge Reconstruction','dpw',
 'Full reconstruction of structurally deficient bridge on Manchaug Road, currently posted at 10-ton limit. MassDOT Bridge Program provides 80% federal reimbursement.',
 'Infrastructure','high','Borrowing / Federal Aid (80%)','recommended',1200000,
 '[{"year":"FY2027","amount":300000},{"year":"FY2028","amount":900000}]',NULL),

('cap004','Body-Worn Camera System Expansion','police',
 'Expansion of body-worn camera program to all patrol officers plus interview room cameras. Includes 5-year storage contract.',
 'Technology','medium','General Fund','recommended',48000,
 '[{"year":"FY2027","amount":48000}]',NULL),

('cap005','Primary School HVAC Replacement','schools',
 'Replacement of original 1998 HVAC units at the Primary School. Units have exceeded useful life and failures are increasing.',
 'Buildings & Facilities','high','Borrowing','planned',875000,
 '[{"year":"FY2028","amount":875000}]',NULL),

('cap006','Library Accessibility Improvements','library',
 'ADA-compliant entrance, restroom upgrades, and signage improvements at the Sutton Free Public Library.',
 'Buildings & Facilities','medium','CPA / General Fund','planned',128000,
 '[{"year":"FY2028","amount":128000}]',NULL),

('cap007','Water Main Replacement — Putnam Hill Rd (Phase 1)','dpw',
 'Replacement of undersized 4-inch cast iron water main with 8-inch ductile iron main. Phase 1 of 3-phase project covering 1.2 miles.',
 'Infrastructure','high','Water Enterprise / Borrowing','recommended',425000,
 '[{"year":"FY2027","amount":425000}]',NULL),

('cap008','Sewer Pump Station Upgrade — Hartland Ave','dpw',
 'Complete rehabilitation of aging pump station including new pumps, controls, and SCADA integration.',
 'Infrastructure','high','Sewer Enterprise / Borrowing','planned',385000,
 '[{"year":"FY2028","amount":385000}]',NULL),

('cap009','Town Hall IT Infrastructure Modernization','tm',
 'Replacement of aging server infrastructure, network switching, and UPS systems across Town Hall campus. Last upgraded in 2016.',
 'Technology','medium','General Fund / Free Cash','recommended',98000,
 '[{"year":"FY2027","amount":98000}]',NULL),

('cap010','Annual Road Resurfacing Program','dpw',
 'Annual capital program for reclamation and overlay of highest-priority road segments per the Pavement Management Plan. Targets 3–4 miles per year.',
 'Infrastructure','high','Chapter 90 / General Fund','recommended',1085000,
 '[{"year":"FY2027","amount":350000},{"year":"FY2028","amount":350000},{"year":"FY2029","amount":385000}]',NULL),

('cap011','Aerial Ladder Truck (75'' Quint)','fire',
 'Purchase of aerial ladder truck to provide elevated rescue and master stream capability. Sutton currently relies on mutual aid for aerial operations.',
 'Equipment','medium','Borrowing','planned',1125000,
 '[{"year":"FY2029","amount":1125000}]',NULL),

('cap012','Millbury Street Playing Fields Improvements','dpw',
 'Renovation of youth athletic fields including drainage, irrigation, fencing, and accessible pathway.',
 'Parks & Recreation','medium','CPA / General Fund','planned',285000,
 '[{"year":"FY2029","amount":285000}]',NULL),

('cap013','Water Main Replacement — Putnam Hill Rd (Phase 2)','dpw',
 'Phase 2 of Putnam Hill Road water main replacement covering an additional 1.1 miles.',
 'Infrastructure','medium','Water Enterprise / Borrowing','planned',485000,
 '[{"year":"FY2029","amount":485000}]',NULL),

('cap014','Police Station Feasibility Study','police',
 'Comprehensive needs assessment and feasibility study for police facility to address space and operational deficiencies in the current 1978 station.',
 'Buildings & Facilities','medium','General Fund','under_review',65000,
 '[{"year":"FY2027","amount":65000}]',NULL),

('cap015','Senior Center Roof Replacement','senior',
 'Full replacement of original flat roof at the Senior Center, including insulation upgrade and improved drainage. Current roof is 22 years old.',
 'Buildings & Facilities','medium','General Fund','planned',145000,
 '[{"year":"FY2028","amount":145000}]',NULL)

ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, department=EXCLUDED.department,
  description=EXCLUDED.description, category=EXCLUDED.category,
  priority=EXCLUDED.priority, funding_source=EXCLUDED.funding_source,
  status=EXCLUDED.status, total=EXCLUDED.total, years=EXCLUDED.years,
  tm_note=EXCLUDED.tm_note;


-- ── Revenue Sources ───────────────────────────────────────────────────────────

INSERT INTO revenues (fiscal_year, source, amount, percent, sort_order) VALUES
('FY2027', 'Property Tax Levy',        15848000, 70.9, 1),
('FY2027', 'State Aid',                 4235000, 18.9, 2),
('FY2027', 'Local Receipts',            1572000,  7.0, 3),
('FY2027', 'Free Cash / Available Funds', 700000,  3.1, 4),
('FY2026', 'Property Tax Levy',        15200000, 72.2, 1),
('FY2026', 'State Aid',                 4100000, 19.5, 2),
('FY2026', 'Local Receipts',            1410000,  6.7, 3),
('FY2026', 'Free Cash / Available Funds', 331000,  1.6, 4),
('FY2025', 'Property Tax Levy',        14700000, 70.5, 1),
('FY2025', 'State Aid',                 3950000, 18.9, 2),
('FY2025', 'Local Receipts',            1380000,  6.6, 3),
('FY2025', 'Free Cash / Available Funds', 826000,  4.0, 4)
ON CONFLICT DO NOTHING;
