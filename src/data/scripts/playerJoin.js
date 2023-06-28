import { world, system, Player } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

world.afterEvents.playerSpawn.subscribe(eventData => {
    let player = eventData.player;
    let joined = eventData.initialSpawn;
    if (!player.hasTag("dave:hasJoined")) {
    	/*const { x, y, z } = player.location;
    	player.teleport({
            x: Number(x),
            y: 172,
            z: Number(y)
        }, {
        	dimension: world.getDimension('overworld')
        });*/
        player.runCommandAsync("gamerule sendcommandfeedback false");
        player.runCommandAsync("effect @s slow_falling 15 1 true");
  	  player.runCommandAsync("tp @s ~ 172 ~");
    }
});