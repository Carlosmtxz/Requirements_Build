import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { LINE_STAGES } from './lib/stages'
import './Submissions.css'

function DetailModal({ sub, onClose }) {
  if (!sub) return null
  const mc = sub.machine_config || {}

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <div>
            <div className="modal-title">{sub.company}</div>
            <div className="modal-sub">{new Date(sub.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {sub.sales_rep}</div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fa fa-times" /></button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-label">Contact</div>
            <div className="detail-row"><span>{sub.contact}</span><span>{sub.phone}</span><span>{sub.email}</span></div>
            <div className="detail-row"><span><i className="fa fa-location-dot" /> {sub.location}</span></div>
          </div>

          <div className="detail-section">
            <div className="detail-label">Layout</div>
            <div className="detail-row">
              {sub.floor_length && <span>{sub.floor_length} × {sub.floor_width} ft floor</span>}
              {sub.ceiling_height && <span>{sub.ceiling_height} ft ceiling</span>}
              {sub.infeed_direction && <span>Infeed: {sub.infeed_direction}</span>}
            </div>
            {sub.layout_notes && <p className="detail-notes">{sub.layout_notes}</p>}
          </div>

          <div className="detail-section">
            <div className="detail-label">Machine configuration</div>
            {LINE_STAGES.map(stage => {
              const data = mc[stage.key]
              if (!data) return null
              if (stage.mode === 'yn' && !data.yn) return null
              if (stage.mode === 'multi' && (!data.items || data.items.length === 0)) return null
              return (
                <div key={stage.key} className="detail-stage">
                  <span className="detail-stage-dot" style={{ background: stage.dot }} />
                  <div>
                    <div className="detail-stage-name">{stage.label}</div>
                    {stage.mode === 'yn' ? (
                      <div className="detail-stage-item">
                        {data.yn === 'yes' ? `Yes${data.manufacturer ? ' — ' + data.manufacturer : ''}` : 'No'}
                      </div>
                    ) : data.items.map((item, i) => (
                      <div key={i} className="detail-stage-item">
                        {item.type}{item.manufacturer ? ` — ${item.manufacturer}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="detail-section">
            <div className="detail-label">Commodities</div>
            <div className="detail-row">
              {sub.commodity_type && <span>{sub.commodity_type}</span>}
              {sub.commodity_condition && <span>{sub.commodity_condition}</span>}
              {(sub.piece_size_min || sub.piece_size_max) && <span>{sub.piece_size_min}"–{sub.piece_size_max}" piece size</span>}
            </div>
            {sub.handling_notes && <p className="detail-notes">{sub.handling_notes}</p>}
          </div>

          {sub.bag_sizes && sub.bag_sizes.filter(b => b.description).length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Bag sizes</div>
              {sub.bag_sizes.filter(b => b.description).map((bag, i) => (
                <div key={i} className="detail-stage-item">{bag.description}{bag.width ? ` — ${bag.width}" × ${bag.length}"` : ''}</div>
              ))}
            </div>
          )}

          <div className="detail-section">
            <div className="detail-label">Power</div>
            <div className="detail-row">
              {sub.voltage && <span>{sub.voltage}</span>}
            </div>
            {sub.special_requirements && <p className="detail-notes">{sub.special_requirements}</p>}
          </div>

          {sub.photos && Object.keys(sub.photos).length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Photos</div>
              <div className="photos-grid">
                {Object.values(sub.photos).flat().map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Submission photo ${i + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Submissions() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setSubs(data || []); setLoading(false) })
  }, [])

  const filtered = subs.filter(s =>
    !search ||
    s.company?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact?.toLowerCase().includes(search.toLowerCase()) ||
    s.sales_rep?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="sub-page">
      <div className="sub-header">
        <div className="sub-header-left">
          <div className="app-logo">FOX</div>
          <div>
            <div className="sub-title">Submissions</div>
            <div className="sub-count">{subs.length} total</div>
          </div>
        </div>
        <a href="/" className="new-btn"><i className="fa fa-plus" /> New form</a>
      </div>

      <div className="search-bar">
        <i className="fa fa-magnifying-glass" />
        <input
          type="search"
          placeholder="Search by company, contact, location, or rep..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading"><i className="fa fa-spinner fa-spin" /> Loading submissions...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <i className="fa fa-inbox" />
          <p>{search ? 'No results for that search.' : 'No submissions yet. Share the form link with your sales team.'}</p>
        </div>
      ) : (
        <div className="sub-list">
          {filtered.map(sub => {
            const mc = sub.machine_config || {}
            const machineCount = LINE_STAGES.reduce((n, s) => {
              const d = mc[s.key]
              if (!d) return n
              if (s.mode === 'yn') return d.yn === 'yes' ? n + 1 : n
              return n + (d.items?.length || 0)
            }, 0)
            const photoCount = sub.photos ? Object.values(sub.photos).flat().length : 0
            return (
              <div key={sub.id} className="sub-card" onClick={() => setSelected(sub)}>
                <div className="sub-card-hdr">
                  <div className="sub-company">{sub.company}</div>
                  <div className="sub-date">{new Date(sub.created_at).toLocaleDateString()}</div>
                </div>
                <div className="sub-meta">
                  {sub.contact && <span><i className="fa fa-user" /> {sub.contact}</span>}
                  {sub.location && <span><i className="fa fa-location-dot" /> {sub.location}</span>}
                  {sub.sales_rep && <span><i className="fa fa-id-badge" /> {sub.sales_rep}</span>}
                </div>
                <div className="sub-tags">
                  {sub.voltage && <span className="tag">{sub.voltage}</span>}
                  {sub.commodity_type && <span className="tag">{sub.commodity_type}</span>}
                  {machineCount > 0 && <span className="tag">{machineCount} machine{machineCount !== 1 ? 's' : ''}</span>}
                  {photoCount > 0 && <span className="tag tag-photo"><i className="fa fa-camera" /> {photoCount}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && <DetailModal sub={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
