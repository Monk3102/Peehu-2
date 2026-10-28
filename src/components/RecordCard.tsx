import React from 'react';
import { AnyRecord, University, Opening, Supervisor, TrackerEntry } from '../types';
import { Config } from '../config';
import { daysLeft, daysLeftText, getUniversity } from '../utils/helpers';

interface RecordCardProps {
  record: AnyRecord;
  uniById: Map<string, University>;
  trackerEntry?: TrackerEntry;
  onClick: (record: AnyRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  uniById,
  trackerEntry,
  onClick,
}) => {
  const uni = getUniversity(record, uniById);
  const title = (record as Opening).title || (record as Supervisor).name || '';
  const stageKey = trackerEntry?.status;
  const stage =
    stageKey && stageKey !== 'none'
      ? Config.stages.find((s) => s.key === stageKey)
      : null;

  const deadline = (record as Opening).deadline;
  let deadlineTag: React.ReactNode = null;
  if (deadline) {
    const left = daysLeft(deadline);
    const cls =
      left < 0
        ? 'deadline-passed'
        : left <= 7
        ? 'deadline-urgent'
        : 'deadline-open';
    deadlineTag = (
      <span className={`tag ${cls}`}>
        📅 {deadline} · {daysLeftText(deadline)}
      </span>
    );
  }

  const stageBadge = stage ? (
    <span className="tag stage-badge">★ {stage.label}</span>
  ) : null;

  const subfields = (record.subfields || []).slice(0, 3);

  return (
    <div
      className="record-card"
      data-id={record.id}
      onClick={() => onClick(record)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(record);
        }
      }}
    >
      <div className="card-title">{title}</div>
      <div className="card-uni">
        🏛 {uni ? uni.name : ''} · {uni?.country || ''}
      </div>
      <div className="tag-row">
        {deadlineTag}
        {stageBadge}
        {subfields.map((s) => (
          <span key={s} className="tag">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};
