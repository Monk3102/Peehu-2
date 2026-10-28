import React, { useState, useRef, useEffect } from 'react';
import { FilterState } from '../types';

interface FilterBarProps {
  filterState: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  countries: string[];
  subfields: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  onFilterChange,
  countries,
  subfields,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const activeFilterCount =
    (filterState.subfield ? 1 : 0) +
    (filterState.fundedOnly ? 1 : 0) +
    (filterState.takingStudents ? 1 : 0) +
    (!filterState.hideClosed ? 1 : 0);

  const resetFilters = () => {
    onFilterChange((prev) => ({
      ...prev,
      subfield: '',
      hideClosed: true,
      fundedOnly: false,
      takingStudents: false,
    }));
  };

  return (
    <div className="filter-bar">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search openings, universities, professors, research areas..."
          value={filterState.search}
          onChange={(e) =>
            onFilterChange((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        {filterState.search && (
          <button
            className="clear-search"
            style={{ display: 'block' }}
            onClick={() => onFilterChange((prev) => ({ ...prev, search: '' }))}
            title="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <select
        className="country-select"
        aria-label="Filter by Country"
        value={filterState.country}
        onChange={(e) =>
          onFilterChange((prev) => ({ ...prev, country: e.target.value }))
        }
      >
        <option value="">All Countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div style={{ position: 'relative' }}>
        <button
          ref={filterBtnRef}
          type="button"
          className={`btn-filter-trigger ${activeFilterCount > 0 ? 'has-active' : ''}`}
          onClick={() => setPopoverOpen((prev) => !prev)}
        >
          <span>⚙ Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </button>

        {popoverOpen && (
          <div ref={popoverRef} className="filter-popover open">
            <div className="filter-field">
              <label>Subfield / Topic</label>
              <select
                value={filterState.subfield}
                onChange={(e) =>
                  onFilterChange((prev) => ({ ...prev, subfield: e.target.value }))
                }
              >
                <option value="">All Research Subfields</option>
                {subfields.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={filterState.hideClosed}
                onChange={(e) =>
                  onFilterChange((prev) => ({ ...prev, hideClosed: e.target.checked }))
                }
              />
              <span>Hide closed / passed deadlines</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={filterState.fundedOnly}
                onChange={(e) =>
                  onFilterChange((prev) => ({ ...prev, fundedOnly: e.target.checked }))
                }
              />
              <span>Fully funded positions only</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={filterState.takingStudents}
                onChange={(e) =>
                  onFilterChange((prev) => ({
                    ...prev,
                    takingStudents: e.target.checked,
                  }))
                }
              />
              <span>Only faculty currently taking students</span>
            </label>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '6px',
              }}
            >
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
