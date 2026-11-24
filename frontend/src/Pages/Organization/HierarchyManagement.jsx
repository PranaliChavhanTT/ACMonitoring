// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { Save, Plus, RefreshCw } from "lucide-react";
// import "./Locations.css";

// const API = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`;
// const LEVELS = ["zone", "circle", "region", "division", "branch", "building", "floor", "room"];
// const DEFAULT_LABELS = { zone: "Zone", circle: "Circle", region: "Region", division: "Division", branch: "Branch", building: "Building", floor: "Floor", room: "Room" };
// const token = () => localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token") || localStorage.getItem("accessToken") || "";
// async function api(path, options = {}) {
//   const t = token();
//   const response = await fetch(`${API}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(t ? { Authorization: t.startsWith("Bearer ") ? t : `Bearer ${t}` } : {}), ...(options.headers || {}) }, cache: "no-store" });
//   const body = await response.text(); let data = {}; try { data = body ? JSON.parse(body) : {}; } catch { data = { detail: body }; }
//   if (!response.ok) throw new Error(data.detail || data.message || JSON.stringify(data));
//   return data;
// }
// const list = x => Array.isArray(x) ? x : x?.results || x?.data || [];
// const id = x => String(x?.id ?? "");

// export default function HierarchyManagement() {
//   const [user, setUser] = useState(null); const [customers, setCustomers] = useState([]); const [customerId, setCustomerId] = useState("");
//   const [customer, setCustomer] = useState(null); const [data, setData] = useState({}); const [form, setForm] = useState({ name: "", code: "", parent: "" });
//   const [active, setActive] = useState("zone"); const [labels, setLabels] = useState(DEFAULT_LABELS); const [saving, setSaving] = useState(false); const [notice, setNotice] = useState(""); const [error, setError] = useState("");
//   const levels = customer?.hierarchy_type === "ZONAL" ? (customer?.zonal_hierarchy_config?.levels || ["zone", "circle", "branch", "floor"]) : [];
//   const label = key => labels[key] || DEFAULT_LABELS[key] || key;
//   const endpoints = { zone: "zones", circle: "circles", region: "regions", division: "divisions", branch: "branches", building: "buildings", floor: "floors", room: "rooms" };
//   const parentLevel = useMemo(() => { const i = levels.indexOf(active); return i > 0 ? levels[i - 1] : ""; }, [active, levels.join("|")]);
//   const parentOptions = data[parentLevel] || [];

//   const loadCustomer = useCallback(async cid => {
//     if (!cid) return;
//     const c = await api(`/customers/${cid}/`); setCustomer(c);
//     const config = c.zonal_hierarchy_config || {}; setLabels({ ...DEFAULT_LABELS, ...(config.labels || {}) });
//     const requests = LEVELS.map(async level => {
//       try { const rows = await api(`/${endpoints[level]}/?customer=${encodeURIComponent(cid)}`); return [level, list(rows)]; }
//       catch { return [level, []]; }
//     });
//     const entries = await Promise.all(requests); setData(Object.fromEntries(entries));
//     const configured = config.levels || ["zone", "circle", "branch", "floor"]; setActive(configured[0] || "zone");
//   }, []);

//   useEffect(() => { (async () => { try {
//     const me = await api("/auth/me/"); const u = me.user || me.data || me; setUser(u);
//     if (String(u.role).toUpperCase() === "CUSTOMER") { const cid = u.customer_id || u.customer?.id || u.customer; setCustomerId(String(cid)); await loadCustomer(cid); }
//     else { const rows = list(await api("/customers/")); setCustomers(rows); if (rows.length) { setCustomerId(String(rows[0].id)); await loadCustomer(rows[0].id); } }
//   } catch (e) { setError(e.message); } })(); }, [loadCustomer]);
//   useEffect(() => { setForm({ name: "", code: "", parent: "" }); }, [active, customerId]);

//   const saveLabels = async () => { if (!customer) return; setSaving(true); setError(""); setNotice(""); try {
//     const config = customer.zonal_hierarchy_config || { version: 1, levels };
//     const updated = await api(`/customers/${customer.id}/`, { method: "PATCH", body: JSON.stringify({ zonal_hierarchy_config: { ...config, labels } }) });
//     setCustomer(updated); setNotice("Hierarchy display names saved.");
//   } catch (e) { setError(e.message); } finally { setSaving(false); } };

//   const saveNode = async e => { e.preventDefault(); setSaving(true); setError(""); setNotice(""); try {
//     const payload = { name: form.name.trim(), code: form.code.trim() };
//     if (active === "zone") payload.customer = customer.id;
//     else if (active === "branch") { payload.customer = customer.id; payload[parentLevel] = form.parent; }
//     else if (active === "circle") payload.zone = form.parent;
//     else if (active === "region") payload[parentLevel] = form.parent;
//     else if (active === "division") payload.region = form.parent;
//     else if (active === "building") payload.branch = form.parent;
//     else if (active === "floor") { payload.branch = form.parent; if (levels.includes("building")) payload.building = form.building; }
//     else if (active === "room") payload.floor = form.parent;
//     await api(`/${endpoints[active]}/`, { method: "POST", body: JSON.stringify(payload) });
//     setNotice(`${label(active)} created.`); setForm({ name: "", code: "", parent: "" }); await loadCustomer(customer.id);
//   } catch (e) { setError(e.message); } finally { setSaving(false); } };

//   if (!user) return <div className="locations-page">Loading hierarchy management…</div>;
//   if (customer?.hierarchy_type !== "ZONAL") return <div className="locations-page"><h2>Hierarchy Management</h2><p>This management screen is for Zonal customers. The Geographical hierarchy remains unchanged.</p></div>;
//   const activeEnabled = levels.includes(active);
//   return <div className="locations-page" style={{ padding: 24 }}>
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2>Hierarchy Management</h2><p>Create each hierarchy level separately. Existing parent records are selected; they are never created inline.</p></div>
//       {String(user.role).toUpperCase() !== "CUSTOMER" && <select value={customerId} onChange={e => { setCustomerId(e.target.value); loadCustomer(e.target.value); }}><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}</select>}
//     </div>
//     {customer && <>
//       <section style={{ margin: "18px 0", padding: 16, border: "1px solid #ddd", borderRadius: 10 }}><h3>Editable level display names</h3><p>These labels affect the UI only; internal hierarchy keys and existing records stay unchanged.</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>{LEVELS.filter(x => levels.includes(x)).map(level => <label key={level} style={{ display: "grid", gap: 5 }}>{DEFAULT_LABELS[level]}<input value={labels[level] || ""} maxLength={60} onChange={e => setLabels(v => ({ ...v, [level]: e.target.value }))} /></label>)}</div><button type="button" disabled={saving} onClick={saveLabels} style={{ marginTop: 12 }}><Save size={15} /> Save display names</button></section>
//       <h3>Create hierarchy items</h3><div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>{levels.map(level => <button type="button" key={level} onClick={() => setActive(level)} aria-pressed={active === level} style={{ fontWeight: active === level ? 700 : 400, border: active === level ? "2px solid #2563eb" : "1px solid #bbb", padding: "8px 12px", borderRadius: 8 }}>{label(level)}</button>)}</div>
//       {activeEnabled && <form onSubmit={saveNode} style={{ maxWidth: 620, display: "grid", gap: 12, padding: 18, border: "1px solid #ddd", borderRadius: 10 }}><h3>Create {label(active)}</h3>
//         {active !== "zone" && <label style={{ display: "grid", gap: 5 }}>{label(active === "branch" ? parentLevel : active === "floor" && levels.includes("building") ? "branch" : parentLevel || (active === "circle" ? "zone" : active === "division" ? "region" : active === "building" ? "branch" : active === "room" ? "floor" : "parent"))}<select required value={form.parent} onChange={e => setForm(v => ({ ...v, parent: e.target.value }))}><option value="">Select existing parent</option>{(data[active === "floor" ? "branch" : active === "branch" ? parentLevel : active === "circle" ? "zone" : active === "division" ? "region" : active === "building" ? "branch" : active === "room" ? "floor" : parentLevel] || []).map(x => <option key={id(x)} value={id(x)}>{x.name}</option>)}</select></label>}
//         {active === "floor" && levels.includes("building") && <label style={{ display: "grid", gap: 5 }}>{label("building")}<select required value={form.building || ""} onChange={e => setForm(v => ({ ...v, building: e.target.value }))}><option value="">Select existing building</option>{(data.building || []).filter(x => String(x.branch) === form.parent).map(x => <option key={id(x)} value={id(x)}>{x.name}</option>)}</select></label>}
//         <label style={{ display: "grid", gap: 5 }}>Name<input required maxLength={255} value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></label><label style={{ display: "grid", gap: 5 }}>Code<input required maxLength={50} value={form.code} onChange={e => setForm(v => ({ ...v, code: e.target.value }))} /></label>
//         <button type="submit" disabled={saving || (active !== "zone" && !form.parent)}><Plus size={15} /> Create {label(active)}</button></form>}
//       {notice && <p role="status">{notice}</p>}{error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
//       <button type="button" onClick={() => loadCustomer(customer.id)} style={{ marginTop: 16 }}><RefreshCw size={15} /> Refresh hierarchy records</button>
//     </>}
//   </div>;
// }

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Save, Plus, RefreshCw } from "lucide-react";
import "./Locations.css";

const API = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`;
const LEVELS = ["zone", "circle", "region", "division", "branch", "building", "floor", "room"];
const DEFAULT_LABELS = { zone: "Zone", circle: "Circle", region: "Region", division: "Division", branch: "Branch", building: "Building", floor: "Floor", room: "Room" };
const token = () => localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token") || localStorage.getItem("accessToken") || "";
async function api(path, options = {}) {
  const t = token();
  const response = await fetch(`${API}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(t ? { Authorization: t.startsWith("Bearer ") ? t : `Bearer ${t}` } : {}), ...(options.headers || {}) }, cache: "no-store" });
  const body = await response.text(); let data = {}; try { data = body ? JSON.parse(body) : {}; } catch { data = { detail: body }; }
  if (!response.ok) throw new Error(data.detail || data.message || JSON.stringify(data));
  return data;
}
const list = x => Array.isArray(x) ? x : x?.results || x?.data || [];
const id = x => String(x?.id ?? "");

export default function HierarchyManagement() {
  const [user, setUser] = useState(null); const [customers, setCustomers] = useState([]); const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null); const [data, setData] = useState({}); const [form, setForm] = useState({ name: "", code: "", parent: "" });
  const [active, setActive] = useState("zone"); const [labels, setLabels] = useState(DEFAULT_LABELS); const [saving, setSaving] = useState(false); const [notice, setNotice] = useState(""); const [error, setError] = useState("");
  const levels = customer?.hierarchy_type === "ZONAL" ? (customer?.zonal_hierarchy_config?.levels || ["zone", "circle", "branch", "floor"]) : [];
  const label = key => labels[key] || DEFAULT_LABELS[key] || key;
  const endpoints = { zone: "zones", circle: "circles", region: "regions", division: "divisions", branch: "branches", building: "buildings", floor: "floors", room: "rooms" };
  const parentLevel = useMemo(() => { const i = levels.indexOf(active); return i > 0 ? levels[i - 1] : ""; }, [active, levels.join("|")]);
  const parentOptions = data[parentLevel] || [];

  const loadCustomer = useCallback(async cid => {
    if (!cid) return;
    const c = await api(`/customers/${cid}/`); setCustomer(c);
    const config = c.zonal_hierarchy_config || {}; setLabels({ ...DEFAULT_LABELS, ...(config.labels || {}) });
    const requests = LEVELS.map(async level => {
      try { const rows = await api(`/${endpoints[level]}/?customer=${encodeURIComponent(cid)}`); return [level, list(rows)]; }
      catch { return [level, []]; }
    });
    const entries = await Promise.all(requests); setData(Object.fromEntries(entries));
    const configured = config.levels || ["zone", "circle", "branch", "floor"]; setActive(configured[0] || "zone");
  }, []);

  useEffect(() => { (async () => { try {
    const me = await api("/auth/me/"); const u = me.user || me.data || me; setUser(u);
    if (String(u.role).toUpperCase() === "CUSTOMER") { const cid = u.customer_id || u.customer?.id || u.customer; setCustomerId(String(cid)); await loadCustomer(cid); }
    else { const rows = list(await api("/customers/")); setCustomers(rows); if (rows.length) { setCustomerId(String(rows[0].id)); await loadCustomer(rows[0].id); } }
  } catch (e) { setError(e.message); } })(); }, [loadCustomer]);
  useEffect(() => { setForm({ name: "", code: "", parent: "" }); }, [active, customerId]);

  const saveLabels = async () => { if (!customer) return; setSaving(true); setError(""); setNotice(""); try {
    const config = customer.zonal_hierarchy_config || { version: 1, levels };
    const updated = await api(`/customers/${customer.id}/`, { method: "PATCH", body: JSON.stringify({ zonal_hierarchy_config: { ...config, labels } }) });
    setCustomer(updated); setNotice("Hierarchy display names saved.");
  } catch (e) { setError(e.message); } finally { setSaving(false); } };

  const saveNode = async e => { e.preventDefault(); setSaving(true); setError(""); setNotice(""); try {
    const payload = { name: form.name.trim(), code: form.code.trim() };
    if (active === "zone") payload.customer = customer.id;
    else if (active === "branch") { payload.customer = customer.id; payload[parentLevel] = form.parent; }
    else if (active === "circle") payload.zone = form.parent;
    else if (active === "region") payload[parentLevel] = form.parent;
    else if (active === "division") payload.region = form.parent;
    else if (active === "building") payload.branch = form.parent;
    else if (active === "floor") { payload.branch = form.parent; if (levels.includes("building")) payload.building = form.building; }
    else if (active === "room") payload.floor = form.parent;
    await api(`/${endpoints[active]}/`, { method: "POST", body: JSON.stringify(payload) });
    setNotice(`${label(active)} created.`); setForm({ name: "", code: "", parent: "" }); await loadCustomer(customer.id);
  } catch (e) { setError(e.message); } finally { setSaving(false); } };

  if (!user) return <div className="locations-page">Loading hierarchy management…</div>;
  if (customer?.hierarchy_type !== "ZONAL") return <div className="locations-page"><h2>Hierarchy Management</h2><p>This management screen is for Zonal customers. The Geographical hierarchy remains unchanged.</p></div>;
  const activeEnabled = levels.includes(active);
  return <div className="locations-page" style={{ padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2>Hierarchy Management</h2><p>Create each hierarchy level separately. Existing parent records are selected; they are never created inline.</p></div>
      {String(user.role).toUpperCase() !== "CUSTOMER" && <select value={customerId} onChange={e => { setCustomerId(e.target.value); loadCustomer(e.target.value); }}><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}</select>}
    </div>
    {customer && <>
      <section style={{ margin: "18px 0", padding: 16, border: "1px solid #ddd", borderRadius: 10 }}><h3>Editable level display names</h3><p>These labels affect the UI only; internal hierarchy keys and existing records stay unchanged.</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>{LEVELS.filter(x => levels.includes(x)).map(level => <label key={level} style={{ display: "grid", gap: 5 }}>{DEFAULT_LABELS[level]}<input value={labels[level] || ""} maxLength={60} onChange={e => setLabels(v => ({ ...v, [level]: e.target.value }))} /></label>)}</div><button type="button" disabled={saving} onClick={saveLabels} style={{ marginTop: 12 }}><Save size={15} /> Save display names</button></section>
      <h3>Create hierarchy items</h3>
      <section style={{ margin: "12px 0 16px", padding: 14, border: "1px solid #ddd", borderRadius: 10 }}>
        <h4 style={{ margin: "0 0 10px" }}>Administrative hierarchy</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {levels.filter(level => ["zone", "circle", "region", "division", "branch"].includes(level)).map(level => <button type="button" key={level} onClick={() => setActive(level)} aria-pressed={active === level} style={{ fontWeight: active === level ? 700 : 400, border: active === level ? "2px solid #2563eb" : "1px solid #bbb", padding: "8px 12px", borderRadius: 8 }}>{label(level)}</button>)}
        </div>
      </section>
      <section style={{ margin: "12px 0 16px", padding: 14, border: "1px solid #ddd", borderRadius: 10 }}>
        <h4 style={{ margin: "0 0 10px" }}>Physical hierarchy</h4>
        <p style={{ margin: "0 0 10px", color: "#666", fontSize: 13 }}>Manage Buildings, Floors and Rooms here, on the same page. Only levels enabled for this customer are available.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {levels.filter(level => ["building", "floor", "room"].includes(level)).map(level => <button type="button" key={level} onClick={() => setActive(level)} aria-pressed={active === level} style={{ fontWeight: active === level ? 700 : 400, border: active === level ? "2px solid #2563eb" : "1px solid #bbb", padding: "8px 12px", borderRadius: 8 }}>{label(level)}</button>)}
          {!levels.some(level => ["building", "floor", "room"].includes(level)) && <span style={{ color: "#777", fontSize: 13 }}>Building, Floor and Room are not enabled in this customer's hierarchy configuration.</span>}
        </div>
      </section>
      {activeEnabled && <form onSubmit={saveNode} style={{ maxWidth: 620, display: "grid", gap: 12, padding: 18, border: "1px solid #ddd", borderRadius: 10 }}><h3>Create {label(active)}</h3>
        {active !== "zone" && <label style={{ display: "grid", gap: 5 }}>{label(active === "branch" ? parentLevel : active === "floor" && levels.includes("building") ? "branch" : parentLevel || (active === "circle" ? "zone" : active === "division" ? "region" : active === "building" ? "branch" : active === "room" ? "floor" : "parent"))}<select required value={form.parent} onChange={e => setForm(v => ({ ...v, parent: e.target.value }))}><option value="">Select existing parent</option>{(data[active === "floor" ? "branch" : active === "branch" ? parentLevel : active === "circle" ? "zone" : active === "division" ? "region" : active === "building" ? "branch" : active === "room" ? "floor" : parentLevel] || []).map(x => <option key={id(x)} value={id(x)}>{x.name}</option>)}</select></label>}
        {active === "floor" && levels.includes("building") && <label style={{ display: "grid", gap: 5 }}>{label("building")}<select required value={form.building || ""} onChange={e => setForm(v => ({ ...v, building: e.target.value }))}><option value="">Select existing building</option>{(data.building || []).filter(x => String(x.branch) === form.parent).map(x => <option key={id(x)} value={id(x)}>{x.name}</option>)}</select></label>}
        <label style={{ display: "grid", gap: 5 }}>Name<input required maxLength={255} value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></label><label style={{ display: "grid", gap: 5 }}>Code<input required maxLength={50} value={form.code} onChange={e => setForm(v => ({ ...v, code: e.target.value }))} /></label>
        <button type="submit" disabled={saving || (active !== "zone" && !form.parent)}><Plus size={15} /> Create {label(active)}</button></form>}
      {notice && <p role="status">{notice}</p>}{error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      <button type="button" onClick={() => loadCustomer(customer.id)} style={{ marginTop: 16 }}><RefreshCw size={15} /> Refresh hierarchy records</button>
    </>}
  </div>;
}
