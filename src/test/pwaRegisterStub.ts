// 测试环境下 virtual:pwa-register/react 的惰性替身(见 vite.config test.alias)。
// 默认无更新、无副作用;需要触发「有新版本」的测试自行 vi.mock 覆盖。
export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}] as [boolean, (v: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (v: boolean) => void],
    updateServiceWorker: () => {},
  }
}
