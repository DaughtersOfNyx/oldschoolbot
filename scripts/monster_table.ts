import { writeFileSync } from 'node:fs';
import { calcPerHour, convertBankToPerHourStats } from '@oldschoolgg/toolkit';
import type { PlayerOwnedHouse } from '@prisma/client';
import { Time } from 'e';
import { Bank, Items } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { itemID, resolveItems, toKMB } from 'oldschooljs/dist/util';

import '../src/lib/safeglobals';

import { type BitField, PVM_METHODS } from '../src/lib/constants';
import { degradeableItems } from '../src/lib/degradeableItems';
import { maxMage, maxMelee, maxRange } from '../src/lib/depthsOfAtlantis';
import { materialTypes } from '../src/lib/invention';
import { MaterialBank } from '../src/lib/invention/MaterialBank';
import { SlayerActivityConstants } from '../src/lib/minions/data/combatConstants';
import killableMonsters from '../src/lib/minions/data/killableMonsters';
import type { AttackStyles } from '../src/lib/minions/functions';
import { SkillsArray } from '../src/lib/skilling/types';
import { slayerMasters } from '../src/lib/slayer/slayerMasters';
import { SlayerRewardsShop, type SlayerTaskUnlocksEnum } from '../src/lib/slayer/slayerUnlocks';
import { ChargeBank } from '../src/lib/structures/Bank';
import { Gear } from '../src/lib/structures/Gear';
import { GearBank } from '../src/lib/structures/GearBank';
import { KCBank } from '../src/lib/structures/KCBank';
import { MUserStats } from '../src/lib/structures/MUserStats';
import {
	type MinionKillReturn,
	newMinionKillCommand
} from '../src/mahoji/lib/abstracted_commands/minionKill/newMinionKill';
import { doMonsterTrip } from '../src/tasks/minions/monsterActivity';

const MAX_TRIP_LENGTH = Time.Hour * 2.5;

function round(int: number) {
	return Math.round(int / 1000) * 1000;
}
const slayerUnlocks: SlayerTaskUnlocksEnum[] = SlayerRewardsShop.map(i => i.id);
const bank = new Bank();
for (const item of Items.values()) bank.add(item.id, 1000000);
const chargeBank = new ChargeBank();
for (const deg of degradeableItems) chargeBank.add(deg.settingsKey, 1000000);
const results: { tripResult: ReturnType<typeof doMonsterTrip>; commandResult: MinionKillReturn }[] = [];
const userStats = new MUserStats({} as any);

const attackStyleSets: AttackStyles[][] = [
	[SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence],
	[SkillsEnum.Ranged],
	[SkillsEnum.Magic],
	[SkillsEnum.Ranged, SkillsEnum.Defence],
	[SkillsEnum.Magic, SkillsEnum.Defence]
];

const skillsAsLevels: any = {};
for (const skill of SkillsArray) {
	skillsAsLevels[skill] = 99;
}
const materials = new MaterialBank();
for (const t of materialTypes) materials.add(t, 100000000);
const wildyGear = new Gear(maxRange.raw());
wildyGear.equip('Hellfire bow');
wildyGear.equip('Hellfire arrow', 10000);

const rangeGear = new Gear({
	head: 'Gorajan archer helmet',
	neck: 'Farsight snapshot necklace',
	body: 'Gorajan archer top',
	cape: 'Tidal collector (i)',
	hands: 'Gorajan archer gloves',
	legs: 'Gorajan archer legs',
	feet: 'Gorajan archer boots',
	'2h': 'Twisted bow',
	ring: 'Ring of piercing (i)',
	ammo: 'Dragon arrow'
});
rangeGear.equip('Dragon arrow', 1000000);
const gear = {
	mage: maxMage,
	melee: maxMelee,
	range: rangeGear,
	misc: new Gear(),
	skilling: new Gear(),
	wildy: wildyGear,
	fashion: new Gear(),
	other: new Gear()
};

const failures = new Set();
for (const monster of killableMonsters) {
	const monsterKC = 10000;
	const gearBank = new GearBank({
		chargeBank,
		gear,
		bank,
		skillsAsLevels,
		materials,
		pet: itemID('Ori')
	});

	const pkEvasionExperience = 100000000;
	const master = slayerMasters.find(m => m.tasks.find(t => t.monster.id === monster.id));
	const task = master?.tasks.find(t => t.monster.id === monster.id);
	const currentSlayerTask =
		master && task
			? {
					currentTask: {
						id: 1,
						created_at: new Date(),
						quantity: 10000,
						quantity_remaining: 10000,
						slayer_master_id: master.id,
						monster_id: monster.id,
						skipped: false,
						user_id: ''
					},
					assignedTask: task,
					slayerMaster: master,
					slayerPoints: 1000
				}
			: {
					currentTask: null,
					assignedTask: null,
					slayerMaster: null,
					slayerPoints: 1
				};

	for (const isTryingToUseWildy of [true, false]) {
		if ((isTryingToUseWildy && !monster.wildy) || (monster.canBePked && !isTryingToUseWildy)) continue;
		for (const inputPVMMethod of PVM_METHODS) {
			for (const attackStyles of attackStyleSets) {
				if (['barrage', 'burst'].includes(inputPVMMethod) && !monster.canBarrage) continue;
				const bitfield: BitField[] = [];
				const kcBank = new KCBank();
				const commandResult = newMinionKillCommand({
					gearBank,
					attackStyles,
					currentSlayerTask: currentSlayerTask as any,
					monster,
					isTryingToUseWildy,
					monsterKC,
					inputPVMMethod,
					maxTripLength: MAX_TRIP_LENGTH,
					pkEvasionExperience,
					poh: {
						pool: 29_241
					} as PlayerOwnedHouse,
					inputQuantity: undefined,
					combatOptions: [],
					slayerUnlocks: [],
					favoriteFood: resolveItems(['Shark']),
					bitfield: [],
					currentPeak: { peakTier: 'medium' } as any,
					disabledInventions: []
				});
				if (typeof commandResult === 'string') {
					if (!failures.has(commandResult)) {
						console.log(commandResult);
					}
					failures.add(commandResult);
					continue;
				}
				if (commandResult.quantity === null || !commandResult.quantity) {
					throw new Error(`Invalid quantity: ${commandResult.quantity} for ${monster.name}`);
				}
				const {
					bob,
					usingCannon,
					cannonMulti,
					chinning,
					hasWildySupplies,
					died,
					pkEncounters,
					isInWilderness
				} = commandResult.currentTaskOptions;
				const tripResult = doMonsterTrip({
					type: 'MonsterKilling',
					mi: monster.id,
					q: commandResult.quantity,
					usingCannon,
					cannonMulti,
					bob,
					died,
					pkEncounters,
					hasWildySupplies,
					isInWilderness,
					hasEliteCA: true,
					hasKourendHard: true,
					kcBank,
					gearBank,
					tertiaryItemPercentageChanges: new Map(),
					slayerInfo: currentSlayerTask,
					slayerUnlocks,
					hasKourendElite: true,
					userStats,
					attackStyles,
					duration: commandResult.duration,
					bitfield,
					chinning,
					disabledInventions: [],
					cl: new Bank()
				});

				results.push({ tripResult, commandResult });
			}
		}
	}
}

results.sort((a, b) => b.tripResult.updateBank.xpBank.totalXP() - a.tripResult.updateBank.xpBank.totalXP());

const headers = [
	'Monster',
	'AttackStyle',
	'Total XP/hr',
	'Raw Total XP/hr',
	'XP/hr',
	'Options',
	'Food',
	'Cost/hr',
	'Loot/hr'
];
const rows = results
	.map(({ tripResult, commandResult }) => {
		const xpHr = round(calcPerHour(tripResult.updateBank.xpBank.totalXP(), commandResult.duration));
		const gpHr = round(calcPerHour(tripResult.updateBank.itemLootBank.value(), commandResult.duration));

		const options: any = [];
		if (commandResult.currentTaskOptions.bob === SlayerActivityConstants.IceBarrage) {
			options.push('Barrage');
		}
		if (commandResult.currentTaskOptions.bob === SlayerActivityConstants.IceBurst) {
			options.push('Burst');
		}
		if (commandResult.currentTaskOptions.chinning) {
			options.push('Chinning');
		}
		if (commandResult.currentTaskOptions.isInWilderness) {
			options.push('Is In Wilderness');
		}
		options.push(tripResult.slayerContext.isOnTask ? 'On Task' : 'Off Task');
		if (xpHr < 35_000 && gpHr < 300_000) return null;

		const totalSharks = commandResult.updateBank.itemCostBank.amount('Shark');
		const sharksPerHour = calcPerHour(totalSharks, commandResult.duration);

		const xpHrBreakdown: string[] = [];
		for (const skill of SkillsArray) {
			if (tripResult.updateBank.xpBank.amount(skill) > 0) {
				xpHrBreakdown.push(
					`${calcPerHour(tripResult.updateBank.xpBank.amount(skill), commandResult.duration).toFixed(0)}/hr ${skill}`
				);
			}
		}

		return [
			tripResult.monster.name,
			commandResult.attackStyles
				.join('-')
				.replace('attack', 'atk')
				.replace('defence', 'def')
				.replace('magic', 'mage')
				.replace('ranged', 'range')
				.replace('strength', 'str'),
			`${toKMB(xpHr)} XP/hr`,
			Math.floor(xpHr).toLocaleString(),
			xpHrBreakdown.join(' | '),
			options.join(' '),
			`${sharksPerHour.toFixed(1)} Sharks/hr`,
			convertBankToPerHourStats(tripResult.updateBank.itemCostBank, commandResult.duration).toString(),
			convertBankToPerHourStats(
				tripResult.updateBank.itemLootBank.clone().add(tripResult.updateBank.itemLootBankNoCL),
				commandResult.duration
			).toString()
		];
	})
	.filter(i => Boolean(i));
writeFileSync('data/monster_data.tsv', [headers, ...rows].map(row => row.join('\t')).join('\n'));
// writeFileSync('data/monster_data.md', makeTable(headers, rows));
process.exit();
