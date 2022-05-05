import { User } from 'discord.js';
import { calcWhatPercent } from 'e';
import { Extendable, ExtendableStore } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { MersenneTwister19937, shuffle } from 'random-js';

import { bingoIsActive, determineBingoProgress, onFinishTile } from '../../lib/bingo';
import { allCLItemsFiltered, convertCLtoBank } from '../../lib/data/Collections';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export function shuffleRandom<T>(input: number, arr: readonly T[]): T[] {
	const engine = MersenneTwister19937.seed(input);
	return shuffle(engine, [...arr]);
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	public cl(this: User) {
		return new Bank(this.settings.get(UserSettings.CollectionLogBank));
	}

	// @ts-ignore 2784
	public completion(this: User) {
		const clItems = Object.keys(this.settings.get(UserSettings.CollectionLogBank)).map(i => parseInt(i));
		const debugBank = new Bank();
		debugBank.add(convertCLtoBank(allCLItemsFiltered));
		const owned = clItems.filter(i => allCLItemsFiltered.includes(i));
		const notOwned = shuffleRandom(
			Number(this.id),
			allCLItemsFiltered.filter(i => !clItems.includes(i))
		).slice(0, 10);
		return {
			percent: calcWhatPercent(owned.length, allCLItemsFiltered.length),
			notOwned,
			owned,
			debugBank
		};
	}

	public async addItemsToCollectionLog(
		this: User,
		{ items, dontAddToTempCL = false }: { items: Bank; dontAddToTempCL?: boolean }
	) {
		await this.settings.sync(true);

		const newCL = items.clone().add(this.settings.get(UserSettings.CollectionLogBank));
		let updates: [string, ItemBank][] = [[UserSettings.CollectionLogBank, newCL.bank]];

		if (!dontAddToTempCL) {
			const oldTempCL = new Bank(this.settings.get(UserSettings.TempCL));
			const newTempCL = items.clone().add(oldTempCL);
			// If they have purchased a Bingo ticket, check the before/after bingo progress.
			if (newCL.has('Bingo ticket') && bingoIsActive()) {
				const before = determineBingoProgress(oldTempCL);
				const after = determineBingoProgress(newTempCL);
				// If they finished a tile, process it.
				if (before.tilesCompletedCount !== after.tilesCompletedCount) {
					onFinishTile(this, before, after, newCL);
				}
			}
			updates.push([UserSettings.TempCL, newTempCL.bank]);
		}

		return this.settings.update(updates);
	}
}
