import { useEffect, useRef, useState } from 'react'
import {
  Map, Layers, Eye, EyeOff, Database, AlertTriangle, Building2,
  Zap, Droplets, Compass, CheckCircle, ChevronDown, Maximize2,
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, MousePointer, Info,
  Sliders, Box
} from 'lucide-react'
import { clsx } from 'clsx'
import DigitalTwinModal from '@/components/DigitalTwinModal'
import { propertiesApi } from '@/services/api'

// Precinct Overview Coordinates (Banjara Hills, Hyderabad)
const HYDERABAD_PRECINCT = { lon: 78.44835, lat: 17.42360, height: 600 }

interface Property3D {
  id: string
  name: string
  ulpin: string
  parcelRef: string
  floors: number
  height_m: number
  base_elev_m: number
  lon: number
  lat: number
  bounds: [number, number, number, number] // [lon_min, lat_min, lon_max, lat_max]
  parcelBounds: [number, number, number, number]
  type: string
  status: 'VERIFIED' | 'ENCROACHMENT_FLAG' | 'UNDER_REVIEW' | 'FLAGGED'
  color: string
  encroachmentOffset_m?: number
  unitsCount: number
}

const INITIAL_PROPERTIES: Property3D[] = [
  {
    id: 'PROP-HYD-2024-001',
    name: 'Srinivas Commercial Complex',
    ulpin: 'IN-3D-HYD0-2024-0001',
    parcelRef: 'HYD/BH/123/4',
    floors: 7,
    height_m: 22.4,
    base_elev_m: 536.0,
    lon: 78.44816,
    lat: 17.42356,
    bounds: [78.44810, 17.42350, 78.44822, 17.42363],
    parcelBounds: [78.44805, 17.42347, 78.44825, 17.42366],
    type: 'Commercial Complex (Retail + Office)',
    status: 'ENCROACHMENT_FLAG',
    color: '#1769AA',
    encroachmentOffset_m: 2.3,
    unitsCount: 12,
  },
  {
    id: 'PROP-HYD-2024-002',
    name: 'Cyber Heights Tech Park — Tower A',
    ulpin: 'IN-3D-HYD0-2024-0002',
    parcelRef: 'HYD/BH/123/6',
    floors: 12,
    height_m: 38.4,
    base_elev_m: 536.2,
    lon: 78.44870,
    lat: 17.42415,
    bounds: [78.44860, 17.42405, 78.44880, 17.42425],
    parcelBounds: [78.44858, 17.42403, 78.44882, 17.42427],
    type: 'IT Enterprise Grade-A Commercial',
    status: 'VERIFIED',
    color: '#008C95',
    unitsCount: 24,
  },
  {
    id: 'PROP-HYD-2024-003',
    name: 'Cyber Heights Tech Park — Tower B',
    ulpin: 'IN-3D-HYD0-2024-0003',
    parcelRef: 'HYD/BH/123/7',
    floors: 9,
    height_m: 28.8,
    base_elev_m: 536.4,
    lon: 78.44855,
    lat: 17.42384,
    bounds: [78.44846, 17.42375, 78.44864, 17.42393],
    parcelBounds: [78.44844, 17.42373, 78.44866, 17.42395],
    type: 'Corporate Executive Offices',
    status: 'VERIFIED',
    color: '#107C41',
    unitsCount: 18,
  },
  {
    id: 'PROP-HYD-2024-004',
    name: 'Krishna Residency Towers',
    ulpin: 'IN-3D-HYD0-2024-0004',
    parcelRef: 'HYD/BH/123/9',
    floors: 5,
    height_m: 16.0,
    base_elev_m: 535.8,
    lon: 78.44785,
    lat: 17.42378,
    bounds: [78.44775, 17.42370, 78.44795, 17.42386],
    parcelBounds: [78.44773, 17.42368, 78.44797, 17.42388],
    type: 'Multi-Family Residential Complex',
    status: 'VERIFIED',
    color: '#D97706',
    unitsCount: 10,
  },
  {
    id: 'PROP-HYD-2024-005',
    name: 'Deccan Municipal Utility Substation',
    ulpin: 'IN-3D-HYD0-2024-0005',
    parcelRef: 'HYD/BH/123/12',
    floors: 2,
    height_m: 7.5,
    base_elev_m: 535.5,
    lon: 78.44815,
    lat: 17.42331,
    bounds: [78.44805, 17.42325, 78.44825, 17.42337],
    parcelBounds: [78.44803, 17.42323, 78.44827, 17.42339],
    type: 'TSSPDCL Electrical & Control Hall',
    status: 'VERIFIED',
    color: '#6B7280',
    unitsCount: 2,
  },
]

interface Layer {
  id: string
  label: string
  icon: typeof Layers
  visible: boolean
  color: string
  origin: string
}

const INITIAL_LAYERS: Layer[] = [
  { id: 'cadastral', label: 'TGRAC Cadastral Parcels', icon: Map, visible: true, color: '#1769AA', origin: 'REAL INPUT' },
  { id: 'buildings', label: 'Ground Footprints (GHMC)', icon: Database, visible: true, color: '#008C95', origin: 'REAL INPUT' },
  { id: 'property3d', label: '3D Volumetric Buildings', icon: Building2, visible: true, color: '#12355B', origin: '3D CADASTRE' },
  { id: 'encroachment', label: 'Encroachment Overhangs', icon: AlertTriangle, visible: true, color: '#C62828', origin: 'AI DETECTED' },
  { id: 'utilities_water', label: 'Water Trunk Line (HMWSSB)', icon: Droplets, visible: true, color: '#0288D1', origin: 'UTILITY GIS' },
  { id: 'utilities_sewer', label: 'Underground Sewer Collector', icon: Layers, visible: true, color: '#6A1B9A', origin: 'UTILITY GIS' },
  { id: 'utilities_elec', label: '11kV Grid Distribution', icon: Zap, visible: true, color: '#F9A825', origin: 'UTILITY GIS' },
]

export default function GISExplorer() {
  const cesiumContainer = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const cesiumModuleRef = useRef<any>(null)

  const [propertiesList, setPropertiesList] = useState<Property3D[]>(INITIAL_PROPERTIES)
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS)
  const [panelOpen, setPanelOpen] = useState(true)
  const [cesiumLoaded, setCesiumLoaded] = useState(false)
  const [cesiumError, setCesiumError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property3D>(INITIAL_PROPERTIES[0])
  const [selectedFeature, setSelectedFeature] = useState<any>(null)

  // Trackpad & Modal state
  const [digitalTwinModalOpen, setDigitalTwinModalOpen] = useState(false)
  const [trackpadMode, setTrackpadMode] = useState<'orbit' | 'pan'>('orbit')
  const [showTrackpadHelp, setShowTrackpadHelp] = useState(false)

  // Fetch all registered properties (including dynamically added ones)
  useEffect(() => {
    propertiesApi.list()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const fetched: Property3D[] = res.data.map((p: any) => {
            const existing = INITIAL_PROPERTIES.find((init) => init.id === p.id)
            if (existing) return existing
            const w = 0.00018
            const lon = p.lon || 78.44830
            const lat = p.lat || 17.42430
            return {
              id: p.id,
              name: p.name || p.property_ref,
              ulpin: p.ulpin || 'IN-3D-HYD0-2024-0001',
              parcelRef: p.parcel_ref || 'HYD/BH/123/15',
              floors: p.floor_count || 6,
              height_m: p.height_m || 19.2,
              base_elev_m: p.base_elevation_m || 536.0,
              lon: lon,
              lat: lat,
              bounds: p.bounds || [lon - w / 2, lat - w / 2, lon + w / 2, lat + w / 2],
              parcelBounds: p.parcel_bounds || [lon - w / 2 - 0.00003, lat - w / 2 - 0.00003, lon + w / 2 + 0.00003, lat + w / 2 + 0.00003],
              type: p.building_type || 'Commercial Multi-Storey',
              status: p.status === 'FLAGGED' ? 'ENCROACHMENT_FLAG' : 'VERIFIED',
              color: p.color || '#0288D1',
              unitsCount: p.floor_count || 6,
            }
          })
          setPropertiesList(fetched)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let isCancelled = false
    let currentViewer: any = null

    const initCesium = async () => {
      try {
        if (!cesiumContainer.current) return
        cesiumContainer.current.innerHTML = ''

        const Cesium = (await import('cesium')).default || (await import('cesium'))
        if (isCancelled || !cesiumContainer.current) return

        cesiumModuleRef.current = Cesium

        if (typeof window !== 'undefined') {
          (window as any).CESIUM_BASE_URL = '/cesium'
        }

        const token = import.meta.env.VITE_CESIUM_ION_TOKEN
        if (token) {
          Cesium.Ion.defaultAccessToken = token
        }

        let baseImagery: any = null
        if (token) {
          try {
            baseImagery = await Cesium.createWorldImageryAsync({
              style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
            })
          } catch (e) {
            console.warn('Cesium world imagery unavailable, using OSM fallback:', e)
          }
        }
        if (!baseImagery) {
          baseImagery = new Cesium.OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/',
          })
        }

        let terrainProvider: any = null
        if (token) {
          try {
            terrainProvider = await Cesium.createWorldTerrainAsync({
              requestWaterMask: false,
              requestVertexNormals: true,
            })
          } catch (e) {
            console.warn('Cesium terrain unavailable, using Ellipsoid fallback:', e)
          }
        }
        if (!terrainProvider) {
          terrainProvider = new Cesium.EllipsoidTerrainProvider()
        }

        if (isCancelled || !cesiumContainer.current) return

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

        // ==========================================
        // OPTIMIZE FOR LAPTOP MOUSEPAD / TRACKPAD
        // ==========================================
        const ssc = viewer.scene.screenSpaceCameraController
        ssc.enableRotate = true
        ssc.enableTranslate = true
        ssc.enableZoom = true
        ssc.enableTilt = true
        ssc.enableLook = true

        // Smooth damping for trackpad navigation
        ssc.inertiaSpin = 0.75
        ssc.inertiaTranslate = 0.75
        ssc.inertiaZoom = 0.65

        // Multi-touch & Trackpad Gesture mappings:
        // Left-drag: Orbit / Rotate
        // Shift + Left-drag OR Ctrl + Left-drag OR Middle drag: Tilt
        // 2-finger scroll / pinch / right-drag: Smooth Zoom
        ssc.tiltEventTypes = [
          Cesium.CameraEventType.MIDDLE_DRAG,
          Cesium.CameraEventType.PINCH,
          { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.SHIFT },
          { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
          Cesium.CameraEventType.RIGHT_DRAG
        ]
        ssc.zoomEventTypes = [
          Cesium.CameraEventType.RIGHT_DRAG,
          Cesium.CameraEventType.WHEEL,
          Cesium.CameraEventType.PINCH
        ]

        viewer.scene.renderError.addEventListener((_scene: any, error: any) => {
          console.warn('Cesium render handled:', error)
        })

        // Custom home button: fly to precinct
        if (viewer.homeButton?.viewModel?.command) {
          viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e: any) => {
            e.cancel = true
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(HYDERABAD_PRECINCT.lon, HYDERABAD_PRECINCT.lat, HYDERABAD_PRECINCT.height),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-40),
                roll: 0,
              },
              duration: 1.5,
            })
          })
        }

        // Initial camera flight
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(HYDERABAD_PRECINCT.lon, HYDERABAD_PRECINCT.lat, HYDERABAD_PRECINCT.height),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-40),
            roll: 0,
          },
          duration: 1.5,
        })

        // ==========================================
        // RENDER 3D PROPERTIES IN SCENE
        // ==========================================
        const floorPalette = ['#12355B', '#1769AA', '#008C95', '#0288D1', '#107C41', '#374151', '#4F46E5', '#6366F1', '#8B5CF6']

        propertiesList.forEach((prop) => {
          const [lonMin, latMin, lonMax, latMax] = prop.bounds
          const [pLonMin, pLatMin, pLonMax, pLatMax] = prop.parcelBounds
          const floorHeight = prop.height_m / Math.max(1, prop.floors)

          // 1. Cadastral Parcel Boundary
          const parcelEntity = viewer.entities.add({
            name: `${prop.name} — Cadastral Parcel (${prop.parcelRef})`,
            description: `Legal cadastral boundary. Area: ${(
              (pLonMax - pLonMin) * 111000 * (pLatMax - pLatMin) * 111000
            ).toFixed(1)} m². Status: ${prop.status}`,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray([
                pLonMin, pLatMin,
                pLonMax, pLatMin,
                pLonMax, pLatMax,
                pLonMin, pLatMax,
              ]),
              height: prop.base_elev_m,
              material: Cesium.Color.fromCssColorString(prop.color).withAlpha(0.18),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(prop.color),
              outlineWidth: 2.5,
            },
          })
          ;(parcelEntity as any)._layerId = 'cadastral'
          ;(parcelEntity as any)._propertyId = prop.id

          // 2. Ground Sanctioned Footprint
          const footprintEntity = viewer.entities.add({
            name: `${prop.name} — Ground Footprint`,
            description: `Ground footprint reference for ${prop.name}. Base MSL: ${prop.base_elev_m}m.`,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray([
                lonMin, latMin,
                lonMax, latMin,
                lonMax, latMax,
                lonMin, latMax,
              ]),
              height: prop.base_elev_m + 0.1,
              material: Cesium.Color.fromCssColorString('#008C95').withAlpha(0.35),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString('#008C95'),
              outlineWidth: 2,
            },
          })
          ;(footprintEntity as any)._layerId = 'buildings'
          ;(footprintEntity as any)._propertyId = prop.id

          // 3. 3D Volumetric Extruded Floors
          for (let f = 0; f < prop.floors; f++) {
            const isBasement = prop.id === 'PROP-HYD-2024-001' && f === 0
            const floorElev = isBasement
              ? prop.base_elev_m - 3.5
              : prop.base_elev_m + (isBasement ? 0 : f) * floorHeight
            const floorTop = isBasement ? prop.base_elev_m : floorElev + floorHeight
            const floorName = isBasement ? 'Basement Parking (B1)' : `Level ${f} — Floor Plate`
            const floorColor = floorPalette[f % floorPalette.length]

            const floorEntity = viewer.entities.add({
              name: `${prop.name} — ${floorName}`,
              description: `ULPIN: ${prop.ulpin} | Elevation: ${floorElev.toFixed(1)}m to ${floorTop.toFixed(1)}m MSL | Type: ${prop.type}`,
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray([
                  lonMin, latMin,
                  lonMax, latMin,
                  lonMax, latMax,
                  lonMin, latMax,
                ]),
                height: floorElev,
                extrudedHeight: floorTop,
                material: Cesium.Color.fromCssColorString(floorColor).withAlpha(0.80),
                outline: true,
                outlineColor: Cesium.Color.WHITE.withAlpha(0.4),
                outlineWidth: 1.5,
              },
            })
            ;(floorEntity as any)._layerId = 'property3d'
            ;(floorEntity as any)._propertyId = prop.id
          }

          // 4. Encroachment Flag (Srinivas Complex +2.3m West Overhang)
          if (prop.encroachmentOffset_m) {
            const encroachmentEntity = viewer.entities.add({
              name: `${prop.name} — Unauthorized +${prop.encroachmentOffset_m}m West Overhang`,
              description: `Encroachment detected across West boundary of parcel ${prop.parcelRef} into road corridor.`,
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray([
                  lonMin - 0.00003, latMin,
                  lonMin, latMin,
                  lonMin, latMax,
                  lonMin - 0.00003, latMax,
                ]),
                height: prop.base_elev_m,
                extrudedHeight: prop.base_elev_m + prop.height_m,
                material: Cesium.Color.fromCssColorString('#C62828').withAlpha(0.55),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#C62828'),
              },
            })
            ;(encroachmentEntity as any)._layerId = 'encroachment'
            ;(encroachmentEntity as any)._propertyId = prop.id
          }
        })

        // ==========================================
        // UNDERGROUND UTILITIES
        // ==========================================
        const waterEntity = viewer.entities.add({
          name: 'HMWSSB 300mm Potable Water Trunk Main',
          description: 'High-pressure distribution main at 1.8m below surface.',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              78.44760, 17.42358, 534.2,
              78.44875, 17.42358, 534.4,
              78.44875, 17.42395, 534.5,
            ]),
            width: 4.5,
            material: Cesium.Color.fromCssColorString('#0288D1'),
          },
        })
        ;(waterEntity as any)._layerId = 'utilities_water'

        const sewerEntity = viewer.entities.add({
          name: 'Municipal Gravity Sewer Interceptor',
          description: 'Reinforced concrete sewer pipe at 3.5m depth.',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              78.44765, 17.42348, 532.5,
              78.44880, 17.42348, 532.7,
            ]),
            width: 3.5,
            material: Cesium.Color.fromCssColorString('#6A1B9A'),
          },
        })
        ;(sewerEntity as any)._layerId = 'utilities_sewer'

        const elecEntity = viewer.entities.add({
          name: 'TSSPDCL 11kV Underground Feeder Circuit',
          description: 'Three-phase primary feeder routing power from Deccan Substation.',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              78.44815, 17.42337, 534.5,
              78.44855, 17.42337, 534.7,
              78.44855, 17.42375, 534.9,
            ]),
            width: 3.5,
            material: Cesium.Color.fromCssColorString('#F9A825'),
          },
        })
        ;(elecEntity as any)._layerId = 'utilities_elec'

        // ==========================================
        // CLICK SELECTION HANDLER
        // ==========================================
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        handler.setInputAction((movement: any) => {
          const pickedObject = viewer.scene.pick(movement.position)
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            const propId = (pickedObject.id as any)._propertyId
            if (propId) {
              const matched = propertiesList.find((p) => p.id === propId)
              if (matched) setSelectedProperty(matched)
            }
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
    }
  }, [propertiesList])

  // Camera Actions for Trackpad & Buttons
  const flyToProperty = (prop: Property3D) => {
    setSelectedProperty(prop)
    if (!viewerRef.current || !cesiumModuleRef.current) return
    const Cesium = cesiumModuleRef.current
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(prop.lon, prop.lat - 0.0014, prop.base_elev_m + prop.height_m + 80),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-32),
        roll: 0,
      },
      duration: 1.2,
    })
  }

  const resetCamera = () => {
    if (!viewerRef.current || !cesiumModuleRef.current) return
    const Cesium = cesiumModuleRef.current
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(HYDERABAD_PRECINCT.lon, HYDERABAD_PRECINCT.lat, HYDERABAD_PRECINCT.height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0,
      },
      duration: 1.5,
    })
  }

  const handleZoomIn = () => {
    if (viewerRef.current) viewerRef.current.camera.zoomIn(75)
  }

  const handleZoomOut = () => {
    if (viewerRef.current) viewerRef.current.camera.zoomOut(75)
  }

  const handleRotateLeft = () => {
    if (viewerRef.current && cesiumModuleRef.current) {
      viewerRef.current.camera.rotateLeft(cesiumModuleRef.current.Math.toRadians(25))
    }
  }

  const handleRotateRight = () => {
    if (viewerRef.current && cesiumModuleRef.current) {
      viewerRef.current.camera.rotateRight(cesiumModuleRef.current.Math.toRadians(25))
    }
  }

  const handleTiltToggle = () => {
    if (!viewerRef.current || !cesiumModuleRef.current) return
    const Cesium = cesiumModuleRef.current
    const currentPitch = viewerRef.current.camera.pitch
    const newPitch = currentPitch < -1.1 ? -Cesium.Math.toRadians(35) : -Cesium.Math.toRadians(85)
    viewerRef.current.camera.setView({
      orientation: {
        heading: viewerRef.current.camera.heading,
        pitch: newPitch,
        roll: 0,
      },
    })
  }

  const switchTrackpadMode = (mode: 'orbit' | 'pan') => {
    setTrackpadMode(mode)
    if (!viewerRef.current || !cesiumModuleRef.current) return
    const Cesium = cesiumModuleRef.current
    const ssc = viewerRef.current.scene.screenSpaceCameraController
    if (mode === 'orbit') {
      ssc.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG]
      ssc.translateEventTypes = [
        Cesium.CameraEventType.MIDDLE_DRAG,
        { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.SHIFT }
      ]
    } else {
      ssc.translateEventTypes = [Cesium.CameraEventType.LEFT_DRAG]
      ssc.rotateEventTypes = [
        Cesium.CameraEventType.MIDDLE_DRAG,
        { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.SHIFT }
      ]
    }
  }

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

  return (
    <div className="flex h-full relative overflow-hidden select-none">
      {/* 3D Viewport */}
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

        {/* Top Floating Action Bar */}
        {!cesiumError && cesiumLoaded && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            {/* Property Quick Selector */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl shadow-panel border border-border/80 p-1.5 flex items-center gap-2">
              <div className="px-2.5 py-1 text-[11px] font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={15} className="text-govblue" />
                Active Precinct:
              </div>
              <div className="flex items-center gap-1 overflow-x-auto max-w-xl">
                {propertiesList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => flyToProperty(p)}
                    className={clsx(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0',
                      selectedProperty.id === p.id
                        ? 'bg-govblue text-white shadow-xs'
                        : 'bg-surface hover:bg-slate-100 text-dark'
                    )}
                  >
                    {p.name.split('—')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setDigitalTwinModalOpen(true)}
                className="btn bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-2 flex items-center gap-1.5 rounded-xl shadow-card"
                title="Open 3D Digital Twin Modal"
              >
                <Box size={14} />
                Digital Twin Modal
              </button>
              <button
                onClick={resetCamera}
                className="btn bg-white/95 backdrop-blur shadow-card text-navy hover:bg-white text-xs px-3 py-2 flex items-center gap-1.5 border border-border rounded-xl"
                title="View full precinct"
              >
                <Compass size={14} className="text-govblue" />
                Precinct View
              </button>
              <button
                onClick={() => setPanelOpen((o) => !o)}
                className="btn bg-white/95 backdrop-blur shadow-card text-navy hover:bg-white text-xs px-3 py-2 flex items-center gap-1.5 border border-border rounded-xl"
              >
                <Layers size={14} className="text-govblue" />
                Layers {panelOpen ? '▾' : '▸'}
              </button>
            </div>
          </div>
        )}

        {/* Floating Laptop Trackpad Controls Widget (Right Side) */}
        {!cesiumError && cesiumLoaded && (
          <div className="absolute right-4 top-20 z-10 flex flex-col items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-2xl text-white">
            {/* Trackpad Mode Toggle */}
            <button
              onClick={() => switchTrackpadMode(trackpadMode === 'orbit' ? 'pan' : 'orbit')}
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all text-xs font-semibold',
                trackpadMode === 'orbit'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
              title={`Laptop Trackpad Mode: ${trackpadMode === 'orbit' ? '1-Finger Orbit' : '1-Finger Pan'}`}
            >
              {trackpadMode === 'orbit' ? <RotateCcw size={16} /> : <Move size={16} />}
            </button>

            <div className="w-6 h-[1px] bg-slate-700 my-0.5" />

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title="Zoom In (or 2-finger scroll up)"
            >
              <ZoomIn size={16} />
            </button>

            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title="Zoom Out (or 2-finger scroll down)"
            >
              <ZoomOut size={16} />
            </button>

            {/* Rotate Left 25 deg */}
            <button
              onClick={handleRotateLeft}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title="Rotate Left 25°"
            >
              <RotateCcw size={15} />
            </button>

            {/* Rotate Right 25 deg */}
            <button
              onClick={handleRotateRight}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title="Rotate Right 25°"
            >
              <RotateCw size={15} />
            </button>

            {/* 2D / 3D Tilt */}
            <button
              onClick={handleTiltToggle}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors text-[10px] font-bold"
              title="Toggle Top-down 2D / Oblique 3D (or hold Shift + Drag)"
            >
              📐 3D
            </button>

            {/* Reset North */}
            <button
              onClick={resetCamera}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center transition-colors"
              title="Reset View & Orient North"
            >
              <Compass size={16} />
            </button>

            {/* Trackpad Guide Tooltip Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowTrackpadHelp((h) => !h)}
                className="w-7 h-7 mt-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                title="Laptop Trackpad Gestures Guide"
              >
                <Info size={13} />
              </button>

              {showTrackpadHelp && (
                <div className="absolute right-10 top-0 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl text-[11px] text-slate-300 space-y-1.5 z-30">
                  <div className="font-bold text-cyan-400 text-xs">Laptop Trackpad Controls</div>
                  <div>• <strong>1-Finger Drag:</strong> Orbit 3D scene (or Pan)</div>
                  <div>• <strong>2-Finger Scroll:</strong> Zoom in and out</div>
                  <div>• <strong>Shift + Drag:</strong> Tilt camera up / down</div>
                  <div>• <strong>Pinch:</strong> Smooth precision zoom</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Property HUD Info Card */}
        {!cesiumError && cesiumLoaded && (
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-xl p-4 text-xs shadow-panel max-w-md border border-border/80 z-10 transition-all">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-navy text-sm">{selectedProperty.name}</span>
              <span
                className={clsx(
                  'text-[10px] font-mono px-2 py-0.5 rounded font-bold',
                  selectedProperty.status === 'VERIFIED' ? 'badge-verified' : 'badge-warning'
                )}
              >
                {selectedProperty.status === 'VERIFIED' ? '3D ULPIN CERTIFIED' : 'REVIEW FLAGGED'}
              </span>
            </div>

            <div className="text-muted font-mono text-[11px] mb-2.5 flex items-center justify-between">
              <span>ULPIN: <strong className="text-govblue">{selectedProperty.ulpin}</strong></span>
              <span>Parcel: {selectedProperty.parcelRef}</span>
            </div>

            {selectedFeature ? (
              <div className="p-2.5 rounded-lg bg-govblue/10 border border-govblue/20 text-navy mb-2.5 animate-fadeIn">
                <div className="font-semibold text-xs text-govblue">{selectedFeature.name}</div>
                <div className="text-[11px] text-muted mt-0.5">{selectedFeature.description}</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-surface rounded-lg mb-2.5 text-center">
                <div>
                  <span className="text-[10px] text-muted block">Levels</span>
                  <strong className="text-navy text-xs">{selectedProperty.floors} Floors</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Total Height</span>
                  <strong className="text-navy text-xs">{selectedProperty.height_m}m</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Base MSL</span>
                  <strong className="text-navy text-xs">{selectedProperty.base_elev_m}m</strong>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60 text-[10px]">
              <span className="badge-real">COP30 DEM TERRAIN</span>
              <span className="badge-real">TGRAC CADASTRAL</span>
              <span className="badge-info">{propertiesList.length} PROPERTIES IN SCENE</span>
              {selectedProperty.encroachmentOffset_m && (
                <span className="badge-critical font-semibold">
                  +{selectedProperty.encroachmentOffset_m}m WEST OVERHANG
                </span>
              )}
            </div>

            {/* Launch Digital Twin Modal Button */}
            <button
              onClick={() => setDigitalTwinModalOpen(true)}
              className="btn-primary text-xs w-full mt-3 py-2 flex items-center justify-center gap-1.5"
            >
              <Maximize2 size={13} />
              Open 3D Digital Twin Modal for {selectedProperty.name.split('—')[0]}
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {!cesiumLoaded && !cesiumError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center text-white space-y-3">
              <div className="w-12 h-12 border-3 border-teal/30 border-t-teal rounded-full animate-spin mx-auto" />
              <div className="font-semibold text-base">Loading TRINETRA 3D GIS Multi-Property Precinct…</div>
              <div className="text-white/50 text-xs font-mono">
                Streaming terrain elevation, {propertiesList.length} volumetric 3D properties, and subterranean utility lines
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
              Precinct Spatial Layers
            </div>
            <p className="text-muted text-[11px] mt-0.5">Toggle 3D properties, cadastral parcels and utilities</p>
          </div>

          <div className="flex-1 p-3.5 space-y-2">
            {layers.map((layer) => {
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
                      <div className="badge text-[9px] mt-0.5 py-0 px-1.5 inline-block badge-real">
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

          {/* District Summary Card */}
          <div className="p-4 border-t border-border bg-surface/40 text-xs text-muted space-y-2">
            <div className="font-semibold text-navy text-[11px]">Banjara Hills Precinct Summary</div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Active 3D Properties:</span>
                <strong className="text-navy">{propertiesList.length} Buildings</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total 3D Floor Plates:</span>
                <strong className="text-navy">
                  {propertiesList.reduce((acc, p) => acc + p.floors, 0)} Levels
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Underground Networks:</span>
                <strong className="text-navy">Water, Sewer, 11kV Grid</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Twin Modal */}
      <DigitalTwinModal
        isOpen={digitalTwinModalOpen}
        onClose={() => setDigitalTwinModalOpen(false)}
        initialPropertyId={selectedProperty?.id}
      />
    </div>
  )
}
