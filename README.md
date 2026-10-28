# PhD Map: European Astrophysics & Cosmology PhD Navigator

An interactive React + TypeScript application and application tracker for European astrophysics and cosmology PhD openings, universities, and research supervisors.

## Features

- **Interactive Geospatial Map**: Powered by Leaflet with ArcGIS World Street Map and Satellite imagery styles. Pin clustering by university coordinates with custom marker sizing and interactive popups.
- **Three Core Explorer Views**:
  - **Openings**: PhD vacancies, funding status, application deadlines with countdown calculations, and links to official portals.
  - **Universities**: Leading European astronomy/astrophysics institutions, department profiles, and program types.
  - **Supervisors**: Faculty members, research groups, current student acceptance status, and research focus areas.
- **Dynamic Search & Filtering**:
  - Full-text search across titles, faculty names, university names, locations, research topics, and descriptions.
  - Country filter dropdown.
  - Subfield and topic selector.
  - Quick toggles for open deadlines, fully funded positions, and actively recruiting faculty.
- **Application Pipeline Tracker (Kanban)**:
  - 6-stage application tracking system (Considering, Contacted, In Discussion, Interview, Offer, Declined).
  - Drag-and-drop workflow across columns.
  - Due date tracking for follow-ups and upcoming interviews.
  - Offer celebration banner and confetti animation.
  - LocalStorage persistence (`phdmap.tracker.v1`).
- **Comprehensive Detail Drawer**:
  - In-depth program details, funding overview, deadline information.
  - Department research summaries and faculty listings.
  - Application stage management and interview scheduling.
- **Theme Support**: Seamless Dark and Light theme toggle with persistence and system preference detection.

## Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler**: Vite
- **Mapping**: Leaflet with ArcGIS tile layers
- **Styling**: Modern CSS variables with custom light/dark theme schemes