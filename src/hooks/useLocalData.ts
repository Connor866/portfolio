import { useEffect, useRef, useState } from 'react'
import { DATA_CHANGED_EVENT } from '../api/storage'

/**
 * 订阅某份本地数据。
 *
 * 传入一个读取函数，组件会在以下时机自动拿到最新值：
 * - 后台调用 writeJSON / removeKey 触发 `kp:data-changed`；
 * - 用户在另一个标签页修改了 localStorage。
 */
export function useLocalData<T>(getter: () => T): T {
  const getterRef = useRef(getter)
  getterRef.current = getter

  const [value, setValue] = useState<T>(() => getter())

  useEffect(() => {
    const update = () => setValue(getterRef.current())
    window.addEventListener(DATA_CHANGED_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return value
}
