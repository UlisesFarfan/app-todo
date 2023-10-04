import { Card } from "@nextui-org/react"

const ItemWorkSpace = ({ item }: any) => {

  console.log(item)
  return (
    <Card>
      {item._id}
    </Card>
  )
}

export default ItemWorkSpace