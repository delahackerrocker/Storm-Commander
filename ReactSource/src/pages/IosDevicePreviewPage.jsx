import { useMemo, useState } from 'react'
import {
  DEFAULT_IOS_PREVIEW_DEVICE_ID,
  IOS_PREVIEW_DEVICES,
  IOS_PREVIEW_ORIENTATIONS,
  getIosPreviewDevice,
  getPreviewViewport,
} from '../preview/iosDeviceProfiles'

function createIosFrameSrc() {
  const url = new URL(window.location.href)
  url.searchParams.set('storm-view', 'ios-frame')
  url.hash = ''

  return `${url.pathname}${url.search}`
}

export function IosDevicePreviewPage({ onBack }) {
  const [deviceId, setDeviceId] = useState(DEFAULT_IOS_PREVIEW_DEVICE_ID)
  const [orientation, setOrientation] = useState(IOS_PREVIEW_ORIENTATIONS.portrait)
  const selectedDevice = getIosPreviewDevice(deviceId)
  const viewport = useMemo(
    () => getPreviewViewport(selectedDevice, orientation),
    [orientation, selectedDevice],
  )
  const frameSrc = useMemo(() => createIosFrameSrc(), [])

  return (
    <div className="ios-preview-page">
      <header className="ios-preview-toolbar">
        {onBack ? (
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
        ) : null}

        <div className="ios-preview-title-group">
          <p className="ios-preview-eyebrow">Debug View</p>
          <h1>iOS Preview</h1>
        </div>

        <label className="ios-preview-field" htmlFor="ios-preview-device">
          <span>Device model</span>
          <select
            id="ios-preview-device"
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
          >
            {IOS_PREVIEW_DEVICES.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} - {device.detail}
              </option>
            ))}
          </select>
        </label>

        <div
          className="ios-preview-segmented-control"
          role="group"
          aria-label="Orientation"
        >
          <button
            type="button"
            aria-pressed={orientation === IOS_PREVIEW_ORIENTATIONS.portrait}
            onClick={() => setOrientation(IOS_PREVIEW_ORIENTATIONS.portrait)}
          >
            Portrait
          </button>
          <button
            type="button"
            aria-pressed={orientation === IOS_PREVIEW_ORIENTATIONS.landscape}
            onClick={() => setOrientation(IOS_PREVIEW_ORIENTATIONS.landscape)}
          >
            Landscape
          </button>
        </div>

        <p className="ios-preview-size" aria-live="polite">
          {viewport.width} x {viewport.height}
        </p>
      </header>

      <main className="ios-preview-workbench">
        <div
          className="ios-preview-frame-shell"
          style={{
            '--ios-preview-width': `${viewport.width}px`,
            '--ios-preview-height': `${viewport.height}px`,
          }}
        >
          <iframe
            className="ios-preview-frame"
            title="Storm Commander iOS preview"
            src={frameSrc}
            width={viewport.width}
            height={viewport.height}
            style={{
              width: `${viewport.width}px`,
              height: `${viewport.height}px`,
            }}
          />
        </div>
      </main>
    </div>
  )
}
