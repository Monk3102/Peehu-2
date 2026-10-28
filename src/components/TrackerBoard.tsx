import React, { useState } from 'react';
import {
  AnyRecord,
  University,
  Opening,
  Supervisor,
  TrackerStore,
  StageKey,
} from '../types';
import { Config, KANBAN_TYPE_LABEL } from '../config';
import { getUniversity } from '../utils/helpers';

interface TrackerBoardProps {
  tracker: TrackerStore;
  byId: Map<string, AnyRecord>;
  uniById: Map<string, University>;
  onUpdateStage: (id: string, status: StageKey | 'none') => void;
  onOpenDetails: (record: AnyRecord) => void;
}

export const TrackerBoard: React.FC<TrackerBoardProps> = ({
  tracker,
  byId,
  uniById,
  onUpdateStage,
  onOpenDetails,
}) => {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const trackedList = Object.entries(tracker)
    .filter(([, e]) => e.status && e.status !== 'none')
    .map(([id, entry]) => {
      const record = byId.get(id) || ({ id, title: id, _t: 'openings' } as AnyRecord);
      const uni = getUniversity(record, uniById);
      return { id, entry, record, uni };
    });

  const totalCount = trackedList.length;
  const contactedCount = trackedList.filter((i) =>
    ['emailed', 'replied'].includes(i.entry.status)
  ).length;
  const interviewCount = trackedList.filter((i) => i.entry.status === 'interview').length;
  const offerCount = trackedList.filter((i) => i.entry.status === 'offer').length;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== stageKey) {
      setDragOverCol(stageKey);
    }
  };

  const handleDrop = (e: React.DragEvent, stageKey: StageKey) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggingId(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id && tracker[id] && tracker[id].status !== stageKey) {
      onUpdateStage(id, stageKey);
    }
  };

  return (
    <div className="tracker-view">
      <div className="tracker-metrics">
        <div className="metric-card">
          <div className="metric-label">Total Applications</div>
          <div className="metric-val">{totalCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label" style={{ color: 'var(--primary)' }}>
            Contacted / Discussion
          </div>
          <div className="metric-val" style={{ color: 'var(--primary)' }}>
            {contactedCount}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label" style={{ color: 'var(--amber)' }}>
            Interviews
          </div>
          <div className="metric-val" style={{ color: 'var(--amber)' }}>
            {interviewCount}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label" style={{ color: 'var(--emerald)' }}>
            Offers
          </div>
          <div className="metric-val" style={{ color: 'var(--emerald)' }}>
            {offerCount}
          </div>
        </div>
      </div>

      <div className="type-legend">
        <span>
          <i style={{ background: 'var(--c-openings)' }} />
          Opening
        </span>
        <span>
          <i style={{ background: 'var(--c-universities)' }} />
          University
        </span>
        <span>
          <i style={{ background: 'var(--c-supervisors)' }} />
          Supervisor
        </span>
      </div>

      <div className="kanban-board">
        {Config.stages.map((stg) => {
          const items = trackedList.filter((i) => i.entry.status === stg.key);
          const isOver = dragOverCol === stg.key;

          return (
            <div
              key={stg.key}
              className={`kanban-col ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, stg.key)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol(null);
                }
              }}
              onDrop={(e) => handleDrop(e, stg.key)}
            >
              <div className="kanban-col-head">
                <span style={{ color: stg.color }}>● {stg.label}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-subtle)',
                  }}
                >
                  {items.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map((i) => {
                  const rType = i.record._t;
                  const title =
                    (i.record as Opening).title ||
                    (i.record as Supervisor).name ||
                    i.id;

                  return (
                    <div
                      key={i.id}
                      className={`kanban-card ${draggingId === i.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, i.id)}
                      onDragEnd={handleDragEnd}
                      data-type={rType}
                    >
                      {rType && (
                        <div className="kanban-type">
                          {KANBAN_TYPE_LABEL[rType] || rType}
                        </div>
                      )}
                      <strong style={{ fontSize: '12px', lineHeight: 1.3 }}>
                        {title}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {i.uni ? i.uni.name : ''}
                      </div>
                      {i.entry.follow && (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--amber)',
                          }}
                        >
                          ⏰ Follow: {i.entry.follow}
                        </div>
                      )}
                      <div className="kanban-actions">
                        <button
                          type="button"
                          className="btn-kanban"
                          onClick={() => onOpenDetails(i.record)}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          className="btn-kanban btn-remove-stage"
                          onClick={() => onUpdateStage(i.id, 'none')}
                          title="Remove from application stage"
                        >
                          🗑 Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
