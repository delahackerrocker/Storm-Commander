# Storm Commander iOS Wrapper

This folder packages the React prototype from `../ReactSource` as an iOS app with Capacitor.

`ReactSource` remains the gameplay source of truth. The `dist/` and `ios/App/App/public/`
outputs are generated from that source and are ignored.

## Commands

```bash
npm install
npm run build:web
npm run ios:sync
npm run ios:open
npm run ios:run
```

## Native App Settings

- App name: `Storm Commander`
- Bundle id: `digital.practitioner.stormcommander`
- iOS deployment target: 15.0
- Devices: iPhone and iPad
- Orientations: portrait, landscape left, and landscape right

## Notes

The generated app icon and splash sources live in `assets/`. Re-run
`npm run ios:assets` after replacing those source images.

`ios/App/App/AppDelegate.swift` intentionally returns `false` from the universal-link
continuation method because the Swift Package version of Capacitor 8.3.4 used by the
generated project does not expose the matching proxy method. The current app does not use
universal links or native plugins.
