import Card from '../helpers/card';
import Zone from '../helpers/zone';

// Future Goals: Pack Images into JSON

// Background: Table, Back of Cards, Zone zone
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

		// Gets canvas width/height
		this.WIDTH = this.sys.game.canvas.width;
		this.HEIGHT = this.sys.game.canvas.height;

		// Set MAX hand size
		this.MAX_HAND = 7; 

		// Add to hand size check on turnState change
		this.handFull = false;


		// Add a state enum
		

		// Func Converts degrees to Radians
		this.deg2rad = (deg) => {
			return deg * Math.PI / 180;
		}
		// Func Converts Radians to degrees
		this.rad2deg = (rad) => {
			return rad * 180 / Math.PI;
		}

		// Func Remove item from array
		this.removeItem = (array, item) => {
			let index = array.indexOf(item);
			if (index > -1) {
				array.splice(index, 1);
			}
			//console.log(array);
		}

		// Add table background
		const background = this.add.image(this.WIDTH/2, this.HEIGHT/2, 'table').setScale(0.625, 0.667);

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
		this.deck = [];
		this.hand = [];
		this.drops = [];
	
		// creates an interactive text to draw cards
		this.deckImg = this.add.image(this.WIDTH - 250, (this.HEIGHT/2 - this.HEIGHT/16), 'back').setScale(0.65, 0.65);
		this.drawText = this.add.text(this.WIDTH - 298, (this.HEIGHT/2 - this.HEIGHT/16 - 10), ['DRAW CARD']).setFontSize(18).setFontFamily('"trebuchet MS"').setColor('#777700').setInteractive();
		
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
		this.resetText = this.add.text((this.WIDTH/8), (this.HEIGHT/2 - this.HEIGHT/16 - 10), ['RESET CUPS']).setFontSize(18).setFontFamily('"trebuchet MS"').setColor('#777700').setInteractive();
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
				card.setPosition((((this.WIDTH/2) - (this.cupImgs.length/2*100)) + (i*115)), (this.HEIGHT/2 - this.HEIGHT/16)); 
				this.children.bringToTop(card);
				i++;
			});
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

		// Func to position cards in the hand
		this.updateHand = () => {
			let centerCardOval = [this.WIDTH*0.5, this.HEIGHT*1.29];
			let horRad = this.WIDTH*0.45;
			let verRad = this.HEIGHT*0.4;
			let angle = this.deg2rad(90) - 0.5;
			for (let i = 0; i < this.hand.length; i++) {
				let ovalAngleVector = [horRad * Math.cos(angle), - verRad * Math.sin(angle)];
				let cardPos = [centerCardOval[0] + ovalAngleVector[0], centerCardOval[1] + ovalAngleVector[1]]
				this.tweens.add({
					targets		: this.hand[i],
					x			: cardPos[0],
					y			: cardPos[1],
					//rotation	: (-44.78 - this.angle/2),
					ease		: 'Linear',
					duration	: 1000,
				});
				// this.hand[i].x = cardPos[0];
				// this.hand[i].y = cardPos[1];
				this.hand[i].rotation = (44.78 - angle/2);
				angle += 0.177;
			}
		}

		// Func to add a card to hand
		this.angle = this.deg2rad(90) - 0.5;
		this.drawCards = () => {
			if (this.hand.length < this.MAX_HAND) {
				let card = new Card(this, this.WIDTH - 250, (this.HEIGHT/2 - this.HEIGHT/16), this.deck[0], 0.5, 'add');
				this.deck.shift();
				this.hand.push(card);
				this.updateHand();
			} 
			if (this.hand.length == this.MAX_HAND) {
				// Move this to 
				this.deckImg.setAlpha(0.75);
				this.drawText.setVisible(false);
				// Leave this
				this.updateHand();
				this.handFull = true;
			}
		}
		
		// Func add Cups to table
		this.addCups = () => {
			this.randShuffle(this.cupImgs);
			this.cupImgs.forEach(img => {
				let cup = new Card(this, (((this.WIDTH/2) - (this.cupImgs.length/2*100)) + (this.cups.length*115)), (this.HEIGHT/2 - this.HEIGHT/16), img, 0.5, 'cup');
				// let cup = new Card(this, (300 + (this.cups.length*115)), 320, img, 0.5, 'cup');
				//console.log(cup.width)
				this.cups.push(cup);
				//console.log(img);
			})
		}

		// Func add drop zones to table
		this.addZones = () => {
			for (let i = 0; i < this.cupImgs.length; i++) {
				//let zone = new Zone(this, (300 + (i*115)), 420, 150, 200, 'placeHolder');
				let zone = this.add.image((((this.WIDTH/2) - (this.cupImgs.length/2*100)) + (i*115)), (this.HEIGHT/1.715), 'placeHolder').setScale(0.65).setInteractive();
				zone.input.dropZone = true;
				zone.name = this.cupImgs[i];
				zone.effect = '';
				zone.isZone = true;
				this.children.moveTo(zone,2);
				this.drops.push(zone);
				console.log(zone.name);
			}
		}

		// Func to build shuffled deck
		this.addDeck = () => {
			Object.entries(this.addImgs).forEach(([key, value]) => {
				//console.log(`${key}: ${value}`);
				for (let i = value; i > 0; i--) {
					this.deck.push(key);
				}
				this.randShuffle(this.deck);
			})
		}


		// Add to New Game
		this.addCups();
		this.addDeck();
		this.addZones();

		// Change image tint on drag start
		this.input.on('dragstart', (pointer, gameObject) => {
			if ((gameObject.cardType) && (gameObject.cardType == 'add')) {
				gameObject.setTint(0xffff00).setAlpha(0.95);
				self.children.bringToTop(gameObject);
			}
		})
		// Change image tint back on drag end
		this.input.on('dragend', (pointer, gameObject, dropped) => {
			gameObject.setTint();
			// Check if the game object was droppen in a drop zone
			if (!dropped) {
				gameObject.x = gameObject.input.dragStartX;
				gameObject.y = gameObject.input.dragStartY;
				this.updateHand();
			}
		})

		// Makes items draggable
		this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			if ((gameObject.cardType) && (gameObject.cardType == 'add')) {
				gameObject.x = dragX;
				gameObject.y = dragY;
				gameObject.rotation = 0;
	;
			}
			if (gameObject.cardType) {
				//console.log(`CardType: ${gameObject.cardType}`);
			}
		})

		// Empty zone scale on mouseover
		this.drops.forEach(zone => {
			zone.on('pointerover', (pointer) => {
				if (!zone.isFull) {
					this.tweens.add({
						targets		: zone,
						scale		: 0.75,
						ease		: 'Bounce',
						duration	: 600,
					});
				}
			})
			zone.on('pointerout', () => {
				this.tweens.add({
					targets		: zone,
					scale		: 0.65,
					ease		: 'Bounce',
					duration	: 600,
				});
			})
		})

		// Locks card to dropZone Neededs to be set to multiple zones one for each cup
		this.input.on('drop', (pointer, gameObject, dropZone) => {
			if (!dropZone.isFull && ((gameObject.cardType) && (gameObject.cardType == 'add'))) {
				dropZone.setScale(0.7)
				gameObject.x = dropZone.x;
				gameObject.y = dropZone.y;
				gameObject.rotation = dropZone.rotation;
				gameObject.disableInteractive();
				this.children.moveTo(gameObject, 2);
				dropZone.isFull = true;
				dropZone.setTexture('back')
				dropZone.effect = gameObject.texture.key;
				this.children.moveTo(dropZone, 4)
				this.tweens.add({
					targets		: dropZone,
					scale		: 0.75,
					ease		: 'Linear',
					duration	: 500,
				});
				this.tweens.add({
					targets		: dropZone,
					scale		: 0.65,
					ease		: 'Bounce',
					duration	: 600,
				});
				this.removeItem(this.hand, gameObject);
				this.updateHand();
				console.log(dropZone.effect);
				//console.log(gameObject);
			} else {
				gameObject.x = gameObject.input.dragStartX;
				gameObject.y = gameObject.input.dragStartY;
			}
		})

	}

	update() {

	}

}