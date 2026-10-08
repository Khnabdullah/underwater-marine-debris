/**
 * Static Survey Plates Catalog & Oceanographic Telemetry Metadata
 */

export const SURVEY_PLATES = {
  'plate-01': {
    id: 'plate-01',
    label: 'Plate 01: Coral Shelf Waste',
    rawUrl: '/ocean-micro-debris.jpg',
    annotatedUrl: '/ocean-micro-debris.jpg',
    location: 'Arabian Sea Reef, 28m Depth',
    baseDetections: [
      { id: 1, class: 'plastic', label: 'Polymer Bottle Fragment', confidence: 94.2, area: 0.18 },
      { id: 2, class: 'plastic', label: 'Degraded Food Packaging', confidence: 88.5, area: 0.32 },
      { id: 3, class: 'gear', label: 'Nylon Monofilament Net', confidence: 78.4, area: 0.74 },
      { id: 4, class: 'metal', label: 'Corroded Beverage Can', confidence: 91.0, area: 0.12 },
      { id: 5, class: 'plastic', label: 'Synthetic Rope Strand', confidence: 42.1, area: 0.15 },
      { id: 6, class: 'plastic', label: 'Micro-polymer Cluster', confidence: 28.0, area: 0.08 },
    ],
  },
  'plate-02': {
    id: 'plate-02',
    label: 'Plate 02: Monsoonal Diver Survey',
    rawUrl: '/research-diver.jpg',
    annotatedUrl: '/research-diver.jpg',
    location: 'Goa Coastal Shelf, 14m Depth',
    baseDetections: [
      { id: 1, class: 'gear', label: 'Abandoned Trawler Net', confidence: 96.1, area: 1.45 },
      { id: 2, class: 'plastic', label: 'HDPE Container Lid', confidence: 84.6, area: 0.22 },
      { id: 3, class: 'metal', label: 'Steel Rigging Bracket', confidence: 68.3, area: 0.40 },
      { id: 4, class: 'plastic', label: 'Polyethylene Sheeting', confidence: 34.5, area: 0.65 },
    ],
  },
  'plate-03': {
    id: 'plate-03',
    label: 'Plate 03: Multibeam Bathymetry',
    rawUrl: '/new_image_debris.png',
    annotatedUrl: '/new_image_debris.png',
    location: 'Indian Ocean Abyssal Trench, 840m',
    baseDetections: [
      { id: 1, class: 'metal', label: 'Submerged Metallic Drum', confidence: 92.4, area: 1.80 },
      { id: 2, class: 'gear', label: 'Entangled Commercial Longline', confidence: 81.2, area: 2.10 },
      { id: 3, class: 'plastic', label: 'Composite Slag Debris', confidence: 54.0, area: 0.55 },
    ],
  },
};

export const INITIAL_CLASS_FILTERS = {
  plastic: true,
  metal: true,
  gear: true,
};
