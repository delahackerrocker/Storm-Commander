export const IOS_PREVIEW_ORIENTATIONS = {
  portrait: 'portrait',
  landscape: 'landscape',
}

export const IOS_PREVIEW_DEVICES = [
  {
    id: 'iphone-se',
    family: 'iPhone',
    name: 'iPhone SE',
    detail: '2nd/3rd gen',
    width: 375,
    height: 667,
  },
  {
    id: 'iphone-mini-x',
    family: 'iPhone',
    name: 'iPhone mini / X',
    detail: 'tall compact',
    width: 375,
    height: 812,
  },
  {
    id: 'iphone-standard',
    family: 'iPhone',
    name: 'iPhone standard',
    detail: '12-14',
    width: 390,
    height: 844,
  },
  {
    id: 'iphone-standard-modern',
    family: 'iPhone',
    name: 'iPhone modern',
    detail: '15-16',
    width: 393,
    height: 852,
  },
  {
    id: 'iphone-16-pro',
    family: 'iPhone',
    name: 'iPhone 16 Pro',
    detail: 'current Pro',
    width: 402,
    height: 874,
  },
  {
    id: 'iphone-plus-max',
    family: 'iPhone',
    name: 'iPhone Plus / Max',
    detail: 'large',
    width: 430,
    height: 932,
  },
  {
    id: 'iphone-16-pro-max',
    family: 'iPhone',
    name: 'iPhone 16 Pro Max',
    detail: 'tall Max',
    width: 440,
    height: 956,
  },
  {
    id: 'ipad-mini',
    family: 'iPad',
    name: 'iPad mini',
    detail: 'A17 Pro / 6th gen',
    width: 744,
    height: 1133,
  },
  {
    id: 'ipad-9th',
    family: 'iPad',
    name: 'iPad 10.2"',
    detail: '7th-9th gen',
    width: 810,
    height: 1080,
  },
  {
    id: 'ipad-air-11',
    family: 'iPad',
    name: 'iPad / Air 11"',
    detail: 'A16 / M-series',
    width: 820,
    height: 1180,
  },
  {
    id: 'ipad-pro-11',
    family: 'iPad',
    name: 'iPad Pro 11"',
    detail: 'M5 / M4',
    width: 834,
    height: 1210,
  },
  {
    id: 'ipad-pro-11-classic',
    family: 'iPad',
    name: 'iPad Pro 11"',
    detail: '1st-4th gen',
    width: 834,
    height: 1194,
  },
  {
    id: 'ipad-air-13',
    family: 'iPad',
    name: 'iPad Air 13"',
    detail: '12.9" bucket',
    width: 1024,
    height: 1366,
  },
  {
    id: 'ipad-pro-13',
    family: 'iPad',
    name: 'iPad Pro 13"',
    detail: 'M5 / M4',
    width: 1032,
    height: 1376,
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
