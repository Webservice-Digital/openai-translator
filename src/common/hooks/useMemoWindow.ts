/* eslint-disable @typescript-eslint/no-explicit-any */
import { event } from '@tauri-apps/api'
import { getCurrent, PhysicalPosition, PhysicalSize } from '@tauri-apps/api/window'
import { useEffect } from 'react'

export type WindowMemoProps = {
    size: boolean
    position: boolean
}

/**
 * memorized window props
 */
export const useMemoWindow = (props: WindowMemoProps) => {
    useEffect(() => {
        const appWindow = getCurrent()
        const initWindow = async () => {
            try {
                if (props.position) {
                    const storagePosition = localStorage.getItem('_position')
                    if (storagePosition) {
                        const { x, y } = JSON.parse(storagePosition)
                        if (x < 0 || y < 0) {
                            await appWindow.center()
                        } else {
                            await appWindow.setPosition(new PhysicalPosition(x, y))
                        }
                    } else {
                        await appWindow.center()
                    }
                } else {
                    localStorage.removeItem('_position')
                }
                if (props.size) {
                    const storageSize = localStorage.getItem('_size')
                    if (storageSize) {
                        let { height, width } = JSON.parse(storageSize)
                        height = Math.max(height, 800)
                        width = Math.max(width, 600)
                        await appWindow.setSize(new PhysicalSize(width, height))
                    }
                } else {
                    localStorage.removeItem('_size')
                }
            } catch (e) {
                console.error(e)
            } finally {
                await appWindow.unminimize()
                await appWindow.setFocus()
                await appWindow.show()
            }
        }
        initWindow()
    }, [props.position, props.size])

    useEffect(() => {
        let unListenMove: (() => void) | undefined
        let unListenResize: (() => void) | undefined
        event
            .listen(event.TauriEvent.WINDOW_MOVED, (event: { payload: any }) => {
                localStorage.setItem('_position', JSON.stringify(event.payload))
            })
            .then((unListen) => {
                unListenMove = unListen
            })
        event
            .listen(event.TauriEvent.WINDOW_RESIZED, (event: { payload: any }) => {
                localStorage.setItem('_size', JSON.stringify(event.payload))
            })
            .then((unListen) => {
                unListenResize = unListen
            })
        return () => {
            unListenMove?.()
            unListenResize?.()
        }
    }, [])
}
