export const IOS_PREVIEW_ORIENTATIONS = {
  portrait: 'portrait',
  landscape: 'landscape',
}

export const IOS_PREVIEW_DEVICES = [
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    detail: '2nd/3rd gen',
    width: 375,
    height: 667,
  },
  {
    id: 'iphone-mini-x',
    name: 'iPhone mini / X',
    detail: 'tall compact',
    width: 375,
    height: 812,
  },
  {
    id: 'iphone-standard',
    name: 'iPhone standard',
    detail: '12-14',
    width: 390,
    height: 844,
  },
  {
    id: 'iphone-standard-modern',
    name: 'iPhone modern',
    detail: '15-16',
    width: 393,
    height: 852,
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    detail: 'current Pro',
    width: 402,
    height: 874,
  },
  {
    id: 'iphone-plus-max',
    name: 'iPhone Plus / Max',
    detail: 'large',
    width: 430,
    height: 932,
  },
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    detail: 'tall Max',
    width: 440,
    height: 956,
  },
]

export const DEFAULT_IOS_PREVIEW_DEVICE_ID = 'iphone-16-pro'

export function getIosPreviewDevice(deviceId) {
  return (
    IOS_PREVIEW_DEVICES.find((device) => device.id === deviceId) ??
    IOS_PREVIEW_DEVICES.find((device) => device.id === DEFAULT_IOS_PREVIEW_DEVICE_ID) ??
    IOS_PREVIEW_DEVICES[0]
  )
}

export function getPreviewViewport(device, orientation = IOS_PREVIEW_ORIENTATIONS.portrait) {
  const profile = typeof device === 'string' ? getIosPreviewDevice(device) : device
  const isLandscape = orientation === IOS_PREVIEW_ORIENTATIONS.landscape

  return {
    width: isLandscape ? profile.height : profile.width,
    height: isLandscape ? profile.width : profile.height,
  }
}
