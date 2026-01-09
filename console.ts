import { maknune as maknuneRaw } from './maknuune-array-raw.ts';
//import { maknune as maknuneAll } from './maknune-array-all.ts';
import { writeFileSync } from "fs";


type MaknuneLexiconEntry = [string, boolean, string, string, string, string, string, string, string, string, (string | null)[]?, (string | null)[]?, string?, string?, string?, string?];

const LEMMA = 3;
const LEMMA_SEARCH = 4;
const FORM = 5;
/** non-templatic word stems */
const NTWS = 'NTWS';
/** JSON.stringify converts undefined to null, This const in used to replace `null`s in string. When creating TS file it ok to have enty strings instead of `undefined` */
const NULL_REPLACER = 'undefined';

const NonspacingMarksRegEx = /\p{Mn}/gu;


export type MaknuneEntry = {
	root: string;
	isNTWS: boolean;
	lemma: string;
	lemmaSearch: string;
	form: string;
	lemmaBW: string;
	formBW: string;
	caphi: string;
	analysis: string;
	gloss: string[];
	glossAuto: string[];
	glossMSA: string;
	example: string;
	notes: string;
	source: string;
};

function replacer(key: string, value: unknown) {
	// Filtering out properties
	if(typeof value === 'undefined' || value === null) {
		return undefined;
	}
	return value;
}

/**
 * Creates json with all data, except [0] is `root` or `root ntws` ([1]) and [1] indicates if the root is  NTWS (non-templatic word stems)
 */
function createMaknuneArrayAll() {
	const result: string[] = [];
	result.push('type MaknuneLexiconArrayEntry = [string, boolean | undefined, string, string, string, string, string, string, string, string, string[]?, string[]?, string?, string?, string?, string?];');
	result.push('//["ROOT", "IS_NTWS", "ROOT_1ST_LETTER", "LEMMA", "LEMMA SEARCH", "FORM", "LEMMA BW", "FORM BW", "CAPHI++", "ANALYSIS", EN[]",EN_AUTO[], "GLOSS MSA", "EXAMPLE USAGE", "NOTES", "SOURCE"],');
	result.push('export const maknune: MaknuneLexiconArrayEntry[] = [');
	///const result = Array.from(maknuneRaw); //maknune.slice(0, 20);
	for(let i = 0;i < maknuneRaw.length;i++) {
		const entry = Array.from(maknuneRaw[i]);
		if(entry[0] == NTWS) {
			entry[0] = entry[1]!;
			entry[1] = (<string> <unknown> true);
		} else {
			entry[1] = (<string> <unknown> false);
		}
		result.push(JSON.stringify(entry));
	}
	result.push(']');

	let json = result.join('\n').replaceAll('null', NULL_REPLACER);
	writeFileSync("maknune-array-all.ts", json);
}

//createMaknuneArrayAll();
/**
 * Prints lemmas that can not be 'computed', therefore should be kept in data. There is inly two such lemmas, both inlculde dagger alef:
 * 	"لكن" laakin
 *  "هذا" haaDa
 */
function testLemmas() {
	for(let i = 0;i < maknuneRaw.length;i++) {
		const entry = maknuneRaw[i];
		let lemma =  entry[LEMMA];
		const lemmaReduced = entry[LEMMA].replaceAll(NonspacingMarksRegEx, '');
		if(lemmaReduced !== entry[LEMMA_SEARCH]) {
			console.log(lemmaReduced, entry[LEMMA_SEARCH]);
		}
	}
}
//testLemmas();


function createMaknuneArrayReduced() {
		const result: string[] = [];
	result.push('type MaknuneLexiconArrayEntryReduced = [string, boolean | undefined, string, string, string, string, string, string, string, string[]?, string[]?];');
	result.push('//["ROOT", "IS_NTWS", "LEMMA", "LEMMA_SEARCH", "FORM", "LEMMA BW", "FORM BW", "CAPHI++", "ANALYSIS", EN[]",EN_AUTO[]],');
	result.push('export const maknune: MaknuneLexiconArrayEntryReduced[] = [');
	///const result = Array.from(maknuneRaw); //maknune.slice(0, 20);
	for(let i = 0;i < maknuneRaw.length;i++) {
		//deal with rood and NTWS
		const entry = maknuneRaw[i].slice(0, 12);
		if(entry[0] == NTWS) {
			entry[0] = entry[1]!;
			entry[1] = (<string> <unknown> true);
		} else {
			entry[1] = (<string> <unknown> false);
		}

		//deal with lemmas and searchabel lemmas
		//sett seachable lemma to undefined if it can be computed
		let lemma =  entry[LEMMA];
		const lemmaReduced = entry[LEMMA].replaceAll(NonspacingMarksRegEx, '');
		if(lemmaReduced === entry[LEMMA_SEARCH]) {
			entry[LEMMA_SEARCH] = undefined;
		}

		entry.splice(2,1); //removing Root 1st letter
		result.push(JSON.stringify(entry));
	}
	result.push(']');

	let json = result.join('\n').replaceAll('null', NULL_REPLACER);
	writeFileSync("maknune-array-reduced.ts", json);
}

//createMaknuneArrayReduced();

function createFullJson() {
	const result = new Array();

	for(let i = 0;i < maknuneRaw.length;i++) {
		const word = maknuneRaw[i];

		let entry = {
			root: word[0] != NTWS ? word[0] : word[1],
			isNTWS: word[0] == NTWS,
			//firstLetter: word[2], //skipping this one because it can be ieasily computed.
			lemma: word[LEMMA],
			lemmaSearch: word[LEMMA_SEARCH],
			form: word[FORM],
			lemmaBWTranlit: word[6],
			formBWTranslit: word[7],
			caphi: word[8],
			analysis: word[9],
			en: word[10], //description/meaning in inglish
			enAuto: word[11],
			msa: word[12],
			example: word[13],//example of use
			notes: word[14],
			source: word[15]
		};
		result.push(entry);
	}

	let json = JSON.stringify(result);
	//console.log(json);
	writeFileSync("maknune-full.json", json);
}


//there is no unique values in set, both lemma and form can repeat as different parts of speech. 
function testUniqueKey() {
	const keys = new Set<string>();

	for(let i = 1;i < maknuneRaw.length;i++) { //skip onest entry, it's just headers
		const word = maknuneRaw[i];
		const key = word[5];
		if(keys.has(key)) {
			console.log("DUPLICATE KEY:", key, "at row", i);
		} else {
			keys.add(key);
		}
	}
}
//testUniqueKey();

function createReducedJson() {
	const set = new Array();

	for(let i = 1;i < 20;i++) { //skip onest entry, it's just headers
		const word = maknuneRaw[i];

		let entry = {
			root: word[0] ?? word[1],
			isNTWS: word[1] !== undefined,
			//firstLetter: word[2], //skipping this one because it can be ieasily computed.
			lemma: word[3],
			lemmaSearch: word[4],
			form: word[5],
			lemmaBWTranlit: word[6],
			formBWTranslit: word[7],
			caphi: word[8],
			analysis: word[9],
			en: word[10], //description/meaning in inglish
			enAuto: word[11],
			msa: word[12],
			example: word[13],//example of use
			notes: word[14],
			source: word[15]
		};

		set.push(entry);
	}

	let json = JSON.stringify(set);
	//console.log(json);
	writeFileSync("maknune-full.json", json);
}


function createLexiconIndex(extended: boolean = false) {
	const index: { [key: string]: number | number[]; } = {};

	for(let i = 0;i < maknuneRaw.length;i++) {
		const entry = maknuneRaw[i];
		const form = entry[FORM];
		let key = form;

		let indices = index[key];
		if(indices === undefined) {
			index[key] = i;
		} else if(typeof indices == 'number') {
			index[key] = [indices, i];
		} else {
			indices.push(i);
		}

		if(!extended) {
			continue;
		}

		key = form.normalize('NFKD').replaceAll(NonspacingMarksRegEx, '');

		if(form != key) {
			let indices = index[key];
			if(indices === undefined) {
				index[key] = i;
			} else if(typeof indices == 'number') {
				index[key] = [indices, i];
			} else {
				indices.push(i);
			}
		}
	}

	let json = JSON.stringify(index);
	//console.log(index);
	writeFileSync(`maknune-form-index${extended ? '-ext' : ''}.json`, json);
}
//createLexiconIndex(false);

//createFullJson();
//createReducedJson();

function testNormalization(text: string) {
	console.log(`original ${text}. len: ${text.length}`);

	const nameNFC = text.normalize("NFC");
	const nameNFD = text.normalize("NFD");
	const nameNFKC = text.normalize('NFKC');
	const nameNFKD = text.normalize('NFKD');

	console.log(nameNFC, nameNFD, nameNFKC, nameNFKD);
	console.log('NFC ', nameNFC.split(''));
	console.log('NFD ', nameNFD.split(''));
	console.log('NFKC', nameNFKC.split(''));
	console.log('NFKD', nameNFKD.split(''));
	console.log('NFKD codepoints', nameNFKD.split('').map(c => c.codePointAt(0)?.toString(16)));

}

//testNormalization('\u{FDF2}'); //better equiped text editor display this word, Allah, as single ligature.
//testNormalization('أبد');

//testNormalization('أَبَد');
//testNormalization('أبد');
//testNormalization('◌́')
//testNormalization('´')
//testNormalization('هٰذَا')
//testNormalization('هٰذا')
//testNormalization('هٰذا'.replaceAll(NonspacingMarksRegEx, ''))
testNormalization('عَفِكْرَة')



function reTest() {
	let text = 'أَبَد A ticket to 大阪 costs ¥2000 👌. Ā, Ē, Ī, Ū, ģ, ū';
	text = text.normalize('NFKD');
	console.log(text);

	const re = /\p{Mn}/gu;


	console.log(text.match(re));

	console.log(text.replaceAll(re, ''));
}


//reTest();