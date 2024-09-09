import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const butterflyNettingCreatures: Creature[] = [
	{
		name: 'Ruby harvest',
		id: 10,
		aliases: ['ruby harvest'],
		level: 15,
		hunterXP: 24,
		itemsConsumed: new Bank().add('Butterfly jar', 1),
		table: new LootTable().every('Ruby harvest'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 4.8,
		slope: 1.3,
		intercept: 35
	},
	{
		name: 'Sapphire glacialis',
		id: 11,
		aliases: ['sapphire glacialis'],
		level: 25,
		hunterXP: 34,
		itemsConsumed: new Bank().add('Butterfly jar', 1),
		table: new LootTable().every('Sapphire glacialis'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 5.8,
		slope: 1.2,
		intercept: 40,
		tier: ['novice']
	},
	{
		name: 'Snowy knight',
		id: 12,
		aliases: ['snowy knight'],
		level: 35,
		hunterXP: 44,
		itemsConsumed: new Bank().add('Butterfly jar', 1),
		table: new LootTable().every('Snowy knight'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 6,
		slope: 1.35,
		intercept: 30,
		tier: ['novice', 'adept']
	},
	{
		name: 'Black warlock',
		id: 13,
		aliases: ['black warlock'],
		level: 45,
		hunterXP: 54,
		itemsConsumed: new Bank().add('Butterfly jar', 1),
		table: new LootTable().every('Black warlock'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 5,
		slope: 1.35,
		intercept: 35,
		tier: ['novice', 'adept']
	},
	{
		name: 'Crystal impling',
		id: 42,
		aliases: ['cimp', 'crystal imp', 'c imp', 'crystal impling'],
		level: 80,
		hunterXP: 280,
		table: new LootTable().every('Crystal impling jar'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 180,
		slope: 0,
		intercept: 0
	},
	{
		name: 'Sunlight moth',
		id: 46,
		aliases: ['sunlight moth'],
		level: 65,
		hunterXP: 74,
		itemsConsumed: new Bank().add('Butterfly jar', 1),
		table: new LootTable().every('Sunlight moth'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 5,
		slope: 0.01052,
		intercept: 0.1798,
		tier: ['novice', 'adept', 'expert']
	},
	{
		name: 'Moonlight moth',
		id: 48,
		aliases: ['moonlight moth'],
		level: 75,
		hunterXP: 84,
		itemsConsumed: new Bank().add('Butterfly jar', 1),
		table: new LootTable().every('Moonlight moth'),
		huntTechnique: HunterTechniqueEnum.ButterflyNetting,
		catchTime: 5,
		slope: 1.028,
		intercept: 9.687,
		tier: ['novice', 'expert', 'master']
	}
];

export default butterflyNettingCreatures;
