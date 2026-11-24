import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GitBranch, Plus, RefreshCw, Save, Link2, Info } from "lucide-react";
import "./GenericHierarchyManagement.css";

const API = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`;
const token = () => localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token") || localStorage.getItem("accessToken") || "";

async function api(path, options = {}) {
  const auth = token();
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth.startsWith("Bearer ") ? auth : `Bearer ${auth}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { detail: raw }; }
  if (!response.ok) throw new Error(body.detail || body.message || body.error || JSON.stringify(body));
  return body;
}

const rows = value => Array.isArray(value) ? value : value?.results || value?.data || value?.branches || [];
const idOf = value => String(value?.id ?? "");

export default function GenericHierarchyManagement() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [types, setTypes] = useState([]);
  const [config, setConfig] = useState({ types: [], rules: [] });
  const [units, setUnits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [parentId, setParentId] = useState("");
  const [allowed, setAllowed] = useState([]);
  const [unitForm, setUnitForm] = useState({ unit_type: "", name: "", code: "", latitude: "", longitude: "" });
  const [ruleForm, setRuleForm] = useState({ parent_type_id: "", child_type_id: "" });
  const [branchId, setBranchId] = useState("");
  const [branchOrgUnitId, setBranchOrgUnitId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noZonalCustomers, setNoZonalCustomers] = useState(false);

  const enabledTypes = useMemo(() => config.types.filter(item => item.is_enabled), [config.types]);
  const selectedCustomer = useMemo(() => customers.find(item => String(item.id) === String(customerId)), [customers, customerId]);

  const loadUnits = useCallback(async cid => {
    if (!cid) return;
    const [unitResult, branchResult] = await Promise.all([
      api(`/org-units/?customer=${encodeURIComponent(cid)}`),
      api(`/branches/?customer=${encodeURIComponent(cid)}`),
    ]);
    setUnits(rows(unitResult));
    setBranches(rows(branchResult));
  }, []);

  const loadConfig = useCallback(async cid => {
    if (!cid) return;
    const [masterResult, saved] = await Promise.all([
      api("/org-unit-types/"),
      api(`/customers/${encodeURIComponent(cid)}/org-config/`),
    ]);
    const master = rows(masterResult);
    setTypes(master);
    const configured = saved.types?.length
      ? saved.types
      : master.map(type => ({ id: type.id, code: type.code, name: type.name, is_enabled: false, is_terminal: type.code === "BO" }));
    setConfig({ types: configured, rules: saved.rules || [] });
    setParentId("");
    setUnitForm({ unit_type: "", name: "", code: "", latitude: "", longitude: "" });
    await loadUnits(cid);
  }, [loadUnits]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const result = rows(await api("/customers/"));
        const zonal = result.filter(customer => customer.hierarchy_type === "ZONAL");
        if (cancelled) return;
        setCustomers(zonal);
        setNoZonalCustomers(zonal.length === 0);
        if (zonal.length) {
          const firstId = String(zonal[0].id);
          setCustomerId(firstId);
          await loadConfig(firstId);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load organisational hierarchy.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadConfig]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!customerId) { setAllowed([]); return; }
      try {
        const query = new URLSearchParams({ customer: customerId });
        if (parentId) query.set("parent_id", parentId);
        const result = await api(`/org-units/allowed-children/?${query.toString()}`);
        if (!cancelled) setAllowed(rows(result));
      } catch (e) {
        if (!cancelled) { setAllowed([]); setError(e.message); }
      }
    })();
    return () => { cancelled = true; };
  }, [customerId, parentId]);

  const updateType = (typeId, patch) => setConfig(current => ({
    ...current,
    types: current.types.map(item => Number(item.id) === Number(typeId) ? { ...item, ...patch } : item),
  }));

  const addRule = () => {
    if (!ruleForm.child_type_id) return;
    const parent = ruleForm.parent_type_id ? Number(ruleForm.parent_type_id) : null;
    const child = Number(ruleForm.child_type_id);
    const key = `${parent ?? "root"}:${child}`;
    if (config.rules.some(rule => `${rule.parent_type_id ?? "root"}:${rule.child_type_id}` === key)) return;
    setConfig(current => ({ ...current, rules: [...current.rules, { parent_type_id: parent, child_type_id: child, is_allowed: true }] }));
    setRuleForm({ parent_type_id: "", child_type_id: "" });
  };

  const removeRule = index => setConfig(current => ({ ...current, rules: current.rules.filter((_, i) => i !== index) }));

  const saveConfig = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/customers/${customerId}/org-config/`, {
        method: "PUT",
        body: JSON.stringify({
          types: config.types.map(item => ({ type_id: item.id, display_name: item.name, is_enabled: item.is_enabled, is_terminal: item.is_terminal })),
          rules: config.rules,
        }),
      });
      setNotice("Organisational hierarchy configuration saved.");
      await loadConfig(customerId);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const createUnit = async event => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const payload = {
        customer: Number(customerId),
        unit_type: Number(unitForm.unit_type),
        parent: parentId || null,
        name: unitForm.name.trim(),
        code: unitForm.code.trim(),
      };
      if (unitForm.latitude !== "") payload.latitude = unitForm.latitude;
      if (unitForm.longitude !== "") payload.longitude = unitForm.longitude;
      await api("/org-units/", { method: "POST", body: JSON.stringify(payload) });
      setNotice("Organisational unit created and connected to its selected parent.");
      setUnitForm({ unit_type: "", name: "", code: "", latitude: "", longitude: "" });
      await loadUnits(customerId);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const linkBranch = async event => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api(`/branches/${branchId}/`, { method: "PATCH", body: JSON.stringify({ org_unit: branchOrgUnitId }) });
      setNotice("Existing Branch linked to the selected organisational Branch unit. Its legacy parent and physical/IoT records were preserved.");
      setBranchId(""); setBranchOrgUnitId("");
      await loadUnits(customerId);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  if (loading) return <main className="generic-hierarchy-page"><p>Loading organisational hierarchy…</p></main>;

  return (
    <main className="generic-hierarchy-page">
      <header>
        <div>
          <h2><GitBranch size={22} /> Organisational Hierarchy</h2>
          <p>Configure the bank's organisational levels independently from its geographical hierarchy.</p>
        </div>
        <button type="button" className="gh-secondary-button" disabled={!customerId || busy} onClick={() => loadConfig(customerId)}><RefreshCw size={15} /> Refresh</button>
      </header>

      <section className="gh-info-panel">
        <Info size={18} />
        <div>
          <strong>Geographical hierarchy is kept separate.</strong>
          <p>This page is only for Zonal customers. Customers using State → District → Taluka → City → Branch continue using the existing Branch / Locations screens. This page does not create, edit, move or delete geographical records.</p>
        </div>
      </section>

      {noZonalCustomers ? (
        <section className="gh-panel"><h3>No Zonal customers found</h3><p>All your current customers may be using the Geographical hierarchy. Their branches remain available in the existing Branch's page. No generic organisational setup is needed for them.</p></section>
      ) : (
        <>
          <section className="gh-panel">
            <label className="gh-field">Bank / Customer
              <select value={customerId} onChange={async event => {
                const nextId = event.target.value; setCustomerId(nextId); setError(""); setNotice("");
                try { await loadConfig(nextId); } catch (e) { setError(e.message); }
              }}>
                {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.company || customer.name || customer.code}</option>)}
              </select>
            </label>
            <small>Only customers configured as ZONAL are shown here.</small>
          </section>

          {!!customerId && selectedCustomer?.hierarchy_type === "ZONAL" && <>
            <section className="gh-panel">
              <h3>1. Enable organisational unit types</h3>
              <p>Each created organisational unit has exactly one type. Enable only the types this bank actually uses.</p>
              <div className="gh-type-grid">
                {config.types.map(type => (
                  <label className="gh-type-card" key={type.id}>
                    <span><input type="checkbox" checked={!!type.is_enabled} onChange={event => updateType(type.id, { is_enabled: event.target.checked })} /> <strong>{type.name}</strong></span>
                    <small>{type.code}</small>
                    <span><input type="checkbox" checked={!!type.is_terminal} onChange={event => updateType(type.id, { is_terminal: event.target.checked })} /> Terminal / leaf type</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="gh-panel">
              <h3>2. Define allowed parent → child relationships</h3>
              <p>Choose an empty parent for a root type, such as Head Office. Rules control the type choices shown when creating units.</p>
              <div className="gh-rule-builder">
                <label className="gh-field">Parent type
                  <select value={ruleForm.parent_type_id} onChange={event => setRuleForm(current => ({ ...current, parent_type_id: event.target.value }))}>
                    <option value="">No parent (root)</option>
                    {enabledTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </label>
                <label className="gh-field">Child type
                  <select value={ruleForm.child_type_id} onChange={event => setRuleForm(current => ({ ...current, child_type_id: event.target.value }))}>
                    <option value="">Select child type</option>
                    {enabledTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </label>
                <button type="button" className="gh-primary-button" onClick={addRule} disabled={!ruleForm.child_type_id}><Plus size={15} /> Add rule</button>
              </div>
              <div className="gh-rule-list">
                {config.rules.map((rule, index) => {
                  const parent = config.types.find(type => Number(type.id) === Number(rule.parent_type_id));
                  const child = config.types.find(type => Number(type.id) === Number(rule.child_type_id));
                  return <div className="gh-rule-row" key={`${rule.parent_type_id ?? "root"}-${rule.child_type_id}-${index}`}>
                    <span>{parent?.name || "Root"}</span><span className="gh-rule-arrow">→</span><strong>{child?.name || rule.child_type}</strong>
                    <button type="button" className="gh-link-button" onClick={() => removeRule(index)}>Remove</button>
                  </div>;
                })}
                {!config.rules.length && <p className="gh-empty">No parent-child rules configured yet.</p>}
              </div>
              <button type="button" className="gh-primary-button" disabled={busy || !enabledTypes.length || !config.rules.length} onClick={saveConfig}><Save size={15} /> Save hierarchy configuration</button>
            </section>

            <section className="gh-panel">
              <h3>3. Create organisational units</h3>
              <p>Choose an existing parent. The available unit types are loaded from the saved parent-child rules.</p>
              <form className="gh-form" onSubmit={createUnit}>
                <label className="gh-field">Parent unit
                  <select value={parentId} onChange={event => { setParentId(event.target.value); setUnitForm(current => ({ ...current, unit_type: "" })); }}>
                    <option value="">No parent (root unit)</option>
                    {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name} — {unit.type_name || unit.type_code}</option>)}
                  </select>
                </label>
                <label className="gh-field">Unit type
                  <select required value={unitForm.unit_type} onChange={event => setUnitForm(current => ({ ...current, unit_type: event.target.value }))}>
                    <option value="">Select allowed type</option>
                    {allowed.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </label>
                <label className="gh-field">Unit name<input required maxLength={255} value={unitForm.name} onChange={event => setUnitForm(current => ({ ...current, name: event.target.value }))} /></label>
                <label className="gh-field">Unit code<input required maxLength={60} value={unitForm.code} onChange={event => setUnitForm(current => ({ ...current, code: event.target.value }))} /></label>
                <label className="gh-field">Latitude (optional)<input type="number" step="0.000001" value={unitForm.latitude} onChange={event => setUnitForm(current => ({ ...current, latitude: event.target.value }))} /></label>
                <label className="gh-field">Longitude (optional)<input type="number" step="0.000001" value={unitForm.longitude} onChange={event => setUnitForm(current => ({ ...current, longitude: event.target.value }))} /></label>
                <div className="gh-form-actions"><button type="submit" className="gh-primary-button" disabled={busy || !unitForm.unit_type}><Plus size={15} /> Create unit</button></div>
              </form>
              <h4>Saved organisational units</h4>
              <div className="gh-table-wrap"><table className="gh-table"><thead><tr><th>Name</th><th>Type</th><th>Parent</th><th>Code</th></tr></thead><tbody>
                {units.map(unit => <tr key={unit.id}><td>{unit.name}</td><td>{unit.type_name || unit.type_code}</td><td>{unit.parent_name || "—"}</td><td>{unit.code}</td></tr>)}
                {!units.length && <tr><td colSpan="4" className="gh-empty">No organisational units created yet.</td></tr>}
              </tbody></table></div>
            </section>

            <section className="gh-panel">
              <h3>4. Link existing Branch records (Zonal customers only)</h3>
              <p>Link a real Branch to its generic BO unit. This adds an organisational reference only; it does not change the Branch's existing legacy parent, geographical location, building, floor, room, site or device records.</p>
              <form className="gh-rule-builder" onSubmit={linkBranch}>
                <label className="gh-field">Existing Branch
                  <select required value={branchId} onChange={event => setBranchId(event.target.value)}><option value="">Select existing Branch</option>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>)}</select>
                </label>
                <label className="gh-field">Generic Branch unit (BO)
                  <select required value={branchOrgUnitId} onChange={event => setBranchOrgUnitId(event.target.value)}><option value="">Select BO unit</option>{units.filter(unit => unit.type_code === "BO").map(unit => <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>)}</select>
                </label>
                <button type="submit" className="gh-primary-button" disabled={busy || !branchId || !branchOrgUnitId}><Link2 size={15} /> Link existing Branch</button>
              </form>
            </section>
          </>}
        </>
      )}
      {notice && <p className="gh-notice" role="status">{notice}</p>}
      {error && <p className="gh-error" role="alert">{error}</p>}
    </main>
  );
}
