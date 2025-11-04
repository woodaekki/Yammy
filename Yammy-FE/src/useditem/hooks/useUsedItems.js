import { useEffect, useState } from "react"
import { getAllUsedItems } from "../api/usedItemApi"

export const useUsedItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      const data = await getAllUsedItems()
      setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [])

  return { items, loading }
}
