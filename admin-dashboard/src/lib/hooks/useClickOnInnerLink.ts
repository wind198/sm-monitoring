export default function useClickOnInnerLink() {
  const handleClickOnInnerLink = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    const target = event.target as HTMLElement
    const innerLink = target.querySelector('a')

    if (!innerLink?.href) {
      return
    }
    const $event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      button: event.button,
    })
    innerLink.dispatchEvent($event)
  }
  return { handleClickOnInnerLink }
}
