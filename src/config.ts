import { StageDefinition } from './types';

export const Config = {
  storageKeyTracker: 'phdmap.tracker.v1',
  storageKeyTheme: 'phdmap.theme',
  dataUrl: '/data.json',
  stages: [
    { key: 'saved', label: 'Considering', color: '#9333ea' },
    { key: 'emailed', label: 'Contacted', color: '#2563eb' },
    { key: 'replied', label: 'In Discussion', color: '#0284c7' },
    { key: 'interview', label: 'Interview', color: '#d97706' },
    { key: 'offer', label: 'Offer', color: '#16a34a' },
    { key: 'declined', label: 'Declined', color: '#dc2626' },
  ] as StageDefinition[],
  markerColors: {
    openings: '#ea580c',
    universities: '#2563eb',
    supervisors: '#16a34a',
  },
  mapLayers: {
    street: {
      base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attr: 'Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, METI, OpenStreetMap contributors',
    },
    satellite: {
      base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      overlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attr: 'Esri, Maxar, Earthstar Geographics',
    },
  },
};

export const TYPE_LABEL = {
  openings: 'PhD Opening',
  universities: 'University / Institute',
  supervisors: 'Faculty Supervisor',
};

export const KANBAN_TYPE_LABEL = {
  openings: 'Opening',
  universities: 'University',
  supervisors: 'Supervisor',
};
