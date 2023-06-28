import { system, world, Player } from '@minecraft/server'
import { ChestFormData } from "./chestUI_forms.js"

world.afterEvents.itemUse.subscribe(event => {
     if (event.itemStack.typeId == "minecraft:compass") {

          let form = new ChestFormData()
          .title("LeGend Form")
          .button("Test Item", ["test lore", "test lore 1"], "textures/items/apple", 1)
          .button("Test Item2", ["test lore", "test lore 1"], "textures/items/book_of_noctura", 2)
          .show(event.source).then(response => {
               console.warn(response.selection)
          })
          
     } else { return; }
})
