import { world, system, ItemTypes, ItemStack, Block, MinecraftItemTypes, Vector } from "@minecraft/server";

// #1 Corrupt lightning bolt vfx
function runCmd() {
    const entities = Array.from(world.getDimension("overworld").getEntities());
    for (const entity of entities) {
    	if (entity.typeId == 'dave:thunder') {
    		system.runTimeout(() => {
    			entity.runCommandAsync('execute as @s run summon lightning_bolt');
    			entity.runCommandAsync('execute as @s run particle dave:thunder_fritters ~~1~');
    			entity.runCommandAsync('camerashake add @a[r=50] 0.3 1.5');
    		}, 19);
		}
	}
}

world.afterEvents.entitySpawn.subscribe(runCmd);


// #2 No punching tree
const logTypes = [
    "minecraft:acacia_log",
    "minecraft:birch_log",
    "minecraft:cherry_log",
    "minecraft:dark_oak_log",
    "minecraft:jungle_log",
    "minecraft:mangrove_log",
    "minecraft:oak_log",
    "minecraft:spruce_log",
    "minecraft:stripped_acacia_log",
    "minecraft:stripped_birch_log",
    "minecraft:stripped_cherry_log",
    "minecraft:stripped_dark_oak_log",
    "minecraft:stripped_jungle_log",
    "minecraft:stripped_mangrove_log",
    "minecraft:stripped_oak_log",
    "minecraft:stripped_spruce_log",
	"minecraft:planks",
	"minecraft:mangrove_planks",
	"minecraft:cherry_planks",
	"minecraft:bamboo_planks",
];

system.runInterval(() => {
	//let players = world.getPlayers();
    //await null;
      
    for (const player of world.getAllPlayers()) {
        let block = player.getBlockFromViewDirection();
        //let item = player.itemStack;
        let inv = player.getComponent("inventory").container;
        let item = inv.getItem(player.selectedSlot);
        if (!(item?.hasTag('minecraft:is_axe')) && logTypes.includes(block?.typeId)) {
            //console.warn("Detected log block:", block.typeId);
            player.runCommandAsync("effect @s mining_fatigue 1 255 true");
            player.runCommandAsync("title @s actionbar An axe is required to chop a wood");
        }
    }
}, 20);

// #3 When player destroy a block
const grassTypes = [
	"minecraft:flower",
	"minecraft:sapling",
	"minecraft:tallgrass",
	"minecraft:double_plant",
];
const stoneTypes = [
	"minecraft:stone",
	"minecraft:blackstone",
	"minecraft:deepslate",
	"minecraft:cobblestone",
	"minecraft:cobbled_deepslate",
];

world.afterEvents.blockBreak.subscribe(
    ({
        player,
        dimension,
        block,
        brokenBlockPermutation
    }) => {
    //let randomAmount = Math.floor(Math.random()*2);
    const getRandomNumber = () => Math.random() < 0.7 ? 0 : 1;
    const randomAmount = getRandomNumber();
	let inv = player.getComponent("inventory").container;
    let item = inv.getItem(player.selectedSlot);
    //dave:cut_plant
	if (item?.typeId == 'dave:wooden_shears' && grassTypes.includes(brokenBlockPermutation.type.id) || brokenBlockPermutation?.hasTag('cut_plant')) {
		
		if (randomAmount > 0) {
			player.dimension.spawnItem(new ItemStack("dave:cut_plant", randomAmount ), new Vector(block.location.x, block.location.y, block.location.z));
			//console.warn(item.getComponent("durability").maxDurability)
		}
	}
	
	//gravel
	if (!(item?.hasTag('minecraft:is_shovel')) && brokenBlockPermutation.type.id == 'minecraft:gravel') {
		player.runCommandAsync('kill @e[type=item,name=gravel,r=7,tag=!dont_kill]');
		player.runCommandAsync('kill @e[type=item,name=flint,r=7,tag=!dont_kill]');
		player.runCommandAsync('title @s actionbar Use a shovel to get gravel or flint');
		
	} else if ((item?.hasTag('minecraft:is_shovel')) && brokenBlockPermutation.type.id == 'minecraft:gravel') {
		player.runCommandAsync('tag @e[type=item,name=gravel,r=7] add dont_kill');
		player.runCommandAsync('tag @e[type=item,name=flint,r=7] add dont_kill');
	}
	
	//nautilus_shell
	if (item?.typeId == 'minecraft:stick' && brokenBlockPermutation.type.id == 'minecraft:sand' && randomAmount > 0) {
		player.dimension.spawnItem(new ItemStack("minecraft:nautilus_shell", randomAmount ), new Vector(block.location.x, block.location.y, block.location.z));
	}
	
	//stonestonestome
	if (item?.typeId == 'minecraft:wooden_pickaxe' && stoneTypes.includes(brokenBlockPermutation.type.id)) {
		player.dimension.spawnItem(new ItemStack("dave:stone_shard", 1 ), new Vector(block.location.x, block.location.y, block.location.z));
		switch (brokenBlockPermutation.type.id) {
			case 'minecraft:stone':
				console.warn('Stone has been destroyed');
				player.runCommandAsync('kill @e[type=item,name=cobblestone,r=7,tag=!dont_kill]');
				break;
			case 'minecraft:blackstone':
				console.warn('Blackstone has been destroyed');
				player.runCommandAsync('kill @e[type=item,name=blackstone,r=7,tag=!dont_kill]');
				break;
			case 'minecraft:deepslate':
				console.warn('Deepslate has been destroyed');
				player.runCommandAsync('kill @e[type=item,name=cobbled_deepslate,r=7,tag=!dont_kill]');
				break;
			case 'minecraft:cobblestone':
				console.warn('Cobblestone has been destroyed');
				player.runCommandAsync('kill @e[type=item,name=cobblestone,r=7,tag=!dont_kill]');
				break;
			case 'minecraft:cobbled_deepslate':
				console.warn('Cobbled Deepslate has been destroyed');
				player.runCommandAsync('kill @e[type=item,name=cobbled_deepslate,r=7,tag=!dont_kill]');
				break;
			default:
				console.warn('An unknown block has been destroyed');
				
		}
	} else if (!(item?.hasTag('minecraft:wooden_pickaxe')) && stoneTypes.includes(brokenBlockPermutation.type.id)) {
		player.runCommandAsync('tag @e[type=item,r=7] add dont_kill');
	}
})
