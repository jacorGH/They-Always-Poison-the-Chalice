import Card from '../helpers/card';
import Zone from '../helpers/zone';

// Background: Table, Back of Cards, Placement zone
import tableImg from '../assets/Table.png';
import backImg from '../assets/cards/BackCard.png';
import placeHolderImg from '../assets/cards/PlaceHolder.png';
// Cup Card Images
import chaliceImg from '../assets/cards/cups/Chalice.png';
import martiniImg from '../assets/cards/cups/Martini.png';
import mojitoImg from '../assets/cards/cups/Mojito.png';
import sakeImg from '../assets/cards/cups/Sake.png';
import woodenImg from '../assets/cards/cups/Wooden.png';
// Additives Card Images
import acidImg from '../assets/cards/additives/Acid.png';
import antidoteImg from '../assets/cards/additives/Antidote.png';
import healImg from '../assets/cards/additives/Heal.png';
import placeboImg from '../assets/cards/additives/Placebo.png';
import poisonImg from '../assets/cards/additives/Poison.png';
import purifyImg from '../assets/cards/additives/Purify.png';
// Status Cards
import healthImg from '../assets/cards/stats/HeathCard.png';


export  default class Game extends Phaser.Scene {

	constructor () {
		super ({
			
			key: 'Game'

		})
	}

	preload() {
		// Background stuff
		this.load.image('table', tableImg);
		this.load.image('back', backImg);
		this.load.image('placeHolder', placeHolderImg);
		// Cups
		this.load.image('chalice', chaliceImg);
		this.load.image('martini', martiniImg);
		this.load.image('mojito', mojitoImg);
		this.load.image('sake', sakeImg);
		this.load.image('wooden', woodenImg);
		// Additives
		this.load.image('acid', acidImg);
		this.load.image('antidote', antidoteImg);
		this.load.image('heal', healImg);
		this.load.image('placebo', placeboImg);
		this.load.image('poison', poisonImg);
		this.load.image('purify', purifyImg);
		// Status
		this.load.image('health', healthImg);

		
	}
	
	create() {
		let self = this;

		this.MAX_HAND = 7; // Set MAX hand size
		
		// Add table background
		const background = this.add.image(535, 360, 'table').setScale(0.52, 0.67);

		// Set dropzone
		this.zone = new Zone(this);
		this.dropZone = this.zone.renderZone();
		this.outline = this.zone.renderOutline(this.dropZone);

		// Create an array of cups
		this.cupImgs = ['chalice', 'martini', 'mojito', 'sake', 'wooden'];
		
		// Create a table of additive cards and how many are in a deck
		this.addImgs = {
			'acid': 3,
			'antidote': 2,
			'heal': 3,
			'placebo': 8,
			'poison': 5,
			'purify': 3
		};
		
		this.cups = [];
		this.hand = [];
	
		// creates an interactive text to draw cards
		this.deckImg = this.add.image(907, 320, 'back').setScale(0.65, 0.65);
		this.drawText = this.add.text(860, 310, ['DRAW CARD']).setFontSize(18).setFontFamily('"trebuchet MS"').setColor('#777700').setInteractive();
		
		// on click draw card
		this.drawText.on('pointerdown', () => {
			this.drawText.setColor('#ffff00');
			this.deckImg.setScale(0.7, 0.7);
		})
		this.drawText.on('pointerup', () => {
			this.drawCards();
			this.drawText.setColor('#777700');
			this.deckImg.setScale(0.65, 0.65);
		})
		this.drawText.on('pointerover', () => {
			this.drawText.setColor('#bbbb00');
			this.deckImg.setScale(0.68, 0.68);
		})
		this.drawText.on('pointerout', () => {
			this.drawText.setColor('#777700');
			this.deckImg.setScale(0.65, 0.65);
		})

		// creates an interactive text to reset cup pos
		this.resetText = this.add.text(125, 310, ['RESET CUPS']).setFontSize(18).setFontFamily('"trebuchet MS"').setColor('#777700').setInteractive();
		// on click reset cups pos
		this.resetText.on('pointerdown', () => {
			this.resetText.setColor('#ffff00');
		})
		this.resetText.on('pointerup', () => {
			this.resetText.setColor('#777700');
			this.resetPos(this.cups);
		})
		this.resetText.on('pointerover', () => {
			this.resetText.setColor('#bbbb00');
		})
		this.resetText.on('pointerout', () => {
			this.resetText.setColor('#777700');
		})

		// Func to reset card positions
		this.resetPos = (array) => {
			let i = 0;
			array.forEach(card => {
				console.log(card.data);
				i++;
			})
		}

		// Func to Randomly Shuff an array
		this.randShuffle = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * i);
				const temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			return array;
		}

		// Func to add a card to hand
		this.drawCards = () => {
			if (this.hand.length < this.MAX_HAND) {
				let card = new Card(this);
				card.render((158 + (this.hand.length*125)), 600, 'chalice');
				this.hand.push(this.card);
			} else {
				this.deckImg.setAlpha(0.75);
				this.drawText.setVisible(false);
			}
		}
		
		// Func add Cups to table
		this.addCups = () => {
			this.randShuffle(this.cupImgs);
			this.cupImgs.forEach(img => {
				let cup = new Card(this);
				console.log(img);
				cup.render((300 + (this.cups.length*115)), 320, img);
				this.cups.push(cup);
			})
		}
		
		// Add to New Game
		this.addCups();
		
		// Change image tint on drag start
		this.input.on('dragstart', (pointer, gameObject) => {
			gameObject.setTint(0xffff00);
			self.children.bringToTop(gameObject);
		})
		// Change image tint back on drag end
		this.input.on('dragend', (pointer, gameObject, dropped) => {
			gameObject.setTint();
			// Check if the game object was droppen in a drop zone
			if (!dropped) {
				gameObject.x = gameObject.input.dragStartX;
				gameObject.y = gameObject.input.dragStartY;
			}
		})

		// Makes items draggable
		this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			gameObject.x = dragX;
			gameObject.y = dragY;
		})

		// Locks card to dropZone Neededs to be set to multiple zones one for each cup
		this.input.on('drop', (pointer, gameObject, dropZone) => {
			if (dropZone.data.values.cards < this.cups.length) {
				dropZone.data.values.cards++;
				gameObject.x = (dropZone.x - 345) + (dropZone.data.values.cards * 115);
				gameObject.y = dropZone.y + 100;
				gameObject.disableInteractive();
				self.children.moveTo(gameObject, 2)
			} else {
				gameObject.x = gameObject.input.dragStartX;
				gameObject.y = gameObject.input.dragStartY;
			}
		})

	}

	update() {

	}

}