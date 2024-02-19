import { Time } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';

import { GearStat } from '../../../../gear';
import { addStatsOfItemsTogether, Gear } from '../../../../structures/Gear';
import resolveItems from '../../../../util/resolveItems';
import { CustomMonster } from './customMonsters';

const solisMinGear = new Gear();
solisMinGear.equip('Gorajan warrior helmet');
solisMinGear.equip('Gorajan warrior top');
solisMinGear.equip('Gorajan warrior legs');
solisMinGear.equip('Gorajan warrior gloves');
solisMinGear.equip('Gorajan warrior boots');
solisMinGear.equip('TzKal cape');
solisMinGear.equip("Brawler's hook necklace");
solisMinGear.equip('Ignis ring(i)');
solisMinGear.equip('Drygore rapier');
solisMinGear.equip('Offhand dragon claw');

export const Solis: CustomMonster = {
	id: 129_124,
	baseMonster: Monsters.AbyssalSire,
	name: 'Solis',
	aliases: ['solis'],
	timeToFinish: Time.Minute * 120,
	hp: 3330,
	table: new LootTable().every('Solite', [10, 60]).tertiary(600, 'Eagle egg').tertiary(500, 'Sun-metal scraps'),
	difficultyRating: 5,
	qpRequired: 2500,
	healAmountNeeded: 350 * 200,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab],
	levelRequirements: {
		hitpoints: 120,
		attack: 110,
		strength: 110,
		defence: 110,
		magic: 110,
		ranged: 110,
		slayer: 110
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.8,
		steepness: 0.999,
		lowestDeathChance: 10,
		highestDeathChance: 80
	},
	minimumFoodHealAmount: 22,
	allItems: resolveItems(['Solite', 'Eagle egg', 'Sun-metal scraps']),
	minimumGearRequirements: {
		melee: {
			...solisMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Offhand dragon claw', 'Drygore rapier']), [GearStat.AttackStab])
	},
	itemCost: {
		itemCost: new Bank().add('Super combat potion(4)').add('Heat res. brew', 3).add('Heat res. restore'),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems(["Combatant's cape"]),
	customRequirement: async user => {
		const tames = await user.fetchTames();
		const hasMaxedIgne = tames.some(tame => tame.isMaxedIgneTame());
		if (hasMaxedIgne) return null;
		return 'You need to have a maxed Igne Tame (best gear, all fed items) to fight Solis.';
	},
	setupsUsed: ['melee']
};

// export const Celestara: CustomMonster = {
// 	id: 129_126,
// 	baseMonster: Monsters.AbyssalSire,
// 	name: 'Celestara',
// 	aliases: ['celestara'],
// 	timeToFinish: Time.Minute * 100,
// 	hp: 3330,
// 	table: new LootTable().every('Lunite', [10, 60]).tertiary(300, 'Noom'),
// 	difficultyRating: 5,
// 	qpRequired: 260,
// 	healAmountNeeded: 250 * 200,
// 	attackStyleToUse: GearStat.AttackStab,
// 	attackStylesUsed: [GearStat.AttackStab],
// 	levelRequirements: {
// 		hitpoints: 110,
// 		attack: 110,
// 		strength: 110,
// 		defence: 110,
// 		magic: 110,
// 		ranged: 110,
// 		slayer: 110
// 	},
// 	pohBoosts: {
// 		pool: {
// 			'Ancient rejuvenation pool': 5
// 		}
// 	},
// 	deathProps: {
// 		hardness: 0.8,
// 		steepness: 0.999,
// 		lowestDeathChance: 5,
// 		highestDeathChance: 70
// 	},
// 	minimumFoodHealAmount: 22,
// 	allItems: resolveItems(['Solite', 'Eagle egg', 'Sun-metal scraps']),
// 	minimumGearRequirements: {
// 		melee: {
// 			...solisMinGear.stats,
// 			ranged_strength: 0,
// 			attack_ranged: 0
// 		}
// 	},
// 	minimumWeaponShieldStats: {
// 		melee: addStatsOfItemsTogether(resolveItems(['Offhand dragon claw', 'Drygore rapier']), [GearStat.AttackStab])
// 	},
// 	itemCost: {
// 		itemCost: new Bank().add('Super combat potion(4)').add('Heat res. brew', 3).add('Heat res. restore'),
// 		qtyPerKill: 1
// 	},
// 	tameCantKill: true,
// 	itemsRequired: resolveItems(["Combatant's cape"])
// };

export const SunMoonMonsters = {
	Solis
};
