export const usePageMeta = (title: string, subtitle?: string) => {
  useState('pageTitle', () => title).value = title
  useState('pageSubtitle', () => subtitle ?? '').value = subtitle ?? ''
}
