import { world, system, Player } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
    	player.runCommandAsync("fill ~-10~-10~-10 ~10~10~10 dave:timegate_block replace portal")
	}
});

system.events.scriptEventReceive.subscribe(
    ({
        id,
        sourceEntity
    }) => {
        if (!(sourceEntity instanceof Player)) return;
        if (id == "dave:timegate_block_detect") {
            timegateForm(sourceEntity);
        };
    }, {
        namespaces: [
            "dave",
        ],
    },
);

world.afterEvents.itemUse.subscribe((eventData) => {
	let item = eventData.itemStack
	let player = eventData.source
    if (item?.typeId == 'dave:timeinabottle') {
    	timebottleForm(player);
    }
});

function timegateForm(player) {
    const form1 = new ActionFormData()
        .title("§lTimegate")
        .button("§lAdd New Timegate")
    const timegateTags = player.getTags().filter(tags => tags.startsWith('timegate:'))
    for (let tag of timegateTags) {
        form1.button(`${tag.match(/(?<=timegate:).*?(?=-)/)[0]}`);
    }
    form1.show(player).then((response) => {
        if (response.selection == 0) {
            timegateAddForm(player);
        }
        if (response.selection) {
            console.warn("response 1")
            let selectedTags = timegateTags[response.selection - 1];
            if (selectedTags) {
                let timegateName = selectedTags.match(/(?<=timegate:).*?(?=-)/);
                if (timegateName) {
                    const regex = /^timegate:([^-\|]+)-(-?\d+)\|(-?\d+)\|(-?\d+)$/;
                    const match = regex.exec(selectedTags);
                    const xCoord = parseInt(match[2]);
                    const yCoord = parseInt(match[3]);
                    const zCoord = parseInt(match[4]);
                    player.teleport({
                    	x: Number(xCoord),
                        y: Number(yCoord),
                        z: Number(zCoord)
                    }, {
                        dimension: world.getDimension('overworld')
                    });
                    player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"<Noctura> Teleported to Timegate: §e${timegateName}!"}]}`);
                    player.runCommandAsync(`effect @s nausea 8 100 true`);
                    player.runCommandAsync(`effect @s hunger 4 10 true`);
                    player.runCommandAsync(`effect @s blindness 4 100 true`);
                } else {
                    console.warn("The tag doesn't match the pattern LOL!");
                }
            } else {
                console.warn("SELECTEDTAGS IS NULL!!!!");
            }
        }
    });
}

function timebottleForm(player) {
    const form1 = new ActionFormData()
        .title("§lTime in a bottle")
        .button("§lAdd New Timegate")
    const timegateTags = player.getTags().filter(tags => tags.startsWith('timegate:'))
    for (let tag of timegateTags) {
        form1.button(`${tag.match(/(?<=timegate:).*?(?=-)/)[0]}`);
    }
    if (timegateTags.length > 0) {
        form1.show(player).then((response) => {
        	if (response.selection == 0) {
            	player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"<Noctura> Create Timegate portals using Obsidian, and lit them with Flint and steel."}]}`);
        	}
            if (response.selection) {
                console.warn("response 1")
                let selectedTags = timegateTags[response.selection - 1];
                if (selectedTags) {
                    let timegateName = selectedTags.match(/(?<=timegate:).*?(?=-)/);
                    if (timegateName) {
                        const regex = /^timegate:([^-\|]+)-(-?\d+)\|(-?\d+)\|(-?\d+)$/;
                        const match = regex.exec(selectedTags);
                        const xCoord = parseInt(match[2]);
                        const yCoord = parseInt(match[3]);
                        const zCoord = parseInt(match[4]);
                        player.teleport({
                            x: Number(xCoord),
                            y: Number(yCoord),
                            z: Number(zCoord)
                        }, {
                            dimension: world.getDimension('overworld')
                        });
                        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"<Noctura> Teleported to Timegate: §e${timegateName}!"}]}`);
                        player.runCommandAsync(`effect @s nausea 8 100 true`);
                        player.runCommandAsync(`effect @s hunger 4 10 true`);
                        player.runCommandAsync(`effect @s blindness 4 100 true`);
                    } else {
                        console.warn("The tag doesn't match the pattern LOL!");
                    }
                } else {
                    console.warn("SELECTEDTAGS IS NULL!!!!");
                }
            }
        });
    } else {
    	player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"<Noctura> §cYou don't have Timegate saved!"}]}`);
    }
}

function timegateAddForm (player) {
	let block = player.getBlockFromViewDirection();
	const xCoord = Math.floor(block.location.x);
	const yCoord = Math.floor(block.location.y);
	const zCoord = Math.floor(block.location.z);
	const form2 = new ModalFormData()
		.title(`Add New Timegate`)
		.textField(`Enter the timegate name §c*(required)`, `My Timegate`);
	form2.show(player).then((response) => {
		let timegateName = response.formValues[0];
		var timegateTag = `timegate:${timegateName}-${xCoord}|${yCoord}|${zCoord}`;
		if (timegateName == "") {
			player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"<Noctura> §cPlease fill timegate name in the text field!"}]}`);
		} else {
			player.addTag(timegateTag);
			player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"<Noctura> §aTimegate has been saved!"}]}`);
		}
	});
	console.warn(`Add new timegate ${xCoord} ${yCoord} ${zCoord}`);
} 

// Timegate portal system
function handleBlockBreak({
    player,
    dimension,
    block,
    brokenBlockPermutation
}) {
    if (!isObsidianOrTimegateBlock(brokenBlockPermutation.type.id)) return;
    if (brokenBlockPermutation.type.id === "minecraft:obsidian") {
        const adjacentBlocks = getAdjacentBlocks(block, dimension);
        adjacentBlocks.forEach(adjacentBlock => {
            if (adjacentBlock.typeId === "dave:timegate_block") {
                breakBlocks(adjacentBlock, dimension, player);
            }
        });
    } else if (brokenBlockPermutation.type.id === "dave:timegate_block") {
        breakBlocks(block, dimension, player);
    }
}

function breakBlocks(block, dimension, player) {
    if (block.typeId !== "dave:timegate_block") return;
    block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air replace`);
    const adjacentBlocks = getAdjacentBlocks(block, dimension);
    adjacentBlocks.forEach(adjacentBlock => {
        breakBlocks(adjacentBlock, dimension, player);
    });
    console.warn(`Destroyed timegate_block at coordinates: ${block.location.x}, ${block.location.y}, ${block.location.z}`);
    if (player.getTags().filter(v => v.startsWith('timegate:'))) {
    	const timegateTags = player.getTags().filter(v => v.startsWith('timegate:'))
    	for (let tag of timegateTags) {
            let timegateName = tag.match(/(?<=timegate:).*?(?=-)/)[0];
            let timegateTag = `timegate:${timegateName}-${block.location.x}|${block.location.y}|${block.location.z}`
            player.removeTag(timegateTag)
        }
    }
}

function getAdjacentBlocks(block, dimension) {
    const directions = [{
            x: 1,
            y: 0,
            z: 0
        },
        {
            x: -1,
            y: 0,
            z: 0
        },
        {
            x: 0,
            y: 1,
            z: 0
        },
        {
            x: 0,
            y: -1,
            z: 0
        },
        {
            x: 0,
            y: 0,
            z: 1
        },
        {
            x: 0,
            y: 0,
            z: -1
        }
    ];
    const adjacentBlocks = directions.map(direction => dimension.getBlock({
        x: block.location.x + direction.x,
        y: block.location.y + direction.y,
        z: block.location.z + direction.z
    }));
    return adjacentBlocks.filter(adjacentBlock => adjacentBlock !== null);
}

function isObsidianOrTimegateBlock(blockType) {
    return blockType === "minecraft:obsidian" || blockType === "dave:timegate_block";
}
world.afterEvents.blockBreak.subscribe(handleBlockBreak);