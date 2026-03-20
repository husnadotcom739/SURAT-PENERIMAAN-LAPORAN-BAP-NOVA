import { useEffect, useState } from 'react'

const useGetDeviceInfo = () => {

    const detectDevice = () => {
        const { userAgent } = navigator
        if (userAgent.includes('Windows NT')) {
          return 'Windows'
        } else if (userAgent.includes('Mac OS X')) {
          return 'Mac'
        } else {
          return 'Other'
        }
    }

    const detectOS = () => {
        const { userAgent } = navigator
        if (userAgent.includes('Windows NT')) {
          return 'Windows NT'
        } else if (userAgent.includes('Mac OS X')) {
          return 'Mac OS X'
        } else {
          return 'Other'
        }
    }

    const detectBrowser = () => {
        return navigator.userAgent
    }

    useEffect(() => {

    }, [])

    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    return {
        detectDevice,
        detectOS,
        detectBrowser,
        screenSize,
    }
}

export default useGetDeviceInfo;