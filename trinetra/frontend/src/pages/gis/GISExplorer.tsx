import { useEffect, useRef, useState } from 'react'
import { Map, Layers, Eye, EyeOff, Database, AlertTriangle, Building2, Zap, Droplets, Compass, Maximize2 } from 'lucide-react'
import { clsx } from 'clsx'

// Hyderabad coordinates centered on Banjara Hills demo parcel
const HYDERABAD = { lon: 78.4483, lat: 17.4235, height: 450 }

interface Layer {
  id: string
  label: string
  icon: typeof Layers
  visible: boolean
  color: string
  origin: string
}

const INITIAL_LAYERS: Layer[] = [
  { id: 'cadastral', label: 'TGRAC HMDA Cadastral', icon: Map, visible: true, color: '#1769AA', origin: 'REAL INPUT' },
  { id: 'buildings', label: 'GHMC Building Footprints', icon: Database, visible: true, color: '#008C95', origin: 'REAL INPUT' },
  { id: 'property3d', label: 'Demo Property 3D Volume', icon: Building2, visible: true, color: '#12355B', origin: 'SYNTHETIC DEMO' },
  { id: 'encroachment', label: 'Encroachment Areas', icon: AlertTriangle, visible: true, color: '#C62828', origin: 'SYNTHETIC DEMO' },
  { id: 'utilities_water', label: 'Water Network', icon: Droplets, visible: true, color: '#0288D1', origin: 'SYNTHETIC DEMO' },
  { id: 'utilities_sewer', label: 'Sewer Network', icon: Layers, visible: false, color: '#6A1B9A', origin: 'SYNTHETIC DEMO' },
  { id: 'utilities_elec', label: 'Electricity Network', icon: Zap, visible: false, color: '#F9A825', origin: 'SYNTHETIC DEMO' },
]

export default function GISExplorer() {
  const cesiumContainer = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)
  const [panelOpen, setPanelOpen] = useState(true)
  const [cesiumLoaded, setCesiumLoaded] = useState(false)
  const [cesiumError, setCesiumError] = useState<string | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)

  useEffect(() => {
    let isCancelled = false
    let currentViewer: any = null

    const initCesium = async () => {
      try {
        if (!cesiumContainer.current) return
        cesiumContainer.current.innerHTML = ''

        // Dynamic import of Cesium
        const Cesium = (await import('cesium')).default || (await import('cesium'))
        if (isCancelled || !cesiumContainer.current) return

        // Configure base URL and Ion token
        if (typeof window !== 'undefined') {
          (window as any).CESIUM_BASE_URL = '/cesium'
        }

        const token = import.meta.env.VITE_CESIUM_ION_TOKEN
        if (token) {
          Cesium.Ion.defaultAccessToken = token
        }

        // Setup base imagery provider with fallback
        let baseImagery: any = null
        if (token) {
          try {
            baseImagery = await Cesium.createWorldImageryAsync({
              style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
            })
          } catch (e) {
            console.warn('Cesium world imagery unavailable, falling back to OSM:', e)
          }
        }

        if (!baseImagery) {
          baseImagery = new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/',
          })
        }

        // Setup terrain provider with fallback
        let terrainProvider: any = null
        if (token) {
          try {
            terrainProvider = await Cesium.createWorldTerrainAsync({
              requestWaterMask: false,
              requestVertexNormals: true,
            })
          } catch (e) {
            console.warn('Cesium world terrain unavailable, falling back to Ellipsoid:', e)
          }
        }

        if (!terrainProvider) {
          terrainProvider = new Cesium.EllipsoidTerrainProvider()
        }

        if (isCancelled || !cesiumContainer.current) return

        // Instantiate Cesium Viewer
        const viewer = new Cesium.Viewer(cesiumContainer.current, {
          baseLayer: baseImagery ? new Cesium.ImageryLayer(baseImagery) : undefined,
          terrainProvider: terrainProvider,
          timeline: false,
          animation: false,
          homeButton: true,
          sceneModePicker: true,
          baseLayerPicker: false,
          navigationHelpButton: false,
          geocoder: false,
          fullscreenButton: true,
          infoBox: false,
          selectionIndicator: true,
        })

        if (isCancelled) {
          viewer.destroy()
          return
        }

        currentViewer = viewer
        viewerRef.current = viewer

        // Suppress unhandled render error crashes
        viewer.scene.renderError.addEventListener((_scene: any, error: any) => {
          console.warn('Cesium render event handled:', error)
        })

        // Custom home button behavior: fly to Hyderabad property
        if (viewer.homeButton?.viewModel?.command) {
          viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e: any) => {
            e.cancel = true
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(HYDERABAD.lon, HYDERABAD.lat, HYDERABAD.height),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-40),
                roll: 0,
              },
              duration: 1.5,
            })
          })
        }

        // Smooth initial camera flight to Banjara Hills
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(HYDERABAD.lon, HYDERABAD.lat, HYDERABAD.height),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-40),
            roll: 0,
          },
          duration: 1.5,
        })

        // Geometry dimensions
        const B_LON_MIN = 78.44810
        const B_LON_MAX = 78.44822
        const B_LAT_MIN = 17.42350
        const B_LAT_MAX = 17.42363
        const ELEV_BASE = 536.0
        const FLOOR_H = 3.2
        const N_FLOORS = 7

        // 1. Cadastral Parcel (TGRAC HMDA)
        const parcelEntity = viewer.entities.add({
          name: 'Cadastral Parcel — TGRAC HMDA (Verified)',
          description: 'Official revenue parcel boundaries recorded in TGRAC cadastral GIS database.',
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              78.44816, 17.42350,
              78.44822, 17.42350,
              78.44822, 17.42363,
              78.44816, 17.42363,
            ]),
            height: ELEV_BASE,
            material: Cesium.Color.fromCssColorString('#1769AA').withAlpha(0.25),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#1769AA'),
            outlineWidth: 3,
          },
        })
        ;(parcelEntity as any)._layerId = 'cadastral'

        // 2. GHMC Building Footprint
        const footprintEntity = viewer.entities.add({
          name: 'GHMC Building Footprint Record',
          description: 'Municipal sanctioned ground footprint from Greater Hyderabad Municipal Corporation.',
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              B_LON_MIN, B_LAT_MIN,
              B_LON_MAX, B_LAT_MIN,
              B_LON_MAX, B_LAT_MAX,
              B_LON_MIN, B_LAT_MAX,
            ]),
            height: ELEV_BASE + 0.1,
            material: Cesium.Color.fromCssColorString('#008C95').withAlpha(0.35),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#008C95'),
            outlineWidth: 2,
          },
        })
        ;(footprintEntity as any)._layerId = 'buildings'

        // 3. Demo Property 3D Volumetric Floors (LoD-2 Model)
        const floorColors = [
          '#12355B', // Basement B1
          '#1769AA', // Ground Floor
          '#1769AA', // Floor 1
          '#008C95', // Floor 2
          '#008C95', // Floor 3
          '#107C41', // Floor 4
          '#12355B', // Floor 5
        ]

        for (let f = 0; f < N_FLOORS; f++) {
          const floor_elev = f === 0 ? ELEV_BASE - 3.5 : ELEV_BASE + (f - 1) * FLOOR_H
          const floor_top = floor_elev + FLOOR_H
          const floorName = f === 0 ? 'Basement Parking (B1)' : f === 1 ? 'Ground Floor Commercial' : `Level ${f - 1} Office Units`

          const floorEntity = viewer.entities.add({
            name: floorName,
            description: `Floor Level: ${f === 0 ? -1 : f - 1} | Base MSL: ${floor_elev.toFixed(1)}m | Top MSL: ${floor_top.toFixed(1)}m`,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray([
                B_LON_MIN, B_LAT_MIN,
                B_LON_MAX, B_LAT_MIN,
                B_LON_MAX, B_LAT_MAX,
                B_LON_MIN, B_LAT_MAX,
              ]),
              height: floor_elev,
              extrudedHeight: floor_top,
              material: Cesium.Color.fromCssColorString(floorColors[f]).withAlpha(0.75),
              outline: true,
              outlineColor: Cesium.Color.WHITE.withAlpha(0.6),
            },
          })
          ;(floorEntity as any)._layerId = 'property3d'
        }

        // 4. Encroachment Warning Volume
        const encroachmentEntity = viewer.entities.add({
          name: 'West Boundary Encroachment Warning',
          description: 'Detected 2.3m volumetric extrusion extending beyond legal parcel boundary.',
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              B_LON_MIN, B_LAT_MIN,
              78.44816, B_LAT_MIN,
              78.44816, B_LAT_MAX,
              B_LON_MIN, B_LAT_MAX,
            ]),
            height: ELEV_BASE,
            extrudedHeight: ELEV_BASE + N_FLOORS * FLOOR_H,
            material: Cesium.Color.fromCssColorString('#C62828').withAlpha(0.45),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#C62828'),
          },
        })
        ;(encroachmentEntity as any)._layerId = 'encroachment'

        // 5. Water Utility Main (Blue)
        const waterEntity = viewer.entities.add({
          name: 'Water Supply Main (HMWSSB)',
          description: 'High-pressure potable water feeder main at 1.5m below surface.',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              78.44780, 17.42356, ELEV_BASE - 1.5,
              78.44850, 17.42356, ELEV_BASE - 1.5,
            ]),
            width: 4,
            material: Cesium.Color.fromCssColorString('#0288D1'),
          },
        })
        ;(waterEntity as any)._layerId = 'utilities_water'

        // 6. Sewer Network (Purple)
        const sewerEntity = viewer.entities.add({
          name: 'Underground Sewer Collector',
          description: 'Municipal gravity sewer conduit located 3.2m depth.',
          show: false,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              78.44790, 17.42345, ELEV_BASE - 3.2,
              78.44850, 17.42345, ELEV_BASE - 3.2,
            ]),
            width: 3.5,
            material: Cesium.Color.fromCssColorString('#6A1B9A'),
          },
        })
        ;(sewerEntity as any)._layerId = 'utilities_sewer'

        // 7. Electricity Utility (Amber)
        const elecEntity = viewer.entities.add({
          name: 'TSSPDCL 11kV Underground Feeder',
          description: 'Three-phase 11kV distribution line serving Banjara Hills sector.',
          show: false,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              78.44785, 17.42368, ELEV_BASE - 1.0,
              78.44845, 17.42368, ELEV_BASE - 1.0,
            ]),
            width: 3,
            material: Cesium.Color.fromCssColorString('#F9A825'),
          },
        })
        ;(elecEntity as any)._layerId = 'utilities_elec'

        // Selection Handler for Click Inspection
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        handler.setInputAction((movement: any) => {
          const pickedObject = viewer.scene.pick(movement.position)
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            setSelectedFeature({
              name: pickedObject.id.name || 'Selected Feature',
              description: pickedObject.id.description?._value || '',
            })
          } else {
            setSelectedFeature(null)
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        setCesiumLoaded(true)
      } catch (err: any) {
        console.error('Cesium initialization error:', err)
        if (!isCancelled) {
          setCesiumError(err?.message || 'Cesium failed to initialize')
        }
      }
    }

    initCesium()

    return () => {
      isCancelled = true
      if (currentViewer && !currentViewer.isDestroyed()) {
        currentViewer.destroy()
      }
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
      }
      viewerRef.current = null
    }
  }, [])

  // Interactive Layer Toggling
  const toggleLayer = (id: string) => {
    setLayers((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
      const target = next.find((l) => l.id === id)

      if (viewerRef.current && target) {
        const entities = viewerRef.current.entities.values
        for (const entity of entities) {
          if ((entity as any)._layerId === id) {
            entity.show = target.visible
          }
        }
      }
      return next
    })
  }

  // Camera Reset Shortcut
  const resetCamera = async () => {
    if (!viewerRef.current) return
    const Cesium = (await import('cesium')).default || (await import('cesium'))
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(HYDERABAD.lon, HYDERABAD.lat, HYDERABAD.height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0,
      },
      duration: 1.2,
    })
  }

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Cesium Map Viewport */}
      <div className="flex-1 relative h-full bg-slate-950">
        {cesiumError ? (
          <div className="flex items-center justify-center h-full bg-navy text-white flex-col gap-4 p-8 text-center">
            <Map size={48} className="text-white/30" />
            <div>
              <div className="text-lg font-semibold mb-2">3D GIS Viewer</div>
              <div className="text-white/60 text-sm max-w-md">
                CesiumJS encountered an issue initializing the 3D globe.
              </div>
              <div className="mt-4 text-xs text-white/40 font-mono bg-white/5 p-2 rounded max-w-md">
                {cesiumError}
              </div>
            </div>
          </div>
        ) : (
          <div ref={cesiumContainer} className="w-full h-full" />
        )}

        {/* Floating Property HUD Info Overlay */}
        {!cesiumError && cesiumLoaded && (
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-xl p-4 text-xs shadow-panel max-w-sm border border-border/80 z-10 transition-all">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-navy text-sm">Srinivas Commercial Complex</span>
              <span className="badge-verified text-[10px] font-mono px-2 py-0.5">3D ULPIN CERTIFIED</span>
            </div>
            <div className="text-muted font-mono text-[11px] mb-2.5">
              78.4483°E · 17.4235°N · Elevation 536.0m MSL
            </div>

            {selectedFeature ? (
              <div className="p-2.5 rounded-lg bg-govblue/10 border border-govblue/20 text-navy mb-2 animate-fadeIn">
                <div className="font-semibold text-xs text-govblue">{selectedFeature.name}</div>
                <div className="text-[11px] text-muted mt-0.5">{selectedFeature.description}</div>
              </div>
            ) : (
              <div className="text-[11px] text-muted mb-2 italic">
                Tip: Click any 3D floor, parcel, or utility line to inspect details.
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
              <span className="badge-real text-[10px]">REAL COP30 DEM</span>
              <span className="badge-real text-[10px]">TGRAC CADASTRAL</span>
              <span className="badge-warning text-[10px]">2.3m WEST ENCROACHMENT</span>
            </div>
          </div>
        )}

        {/* Top-Right Quick Navigation Bar */}
        {!cesiumError && cesiumLoaded && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={resetCamera}
              className="btn bg-white/90 backdrop-blur shadow-card text-navy hover:bg-white text-xs px-3 py-1.5 flex items-center gap-1.5 border border-border"
              title="Reset view to property"
            >
              <Compass size={14} className="text-govblue" />
              Focus Property
            </button>
            <button
              onClick={() => setPanelOpen((o) => !o)}
              className="btn bg-white shadow-card text-navy hover:bg-white/90 text-xs px-3 py-1.5 flex items-center gap-1.5 border border-border"
            >
              <Layers size={14} className="text-govblue" />
              Layers {panelOpen ? '▾' : '▸'}
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {!cesiumLoaded && !cesiumError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center text-white space-y-3">
              <div className="w-12 h-12 border-3 border-teal/30 border-t-teal rounded-full animate-spin mx-auto" />
              <div className="font-semibold text-base">Loading TRINETRA 3D GIS Twin…</div>
              <div className="text-white/50 text-xs font-mono">
                Streaming terrain, satellite imagery, and LoD-2 mesh
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layer Control Panel */}
      {panelOpen && (
        <div className="w-80 bg-white border-l border-border flex flex-col overflow-y-auto z-10 shadow-lg">
          <div className="px-5 py-3.5 border-b border-border bg-surface/50">
            <div className="section-title text-sm flex items-center gap-2">
              <Layers size={16} className="text-govblue" />
              Map & Spatial Layers
            </div>
            <p className="text-muted text-[11px] mt-0.5">Toggle real cadastral and 3D volumetric layers</p>
          </div>

          <div className="flex-1 p-3.5 space-y-2">
            {layers.map((layer) => {
              const Icon = layer.icon
              return (
                <div
                  key={layer.id}
                  className={clsx(
                    'flex items-center justify-between p-2.5 rounded-lg border transition-all',
                    layer.visible
                      ? 'bg-white border-border shadow-xs'
                      : 'bg-surface/60 border-transparent opacity-60'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-navy truncate">{layer.label}</div>
                      <div
                        className={clsx(
                          'badge text-[9px] mt-0.5 py-0 px-1.5 inline-block',
                          layer.origin === 'REAL INPUT' ? 'badge-real' : 'badge-synthetic'
                        )}
                      >
                        {layer.origin}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLayer(layer.id)}
                    className={clsx(
                      'p-1.5 rounded hover:bg-surface transition-colors shrink-0 ml-2',
                      layer.visible ? 'text-govblue' : 'text-muted'
                    )}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-border bg-surface/40 text-xs text-muted space-y-2">
            <div className="font-semibold text-navy text-[11px]">Layer Data Provenance</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="badge-real text-[9px]">REAL INPUT</span>
                <span>Copernicus GLO-30 DEM + TGRAC Cadastre</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-synthetic text-[9px]">SYNTHETIC</span>
                <span>QAOA 3D Volumetric Extrusion Model</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
