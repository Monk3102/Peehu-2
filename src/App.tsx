import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Dataset,
  RawDataset,
  AnyRecord,
  University,
  Opening,
  Supervisor,
  TabType,
  FilterState,
  TrackerStore,
  StageKey,
} from './types';
import { Config } from './config';
import { filterRecords } from './utils/helpers';
import { Celebrate } from './utils/celebrate';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { RecordCard } from './components/RecordCard';
import { DetailDrawer } from './components/DetailDrawer';
import { TrackerBoard } from './components/TrackerBoard';

const CARD_BATCH = 60;

export const App: React.FC = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('openings');
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    country: '',
    subfield: '',
    hideClosed: true,
    fundedOnly: false,
    takingStudents: false,
  });

  const [tracker, setTracker] = useState<TrackerStore>(() => {
    try {
      return JSON.parse(localStorage.getItem(Config.storageKeyTracker) || '{}') || {};
    } catch {
      return {};
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(Config.storageKeyTheme);
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [selectedRecord, setSelectedRecord] = useState<AnyRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [renderedCount, setRenderedCount] = useState(CARD_BATCH);
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  // Sync theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(Config.storageKeyTheme, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(Config.dataUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw: RawDataset = await res.json();
        const dict = raw.subfieldDict || [];

        const universities: University[] = (raw.universities || []).map((u) => ({
          ...u,
          _t: 'universities',
          subfields: (u.subfields || []).map((idx: number) => dict[idx] || String(idx)),
        }));

        const openings: Opening[] = (raw.openings || []).map((o) => ({
          ...o,
          _t: 'openings',
          subfields: (o.subfields || []).map((idx: number) => dict[idx] || String(idx)),
        }));

        const supervisors: Supervisor[] = (raw.supervisors || []).map((s) => ({
          ...s,
          _t: 'supervisors',
          subfields: (s.subfields || []).map((idx: number) => dict[idx] || String(idx)),
        }));

        setDataset({
          subfieldDict: dict,
          universities,
          openings,
          supervisors,
        });
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load dataset:', err);
        setLoadError(err.message || 'Failed to load data.json');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Built indexes
  const { uniById, supByUni, byId } = useMemo(() => {
    const uniMap = new Map<string, University>();
    const supMap = new Map<string, Supervisor[]>();
    const allMap = new Map<string, AnyRecord>();

    if (!dataset) return { uniById: uniMap, supByUni: supMap, byId: allMap };

    dataset.universities.forEach((u) => {
      uniMap.set(u.id, u);
      allMap.set(u.id, u);
    });

    dataset.supervisors.forEach((s) => {
      allMap.set(s.id, s);
      if (!supMap.has(s.universityId)) {
        supMap.set(s.universityId, []);
      }
      supMap.get(s.universityId)!.push(s);
    });

    dataset.openings.forEach((o) => {
      allMap.set(o.id, o);
    });

    return { uniById: uniMap, supByUni: supMap, byId: allMap };
  }, [dataset]);

  // Countries & Subfields for filter dropdowns
  const { countries, allSubfields } = useMemo(() => {
    if (!dataset) return { countries: [], allSubfields: [] };

    const cSet = new Set<string>();
    dataset.universities.forEach((u) => {
      if (u.country) cSet.add(u.country);
    });

    const sSet = new Set<string>();
    [dataset.universities, dataset.openings, dataset.supervisors].forEach((list) => {
      list.forEach((r) => {
        (r.subfields || []).forEach((s) => sSet.add(s));
      });
    });

    return {
      countries: Array.from(cSet).sort(),
      allSubfields: Array.from(sSet).sort(),
    };
  }, [dataset]);

  // Tracker stage update
  const handleUpdateStage = useCallback(
    (id: string, status: StageKey | 'none') => {
      setTracker((prev) => {
        const prevStatus = prev[id]?.status;
        const next = { ...prev };
        if (!status || status === 'none') {
          delete next[id];
        } else {
          next[id] = {
            ...(next[id] || {}),
            status,
            updatedAt: new Date().toISOString(),
          };
        }
        try {
          localStorage.setItem(Config.storageKeyTracker, JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage save failed', e);
        }

        if (status === 'offer' && prevStatus !== 'offer') {
          Celebrate.run();
        }
        return next;
      });
    },
    []
  );

  // Tracker dates update
  const handleUpdateDates = useCallback(
    (id: string, updates: { follow?: string; interviewDate?: string }) => {
      setTracker((prev) => {
        const current = prev[id] || { status: 'none' };
        const next = {
          ...prev,
          [id]: {
            ...current,
            ...updates,
          },
        };
        try {
          localStorage.setItem(Config.storageKeyTracker, JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage save failed', e);
        }
        return next;
      });
    },
    []
  );

  // Filtered & Sorted records for Explorer view
  const filteredRecords = useMemo(() => {
    if (!dataset || activeTab === 'tracker') return [];
    const rawList = dataset[activeTab] || [];
    const matched = filterRecords(rawList, activeTab, filterState, uniById);

    // Tracked items float to top (stable sort)
    const isTracked = (r: AnyRecord) => {
      const e = tracker[r.id];
      return e && e.status && e.status !== 'none' ? 1 : 0;
    };

    return [...matched].sort((a, b) => isTracked(b) - isTracked(a));
  }, [dataset, activeTab, filterState, uniById, tracker]);

  // Reset batch count when tab or filters change
  useEffect(() => {
    setRenderedCount(CARD_BATCH);
    if (cardsScrollRef.current) {
      cardsScrollRef.current.scrollTop = 0;
    }
  }, [activeTab, filterState]);

  // Infinite scroll listener
  const handleScrollCards = () => {
    const el = cardsScrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 500) {
      setRenderedCount((prev) => Math.min(prev + CARD_BATCH, filteredRecords.length));
    }
  };

  const visibleRecords = useMemo(() => {
    return filteredRecords.slice(0, renderedCount);
  }, [filteredRecords, renderedCount]);

  const handleSelectRecord = (record: AnyRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRecord(null);
  };

  const counts = {
    openings: dataset?.openings.length || 0,
    universities: dataset?.universities.length || 0,
    supervisors: dataset?.supervisors.length || 0,
    tracker: Object.values(tracker).filter((e) => e.status && e.status !== 'none').length,
  };

  const isTrackerTab = activeTab === 'tracker';

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Loading dataset...
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: 'var(--rose)',
        }}
      >
        <h2>Error Loading PhD Map</h2>
        <p style={{ marginTop: '8px', color: 'var(--text-subtle)' }}>{loadError}</p>
      </div>
    );
  }

  return (
    <>
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {!isTrackerTab && (
        <FilterBar
          filterState={filterState}
          onFilterChange={setFilterState}
          countries={countries}
          subfields={allSubfields}
        />
      )}

      <main>
        {!isTrackerTab ? (
          <div id="explorer-view" className="explorer-container">
            <MapView
              records={filteredRecords}
              activeTab={activeTab}
              uniById={uniById}
              selectedRecord={selectedRecord}
              onSelectRecord={handleSelectRecord}
            />

            <div className="list-container">
              <div className="list-header">
                <span>
                  Showing {filteredRecords.length} of{' '}
                  {dataset ? dataset[activeTab].length : 0} {activeTab}
                </span>
              </div>
              <div
                ref={cardsScrollRef}
                className="cards-scroll"
                onScroll={handleScrollCards}
              >
                {filteredRecords.length === 0 ? (
                  <div className="empty-msg">
                    No {activeTab} found matching your filters.
                  </div>
                ) : (
                  visibleRecords.map((r) => (
                    <RecordCard
                      key={r.id}
                      record={r}
                      uniById={uniById}
                      trackerEntry={tracker[r.id]}
                      onClick={handleSelectRecord}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <TrackerBoard
            tracker={tracker}
            byId={byId}
            uniById={uniById}
            onUpdateStage={handleUpdateStage}
            onOpenDetails={handleSelectRecord}
          />
        )}
      </main>

      {drawerOpen && selectedRecord && (
        <DetailDrawer
          record={selectedRecord}
          uniById={uniById}
          supByUni={supByUni}
          trackerEntry={tracker[selectedRecord.id]}
          onClose={handleCloseDrawer}
          onUpdateStage={handleUpdateStage}
          onUpdateDates={handleUpdateDates}
        />
      )}
    </>
  );
};
