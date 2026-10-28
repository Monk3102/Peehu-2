import React, { useState, useEffect } from 'react';
import {
  AnyRecord,
  University,
  Opening,
  Supervisor,
  TrackerEntry,
  ResearchWork,
  StageKey,
} from '../types';
import { Config, TYPE_LABEL } from '../config';
import { daysLeftText, getUniversity } from '../utils/helpers';

interface DetailDrawerProps {
  record: AnyRecord | null;
  uniById: Map<string, University>;
  supByUni: Map<string, Supervisor[]>;
  trackerEntry?: TrackerEntry;
  onClose: () => void;
  onUpdateStage: (id: string, status: StageKey | 'none') => void;
  onUpdateDates: (
    id: string,
    updates: { follow?: string; interviewDate?: string }
  ) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  record,
  uniById,
  supByUni,
  trackerEntry,
  onClose,
  onUpdateStage,
  onUpdateDates,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'tracker'>(
    'overview'
  );

  useEffect(() => {
    setActiveTab('overview');
  }, [record?.id]);

  if (!record) return null;

  const uni = getUniversity(record, uniById);
  const isOpening = record._t === 'openings';
  const isSupervisor = record._t === 'supervisors';

  const typeLabel = isOpening
    ? TYPE_LABEL.openings
    : isSupervisor
    ? TYPE_LABEL.supervisors
    : TYPE_LABEL.universities;

  const title = (record as Opening).title || (record as Supervisor).name || '';

  const portalUrl =
    (record as Opening).applyUrl ||
    (record as Supervisor).staffPageUrl ||
    (record as University).phdProgramUrl ||
    (record as Opening).sourceUrl ||
    record.url ||
    uni?.url;

  const isTracked = trackerEntry && trackerEntry.status && trackerEntry.status !== 'none';

  // Compute research work
  let rw: ResearchWork | undefined = (record as Opening | Supervisor).researchWork;
  if (record._t === 'universities') {
    const sups = supByUni.get(record.id) || [];
    rw = {
      researchAreas: record.subfields,
      groupsAndSupervisors: sups.map((sp) => ({
        name: sp.name,
        group: sp.group,
        summary: sp.researchWork?.summary || '',
      })),
    };
  }

  const hasRw =
    rw &&
    (rw.description ||
      rw.summary ||
      (rw.researchAreas && rw.researchAreas.length > 0) ||
      (rw.groupsAndSupervisors && rw.groupsAndSupervisors.length > 0));

  const deadline = (record as Opening).deadline;
  const deadlineNote = (record as Opening).deadlineNote || (record as University).deadlineNote;
  const group = (record as Supervisor).group || (record as Opening).group;
  const funding = (record as Opening | University).funding;
  const programType = (record as Opening | University).programType;
  const takingStudents = (record as Supervisor).takingStudents;
  const description = (record as Opening).description;
  const subfields = record.subfields || [];

  return (
    <div
      className="drawer-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <button
            className="drawer-close"
            onClick={onClose}
            title="Close"
            type="button"
          >
            ✕
          </button>
          <div className="drawer-type">{typeLabel}</div>
          <h2 className="drawer-title">{title}</h2>
          <div className="drawer-sub">
            {uni ? `${uni.name} · ${uni.city ? uni.city + ' ' : ''}${uni.country}` : ''}
          </div>
          <div className="drawer-actions">
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-drawer-pri"
              >
                Apply / Portal ↗
              </a>
            )}
            {isTracked && (
              <button
                className="btn-remove-stage-drawer"
                onClick={() => onUpdateStage(record.id, 'none')}
                type="button"
              >
                🗑 Remove from Stage
              </button>
            )}
          </div>
        </div>

        <div className="drawer-nav">
          <button
            type="button"
            className={`drawer-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          {hasRw && (
            <button
              type="button"
              className={`drawer-nav-btn ${activeTab === 'research' ? 'active' : ''}`}
              onClick={() => setActiveTab('research')}
            >
              Research Work
            </button>
          )}
          <button
            type="button"
            className={`drawer-nav-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            Stage &amp; Notes
          </button>
        </div>

        <div className="drawer-body">
          {activeTab === 'overview' && (
            <>
              <div className="section-card">
                <div className="section-title">Key Information</div>
                <div className="fact-grid">
                  {deadline && (
                    <>
                      <div className="fact-label">Deadline</div>
                      <div style={{ fontWeight: 700, color: '#fbbf24' }}>
                        {deadline} · {daysLeftText(deadline)}
                      </div>
                    </>
                  )}
                  {deadlineNote && (
                    <>
                      <div className="fact-label">Deadlines</div>
                      <div>{deadlineNote}</div>
                    </>
                  )}
                  {group && (
                    <>
                      <div className="fact-label">Group</div>
                      <div>{group}</div>
                    </>
                  )}
                  {uni && (
                    <>
                      <div className="fact-label">University</div>
                      <div>{uni.name}</div>
                    </>
                  )}
                  {uni?.country && (
                    <>
                      <div className="fact-label">Country</div>
                      <div>{uni.country}</div>
                    </>
                  )}
                  {funding && (
                    <>
                      <div className="fact-label">Funding</div>
                      <div>{funding}</div>
                    </>
                  )}
                  {programType && (
                    <>
                      <div className="fact-label">Program Type</div>
                      <div>{programType}</div>
                    </>
                  )}
                  {takingStudents != null && (
                    <>
                      <div className="fact-label">Students</div>
                      <div>
                        {takingStudents
                          ? '✅ Taking Students'
                          : '❌ Not currently taking students'}
                      </div>
                    </>
                  )}
                  {record.uncertain && (
                    <>
                      <div className="fact-label">Note</div>
                      <div style={{ color: '#fbbf24' }}>
                        ⚠ Some details are unconfirmed. Check the source page.
                      </div>
                    </>
                  )}
                </div>
              </div>

              {description && (
                <div className="section-card">
                  <div className="section-title">Project Overview</div>
                  <div className="body-text">{description}</div>
                </div>
              )}

              {subfields.length > 0 && (
                <div className="section-card">
                  <div className="section-title">Topics &amp; Subfields</div>
                  <div className="tag-row">
                    {subfields.map((s) => (
                      <span key={s} className="tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'research' && rw && (
            <>
              <div className="section-card">
                <div className="section-title">Department Research Overview</div>
                <div className="body-text">
                  {rw.description ||
                    rw.summary ||
                    'Research work overview available on departmental portal.'}
                </div>
              </div>

              {rw.researchAreas && rw.researchAreas.length > 0 && (
                <div className="section-card">
                  <div className="section-title">Core Research Themes</div>
                  <div className="tag-row">
                    {rw.researchAreas.map((a) => (
                      <span
                        key={a}
                        className="tag"
                        style={{
                          background: '#172554',
                          color: '#93c5fd',
                          borderColor: '#1e3a8a',
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rw.groupsAndSupervisors && rw.groupsAndSupervisors.length > 0 && (
                <div className="section-card">
                  <div className="section-title">
                    Research Groups &amp; Faculty Summaries
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rw.groupsAndSupervisors.map((g, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px',
                          background: '#090e1a',
                          borderRadius: '6px',
                          border: '1px solid #223354',
                        }}
                      >
                        <strong style={{ color: '#60a5fa', fontSize: '12px' }}>
                          {g.name || g.group}
                        </strong>
                        {g.group && (
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#64748b',
                              marginTop: '2px',
                            }}
                          >
                            {g.group}
                          </div>
                        )}
                        {g.summary && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              marginTop: '2px',
                            }}
                          >
                            {g.summary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'tracker' && (
            <>
              <div className="section-card">
                <div className="section-title">Application Pipeline Stage</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                  }}
                >
                  {Config.stages.map((s) => {
                    const isCurrent = trackerEntry?.status === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        className="stage-btn"
                        onClick={() => onUpdateStage(record.id, s.key)}
                        style={{
                          border: `1px solid ${isCurrent ? s.color : '#223354'}`,
                          background: isCurrent ? '#1e1b4b' : '#090e1a',
                          color: isCurrent ? '#c084fc' : '#94a3b8',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {isTracked && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateStage(record.id, 'none')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      🗑 Clear and Remove from Pipeline
                    </button>
                  </div>
                )}
              </div>

              <div className="section-card">
                <div className="section-title">Follow-up &amp; Interview Dates</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      Follow-up Due Date
                    </label>
                    <input
                      type="date"
                      value={trackerEntry?.follow || ''}
                      onChange={(e) =>
                        onUpdateDates(record.id, { follow: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#090e1a',
                        border: '1px solid #223354',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      Interview Date
                    </label>
                    <input
                      type="date"
                      value={trackerEntry?.interviewDate || ''}
                      onChange={(e) =>
                        onUpdateDates(record.id, { interviewDate: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#090e1a',
                        border: '1px solid #223354',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
