import { useState, useRef } from 'react'
import { supabase } from './lib/supabase'
import { LINE_STAGES } from './lib/stages'
import './App.css'

const SECTION_PHOTOS_KEYS = ['customer', 'layout', 'commodities', 'bags', 'power']

function PhotoStrip({ sectionKey, photos, onAdd, onRemove }) {
  const inputRef = useRef()
  return (
    <div className="photo-strip">
      <div className="photo-strip-label">
        <i className="fa fa-camera" /> Photos
      </div>
      <div className="photo-drop-sm" onClick={() => inputRef.current.click()}>
        <i className="fa fa-image" />
        <span>Tap to attach photos</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => { onAdd(Array.from(e.target.files)); e.target.value = '' }}
      />
      {photos.length > 0 && (
        <div className="photo-grid-sm">
          {photos.map((src, i) => (
            <div key={i} className="photo-thumb">
              <img src={src} alt={`Photo ${i + 1}`} />
              <button className="del-photo" onClick={() => onRemove(i)} aria-label="Remove photo">
                <i className="fa fa-times" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StageSection({ stage, stageData, onChange, photos, onAddPhotos, onRemovePhoto }) {
  const [open, setOpen] = useState(true)

  const addEquip = (val) => {
    if (!val) return
    const def = stage.equipment.find(e => e.key === val)
    onChange({
      ...stageData,
      items: [...(stageData.items || []), { type: def?.label || val, manufacturer: '' }]
    })
  }

  const removeEquip = (i) => {
    const items = [...(stageData.items || [])]
    items.splice(i, 1)
    onChange({ ...stageData, items })
  }

  const updateEquip = (i, field, val) => {
    const items = [...(stageData.items || [])]
    items[i] = { ...items[i], [field]: val }
    onChange({ ...stageData, items })
  }

  const setYN = (val) => onChange({ ...stageData, yn: val, manufacturer: val === 'no' ? '' : stageData.manufacturer })

  const count = stage.mode === 'yn'
    ? (stageData.yn === 'yes' ? 1 : 0)
    : (stageData.items || []).length

  return (
    <div className="stage-section">
      <div className="stage-hdr" onClick={() => setOpen(!open)}>
        <div className="stage-title">
          <span className="stage-dot" style={{ background: stage.dot }} />
          <i className={`fa fa-${stage.icon}`} />
          {stage.label}
          {count > 0 && <span className="stage-count">({count})</span>}
        </div>
        <i className={`fa fa-chevron-down stage-chevron ${open ? 'open' : ''}`} />
      </div>
      {open && (
        <div className="stage-body">
          {stage.mode === 'yn' ? (
            <>
              <div className="yn-row">
                <span className="yn-label">{stage.ynLabel}</span>
                <button
                  className={`yn-btn ${stageData.yn === 'yes' ? 'active-yes' : ''}`}
                  onClick={() => setYN('yes')}
                  type="button"
                >Yes</button>
                <button
                  className={`yn-btn ${stageData.yn === 'no' ? 'active-no' : ''}`}
                  onClick={() => setYN('no')}
                  type="button"
                >No</button>
              </div>
              {stageData.yn === 'yes' && (
                <div className="frow solo" style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>{stage.mfrLabel}</label>
                    <input
                      type="text"
                      placeholder="Brand / make"
                      value={stageData.manufacturer || ''}
                      onChange={e => onChange({ ...stageData, manufacturer: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {(stageData.items || []).map((item, i) => (
                <div className="equip-card" key={i}>
                  <div className="field">
                    <label>Type</label>
                    <input
                      type="text"
                      value={item.type}
                      onChange={e => updateEquip(i, 'type', e.target.value)}
                      placeholder="Equipment type"
                    />
                  </div>
                  <div className="field">
                    <label>Manufacturer</label>
                    <input
                      type="text"
                      value={item.manufacturer}
                      onChange={e => updateEquip(i, 'manufacturer', e.target.value)}
                      placeholder="Brand / make"
                    />
                  </div>
                  <button className="rm-btn" onClick={() => removeEquip(i)} type="button" aria-label="Remove">
                    <i className="fa fa-trash" />
                  </button>
                </div>
              ))}
              <div className="equip-adder">
                <select
                  defaultValue=""
                  onChange={e => { addEquip(e.target.value); e.target.value = '' }}
                >
                  <option value="" disabled>Select equipment to add...</option>
                  {stage.equipment.map(e => (
                    <option key={e.key} value={e.key}>{e.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <PhotoStrip
            sectionKey={`stage-${stage.key}`}
            photos={photos}
            onAdd={onAddPhotos}
            onRemove={onRemovePhoto}
          />
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, iconClass, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="section">
      <div className="sec-hdr" onClick={() => setOpen(!open)}>
        <div className="sec-title">
          <div className={`sec-icon ${iconClass}`}><i className={`fa fa-${icon}`} /></div>
          {title}
        </div>
        <i className={`fa fa-chevron-down chevron ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="sec-body">{children}</div>}
    </div>
  )
}

const defaultMachineConfig = () =>
  Object.fromEntries(LINE_STAGES.map(s => [s.key, s.mode === 'yn' ? { yn: '', manufacturer: '' } : { items: [] }]))

export default function App() {
  const [form, setForm] = useState({
    company: '', contact: '', phone: '', email: '', location: '', sales_rep: '',
    floor_length: '', floor_width: '', ceiling_height: '',
    infeed_direction: '', discharge_direction: '', layout_notes: '',
    machine_config: defaultMachineConfig(),
    commodity_type: '', commodity_condition: '', piece_size_min: '', piece_size_max: '', handling_notes: '',
    bag_sizes: [{ description: '', width: '', length: '' }],
    voltage: '', special_requirements: '',
  })

  const [sectionPhotos, setSectionPhotos] = useState(
    Object.fromEntries([
      ...SECTION_PHOTOS_KEYS.map(k => [k, []]),
      ...LINE_STAGES.map(s => [`stage-${s.key}`, []])
    ])
  )

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const addPhoto = (sectionKey, files) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setSectionPhotos(p => ({ ...p, [sectionKey]: [...(p[sectionKey] || []), ev.target.result] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (sectionKey, i) => {
    setSectionPhotos(p => {
      const arr = [...(p[sectionKey] || [])]
      arr.splice(i, 1)
      return { ...p, [sectionKey]: arr }
    })
  }

  const addBag = () => set('bag_sizes', [...form.bag_sizes, { description: '', width: '', length: '' }])
  const removeBag = (i) => {
    const bags = [...form.bag_sizes]
    bags.splice(i, 1)
    set('bag_sizes', bags)
  }
  const updateBag = (i, field, val) => {
    const bags = [...form.bag_sizes]
    bags[i] = { ...bags[i], [field]: val }
    set('bag_sizes', bags)
  }

  const updateMachineStage = (stageKey, data) => {
    set('machine_config', { ...form.machine_config, [stageKey]: data })
  }

  const uploadPhotosToSupabase = async () => {
    const allPhotos = {}
    for (const [sectionKey, photos] of Object.entries(sectionPhotos)) {
      const urls = []
      for (const dataUrl of photos) {
        const blob = await fetch(dataUrl).then(r => r.blob())
        const filename = `${sectionKey}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const { data, error } = await supabase.storage
          .from('submission-photos')
          .upload(filename, blob, { contentType: 'image/jpeg' })
        if (!error) {
          const { data: urlData } = supabase.storage.from('submission-photos').getPublicUrl(filename)
          urls.push(urlData.publicUrl)
        }
      }
      if (urls.length) allPhotos[sectionKey] = urls
    }
    return allPhotos
  }

  const handleSubmit = async () => {
    if (!form.company.trim()) { setError('Company name is required.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const photos = await uploadPhotosToSupabase()
      const { error: dbError } = await supabase.from('submissions').insert([{
        company: form.company,
        contact: form.contact,
        phone: form.phone,
        email: form.email,
        location: form.location,
        sales_rep: form.sales_rep,
        floor_length: form.floor_length || null,
        floor_width: form.floor_width || null,
        ceiling_height: form.ceiling_height || null,
        infeed_direction: form.infeed_direction,
        discharge_direction: form.discharge_direction,
        layout_notes: form.layout_notes,
        machine_config: form.machine_config,
        commodity_type: form.commodity_type,
        commodity_condition: form.commodity_condition,
        piece_size_min: form.piece_size_min || null,
        piece_size_max: form.piece_size_max || null,
        handling_notes: form.handling_notes,
        bag_sizes: form.bag_sizes,
        voltage: form.voltage,
        special_requirements: form.special_requirements,
        photos,
      }])
      if (dbError) throw dbError
      setSubmitted(true)
    } catch (e) {
      setError('Submission failed: ' + e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const progressFields = [
    form.company,
    form.floor_length,
    LINE_STAGES.some(s => {
      const d = form.machine_config[s.key]
      return s.mode === 'yn' ? d.yn !== '' : d.items?.length > 0
    }) ? '1' : '',
    form.commodity_type,
    form.bag_sizes.some(b => b.description) ? '1' : '',
    form.voltage,
  ]
  const progress = progressFields.filter(Boolean).length
  const progressPct = Math.round((progress / 6) * 100)

  if (submitted) {
    return (
      <div className="success-screen">
        <div className="success-card">
          <div className="success-icon"><i className="fa fa-circle-check" /></div>
          <h2>Requirements submitted</h2>
          <p>The quote for <strong>{form.company}</strong> has been saved successfully.</p>
          <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ company: '', contact: '', phone: '', email: '', location: '', sales_rep: '', floor_length: '', floor_width: '', ceiling_height: '', infeed_direction: '', discharge_direction: '', layout_notes: '', machine_config: defaultMachineConfig(), commodity_type: '', commodity_condition: '', piece_size_min: '', piece_size_max: '', handling_notes: '', bag_sizes: [{ description: '', width: '', length: '' }], voltage: '', special_requirements: '' }); setSectionPhotos(Object.fromEntries([...SECTION_PHOTOS_KEYS.map(k => [k, []]), ...LINE_STAGES.map(s => [`stage-${s.key}`, []])])) }}>
            Start new form
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-header-left">
          <div className="app-logo">FOX</div>
          <div>
            <div className="app-title">Customer Requirements</div>
            <div className="app-sub">{progress} of 6 sections filled</div>
          </div>
        </div>
        <a href="/submissions" className="submissions-link">
          <i className="fa fa-table-list" /> View all
        </a>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <Section title="Customer info" icon="user" iconClass="ic-purple">
        <div className="frow">
          <div className="field"><label>Company name *</label><input type="text" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Produce Co." /></div>
          <div className="field"><label>Contact name</label><input type="text" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="John Smith" /></div>
        </div>
        <div className="frow">
          <div className="field"><label>Phone</label><input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@acme.com" /></div>
        </div>
        <div className="frow">
          <div className="field"><label>Location / facility</label><input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, State" /></div>
          <div className="field"><label>Sales rep</label><input type="text" value={form.sales_rep} onChange={e => set('sales_rep', e.target.value)} placeholder="Your name" /></div>
        </div>
        <PhotoStrip sectionKey="customer" photos={sectionPhotos.customer} onAdd={f => addPhoto('customer', f)} onRemove={i => removePhoto('customer', i)} />
      </Section>

      <Section title="Layout & dimensions" icon="ruler" iconClass="ic-teal">
        <div className="frow trio">
          <div className="field"><label>Floor length (ft)</label><input type="number" value={form.floor_length} onChange={e => set('floor_length', e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Floor width (ft)</label><input type="number" value={form.floor_width} onChange={e => set('floor_width', e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Ceiling height (ft)</label><input type="number" value={form.ceiling_height} onChange={e => set('ceiling_height', e.target.value)} placeholder="0" /></div>
        </div>
        <div className="frow">
          <div className="field"><label>Infeed direction</label>
            <select value={form.infeed_direction} onChange={e => set('infeed_direction', e.target.value)}>
              <option value="">Select...</option>
              <option>Left to right</option><option>Right to left</option><option>Flexible</option>
            </select>
          </div>
          <div className="field"><label>Discharge direction</label>
            <select value={form.discharge_direction} onChange={e => set('discharge_direction', e.target.value)}>
              <option value="">Select...</option>
              <option>Left to right</option><option>Right to left</option><option>Flexible</option>
            </select>
          </div>
        </div>
        <div className="frow solo">
          <div className="field"><label>Notes / obstacles</label><textarea value={form.layout_notes} onChange={e => set('layout_notes', e.target.value)} placeholder="Columns, doors, conveyor heights, floor drains..." /></div>
        </div>
        <PhotoStrip sectionKey="layout" photos={sectionPhotos.layout} onAdd={f => addPhoto('layout', f)} onRemove={i => removePhoto('layout', i)} />
      </Section>

      <Section title="Machine configuration" icon="gears" iconClass="ic-blue">
        {LINE_STAGES.map(stage => (
          <StageSection
            key={stage.key}
            stage={stage}
            stageData={form.machine_config[stage.key]}
            onChange={data => updateMachineStage(stage.key, data)}
            photos={sectionPhotos[`stage-${stage.key}`] || []}
            onAddPhotos={f => addPhoto(`stage-${stage.key}`, f)}
            onRemovePhoto={i => removePhoto(`stage-${stage.key}`, i)}
          />
        ))}
      </Section>

      <Section title="Commodities" icon="leaf" iconClass="ic-green">
        <div className="frow">
          <div className="field"><label>Commodity type</label><input type="text" value={form.commodity_type} onChange={e => set('commodity_type', e.target.value)} placeholder="Grapes, citrus, apples..." /></div>
          <div className="field"><label>Condition</label>
            <select value={form.commodity_condition} onChange={e => set('commodity_condition', e.target.value)}>
              <option value="">Select...</option>
              <option>Fresh / dry</option><option>Wet / washed</option><option>Frozen</option><option>Mixed</option>
            </select>
          </div>
        </div>
        <div className="frow">
          <div className="field"><label>Min piece size (in)</label><input type="number" step="0.1" value={form.piece_size_min} onChange={e => set('piece_size_min', e.target.value)} placeholder="0" /></div>
          <div className="field"><label>Max piece size (in)</label><input type="number" step="0.1" value={form.piece_size_max} onChange={e => set('piece_size_max', e.target.value)} placeholder="0" /></div>
        </div>
        <div className="frow solo">
          <div className="field"><label>Handling notes</label><textarea value={form.handling_notes} onChange={e => set('handling_notes', e.target.value)} placeholder="Bruising sensitivity, stem length, cluster size, sticky residue..." /></div>
        </div>
        <PhotoStrip sectionKey="commodities" photos={sectionPhotos.commodities} onAdd={f => addPhoto('commodities', f)} onRemove={i => removePhoto('commodities', i)} />
      </Section>

      <Section title="Bag sizes" icon="box-open" iconClass="ic-amber">
        {form.bag_sizes.map((bag, i) => (
          <div key={i} className="bag-row">
            <div className="field"><label>Description</label><input type="text" value={bag.description} onChange={e => updateBag(i, 'description', e.target.value)} placeholder="e.g. 2lb grape bag" /></div>
            <div className="field"><label>Width (in)</label><input type="number" step="0.1" value={bag.width} onChange={e => updateBag(i, 'width', e.target.value)} placeholder="0" /></div>
            <div className="field"><label>Length (in)</label><input type="number" step="0.1" value={bag.length} onChange={e => updateBag(i, 'length', e.target.value)} placeholder="0" /></div>
            {form.bag_sizes.length > 1 && (
              <button className="rm-btn" onClick={() => removeBag(i)} type="button" aria-label="Remove"><i className="fa fa-trash" /></button>
            )}
          </div>
        ))}
        <button className="add-btn" onClick={addBag} type="button"><i className="fa fa-plus" /> Add bag size</button>
        <PhotoStrip sectionKey="bags" photos={sectionPhotos.bags} onAdd={f => addPhoto('bags', f)} onRemove={i => removePhoto('bags', i)} />
      </Section>

      <Section title="Power & special requirements" icon="bolt" iconClass="ic-coral">
        <div className="frow solo">
          <div className="field"><label>Supply voltage</label>
            <select value={form.voltage} onChange={e => set('voltage', e.target.value)}>
              <option value="">Select...</option>
              <option>240V / 1-phase</option>
              <option>240V / 3-phase</option>
            </select>
          </div>
        </div>
        <div className="frow solo">
          <div className="field"><label>Special requirements</label><textarea value={form.special_requirements} onChange={e => set('special_requirements', e.target.value)} placeholder="Washdown rating, USDA/NSF compliance, noise limits, labeling integration, reject conveyor..." /></div>
        </div>
        <PhotoStrip sectionKey="power" photos={sectionPhotos.power} onAdd={f => addPhoto('power', f)} onRemove={i => removePhoto('power', i)} />
      </Section>

      {error && <div className="error-banner"><i className="fa fa-circle-exclamation" /> {error}</div>}

      <div className="footer-bar">
        <button className="btn-secondary" onClick={() => { if (window.confirm('Clear all form data?')) { setForm({ company: '', contact: '', phone: '', email: '', location: '', sales_rep: '', floor_length: '', floor_width: '', ceiling_height: '', infeed_direction: '', discharge_direction: '', layout_notes: '', machine_config: defaultMachineConfig(), commodity_type: '', commodity_condition: '', piece_size_min: '', piece_size_max: '', handling_notes: '', bag_sizes: [{ description: '', width: '', length: '' }], voltage: '', special_requirements: '' }); setSectionPhotos(Object.fromEntries([...SECTION_PHOTOS_KEYS.map(k => [k, []]), ...LINE_STAGES.map(s => [`stage-${s.key}`, []])])) } }} type="button">Clear</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting} type="button">
          {submitting ? <><i className="fa fa-spinner fa-spin" /> Submitting...</> : <><i className="fa fa-paper-plane" /> Submit requirements</>}
        </button>
      </div>
    </div>
  )
}
