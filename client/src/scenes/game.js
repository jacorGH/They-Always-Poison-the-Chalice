import Card from '../helpers/card';
import Zone from '../helpers/zone';
import io from 'socket.io-client';

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

		/*
			Socket and server message area
		*/

		// Keeps trace of how is the first player
		this.isPlayerA = false;

		// Creates connection to server
		this.socket = io('http://localhost:3000');
		this.socket.on('connect', () => {
			console.log(`Connected to server: ${this.socket.id}`);
		});

		// If user connects first receive 'isPlayerA' set isPlayerA var to true
		this.socket.on('isPlayerA', () => {
			this.isPlayerA = true;
		})


		/*
			Opponent Visuals
		*/
		// Displays Oppnent hand and change cup position
		this.opponentHand = [];
		// this.opponentCardSpread = -0.177;

		this.updateOpponentsHand = () => {
			let handSize = 0;
			// Update Opponent Hand
			for (let i = 0; i < this.opponentHand.length; i++) {
				let angle = Math.PI/2 + this.cardSpread*(this.hand.length/2 - handSize)-0.06;
				let ovalAngleVector = [this.horRad * Math.cos(angle), - this.verRad * Math.sin(angle)];
				let cardPos = [this.centerCardOval[0] + ovalAngleVector[0], this.centerCardOval[1] + ovalAngleVector[1]];
				console.log(angle)
				console.log(ovalAngleVector)
				console.log(cardPos)
				this.tweens.add({
					targets			: this.opponentHand[i],
					x				: cardPos[0],
					y				: (cardPos[1]-(this.HEIGHT-100)),
					rotation		: (0.8 - angle/2),
					ease			: 'Linear',
					duration		: 300,
					// onComplete		: this.updateHand,
				})
				// angle -= this.opponentCardSpread;
				handSize += 1;
			}
		}

		// Add cards to Opponents hand
		this.socket.on('drawCard', (isPlayerA) => {
			// Func to add a card to hand
			if (isPlayerA !== this.isPlayerA) {
				if (this.opponentHand.length < this.MAX_HAND) {
					let card = new Card(this, this.WIDTH - 250, (this.HEIGHT/2 - this.HEIGHT/16), 'back', 0.5, 'Opp', false);
					// Add card to Opponent Hand
					// let centerCardOval = [this.WIDTH*0.5, this.HEIGHT*1.29];
					let angle = Math.PI/2 + this.cardSpread*(this.opponentHand.length/2 - this.opponentHand.length) - 0.06;
					this.opponentHand.push(card);
					let ovalAngleVector = [this.horRad * Math.cos(angle), - this.verRad * Math.sin(angle)];
					let cardPos = [this.centerCardOval[0] + ovalAngleVector[0], this.centerCardOval[1] + ovalAngleVector[1]];
					this.tweens.add({
						targets			: card,
						x				: cardPos[0],
						y				: (cardPos[1]-(this.HEIGHT-100)),
						rotation		: (0.8 - angle/2),
						ease			: 'Linear',
						duration		: 600,
						// onComplete		: this.updateOpponentsHand,
					})
					console.log(this.opponentHand)
				}
			}
		})


		// Gets canvas width/height
		this.WIDTH = this.sys.game.canvas.width;
		this.HEIGHT = this.sys.game.canvas.height;

		// Set MAX hand size
		this.MAX_HAND = 7; 

		// Add to hand size check on turnState change
		this.handFull = false;

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
			return index;
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
		this.cupEffects = {};
	
		// creates an interactive text to draw cards
		this.deckImg = this.add.image(this.WIDTH - 250, (this.HEIGHT/2 - this.HEIGHT/16), 'back').setScale(0.5);
		this.drawText = this.add.text(this.WIDTH - 298, (this.HEIGHT/2 - this.HEIGHT/16 - 10), ['DRAW CARD']).setFontSize(18).setFontFamily('"trebuchet MS"').setColor('#777700').setInteractive();
		// this.drawText.setVisible(false);

		// on click draw card
		this.drawText.on('pointerdown', () => {
			this.drawText.setColor('#ffff00');
			this.deckImg.setScale(0.6);
		})
		this.drawText.on('pointerup', () => {
			this.drawCard();
			this.drawText.setColor('#777700');
			this.deckImg.setScale(0.5);
		})
		this.drawText.on('pointerover', () => {
			this.drawText.setColor('#bbbb00');
			this.deckImg.setScale(0.55);
		})
		this.drawText.on('pointerout', () => {
			this.drawText.setColor('#777700');
			this.deckImg.setScale(0.5);
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
		
		/*
			Creating the Deck, Hand, Cups and Dropzones
		*/

		// Hand position variables
		this.centerCardOval = [this.WIDTH*0.5, this.HEIGHT*1.29];
		this.horRad = this.WIDTH*0.45;
		this.verRad = this.HEIGHT*0.4;
		this.targetRot = (0.8 - this.angle/2);
		this.cardSpread = 0.177;
		
		// this.cardSpread = 0.177;

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

		// Func to position cards in the hand
		this.updateHand = () => {
			let cards = 0
			for (let i = 0; i < this.hand.length; i++) {
				if (this.hand[i].state === 'inHand') {
					let angle = Math.PI/2 + this.cardSpread*(this.hand.length/2 - cards)-0.06;
					let ovalAngleVector = [this.horRad * Math.cos(angle), - this.verRad * Math.sin(angle)];
					let cardPos = [this.centerCardOval[0] + ovalAngleVector[0], this.centerCardOval[1] + ovalAngleVector[1]];
					this.tweens.add({
						targets			: this.hand[i],
						x				: cardPos[0],
						y				: cardPos[1],
						rotation		: (0.8 - angle/2),
						ease			: 'Linear',
						duration		: 400,
						index			: i,
						// state			: 'inHand'
					})
					// angle += this.cardSpread;
					cards += 1;
					// this.hand[i].x = cardPos[0];
					// this.hand[i].y = cardPos[1];
					// this.hand[i].rotation = (0.8 - angle/2);
				} 
				else {
					let angle = Math.PI/2 + this.cardSpread*(this.hand.length/2 - cards)-0.06;
					let ovalAngleVector = [this.horRad * Math.cos(angle), - this.verRad * Math.sin(angle)];
					let cardPos = [this.centerCardOval[0] + ovalAngleVector[0], this.centerCardOval[1] + ovalAngleVector[1]];
					this.tweens.add({
						targets			: this.hand[i],
						x				: cardPos[0],
						y				: (cardPos[1] - 50),
						rotation		: (0.8 - angle/2),
						ease			: 'Linear',
						duration		: 400,
						// state			: 'inHand'
					})
					// angle += this.cardSpread;
					cards += 1;
				}
			}
			if (this.checkCups()) {
				this.hand.forEach(card => {
					card.disableInteractive();
				});
			}
		}

		// Func to transition card from deck to hand
		this.deckToHand = (card) => {
			// console.log(card.state);
			let angle = Math.PI/2 + this.cardSpread*(this.hand.length/2 - this.hand.length)-0.06;
			card.state = 'inHand';
			this.hand.push(card);
			let ovalAngleVector = [this.horRad * Math.cos(angle), - this.verRad * Math.sin(angle)];
			let cardPos = [this.centerCardOval[0] + ovalAngleVector[0], this.centerCardOval[1] + ovalAngleVector[1]];
			this.time.delayedCall( 300, this.flipCard, [ card ], this);
			this.tweens.add({
				targets			: card,
				x				: cardPos[0],
				y				: cardPos[1],
				rotation		: (0.8 - (angle)/2),
				scaleX			: (0.5),
				ease			: 'Linear',
				duration		: 600,
				onComplete		: this.updateHand,
			});
			// angle -= this.cardSpread;

			// If hand is full make cards interactive and disable deck
			if (this.hand.length == this.MAX_HAND) {
				// Move this to 
				this.deckImg.setAlpha(0.75);
				this.drawText.setVisible(false);
				// Leave this
				// this.updateHand();
				this.handFull = true;
				this.hand.forEach(card =>{
					this.time.delayedCall(300, this.activeCard, [card], this);
					// card.setInteractive();
				})
			}
		}


		// Func to swap card texture
		this.flipCard = (card) => {
			card.setTexture(card.cardEffect);
			card.scaleY = 0.5;
		}

		// Func to set card interactive
		this.activeCard = (card) => {
			card.setInteractive();
			this.input.setDraggable(card);
		}


		// Func to add a card to hand
		this.drawCard = () => {
			if (this.hand.length < this.MAX_HAND) {
				let card = new Card(this, this.WIDTH - 250, (this.HEIGHT/2 - this.HEIGHT/16), this.deck[0], -0.5, 'add', false);
				//console.log(card.texture)
				card.setTexture('back');
				card.index = this.hand.length;
				this.deck.shift();
				// this.hand.push(card);
				card.state = 'deckToHand';
				this.socket.emit('drawCard', this.isPlayerA);
				// this.hand.push(card);
				// this.deckToHand(card);
			} 
		}
		
		// Func add Cups to table
		this.addCups = () => {
			if (this.isPlayerA) {
				this.randShuffle(this.cupImgs);
				this.cupImgs.forEach(img => {
					let cup = new Card(this, (((this.WIDTH/2) - (this.cupImgs.length/2*100)) + (this.cups.length*115)), (this.HEIGHT/2 - this.HEIGHT/8), img, 0.5, 'cup', true);
					// let cup = new Card(this, (300 + (this.cups.length*115)), 320, img, 0.5, 'cup');
					cup.name = img;
					//console.log(cup.width);
					this.cups.push(cup);
					//console.log(img);
				})
				this.socket.emit('addCups', this.cupImgs);
			}
			if (!this.isPlayerA) {
				this.cupImgs.forEach(img => {
					let cup = new Card(this, (((this.WIDTH/2) - (this.cupImgs.length/2*100)) + (this.cups.length*115)), (this.HEIGHT/2 - this.HEIGHT/8), img, 0.5, 'cup', true);
					// let cup = new Card(this, (300 + (this.cups.length*115)), 320, img, 0.5, 'cup');
					cup.name = img;
					//console.log(cup.width);
					this.cups.push(cup);
					//console.log(img);
				})
			}
		}

		// Func add drop zones to table
		this.addZones = () => {
			for (let i = 0; i < this.cupImgs.length; i++) {
				//let zone = new Zone(this, (300 + (i*115)), 420, 150, 200, 'placeHolder');
				let zone = this.add.image((((this.WIDTH/2) - (this.cupImgs.length/2*100)) + (i*115)), (this.HEIGHT/1.9), 'placeHolder').setScale(0.5).setInteractive();
				zone.input.dropZone = true;
				zone.name = this.cupImgs[i];
				zone.effect = '';
				zone.isZone = true;
				this.children.moveTo(zone,2);
				this.drops.push(zone);
				// console.log(zone.name);
			}
		}

		this.cardsPlayed = () => {
			console.log(this.cupEffects);
		}

		// Func Check if zones are full
		this.checkCups = () => {
			let full = false;
			for (let i = 0; i < this.drops.length; i++) {
				if (!this.drops[i].isFull) {
					full = false;
					// console.log(i)
					break;
				} else {
					// console.log(this.drops[i].name)
					this.cupEffects[this.drops[i].name] = this.drops[i].effect;
				}
				if (i === 4) {
					console.log('Full!');
					this.cardsPlayed();
					full = true;
				}
			}
			return full;
		}


		// Add to New Game
		this.socket.on('startGame', ( ) => {
			if (this.isPlayerA) {
				this.addCups();
			}
			this.addDeck();
			this.addZones();
		})

		this.socket.on('addCups', (cupImgs) => {
			if (!this.isPlayerA) {
				this.cupImgs = cupImgs.reverse();
				this.addCups();
			}
		}) 


		// Empty zone scale on mouseover
		this.drops.forEach(zone => {
			zone.on('pointerover', () => {
				if (!zone.isFull) {
					this.tweens.add({
						targets		: zone,
						scale		: 0.65,
						ease		: 'Bounce',
						duration	: 600,
					});
				}
			})
			zone.on('pointerout', () => {
				this.tweens.add({
					targets		: zone,
					scale		: 0.5,
					ease		: 'Bounce',
					duration	: 600,
				});
			})
		})

		// Locks card to dropZone Neededs to be set to multiple zones one for each cup
		this.input.on('drop', (pointer, gameObject, dropZone) => {
			if ((!dropZone.isFull) && (gameObject.cardType) && (gameObject.cardType == 'add')) {
				dropZone.setScale(0.7)
				gameObject.x = dropZone.x;
				gameObject.y = dropZone.y;
				gameObject.rotation = dropZone.rotation;
				gameObject.disableInteractive();
				this.children.moveTo(gameObject, 8);
				dropZone.isFull = true;
				dropZone.effect = gameObject.cardEffect;
				// dropZone.effect = gameObject.texture.key;
				gameObject.setTexture('back')
				// this.children.moveTo(dropZone, 4)
				this.removeItem(this.hand, gameObject);
				this.tweens.add({
					targets		: dropZone,
					scale		: 0.65,
					ease		: 'Linear',
					duration	: 400,
				});
				this.tweens.add({
					targets		: dropZone,
					scale		: 0.5,
					ease		: 'Bounce',
					duration	: 500,
				});
				this.tweens.add({
					targets		: gameObject,
					scale		: 0.5,
					ease		: 'Bounce',
					duration	: 800,
				});
				this.updateHand();
				console.log(dropZone.effect);
				//console.log(gameObject);
			} else {
				gameObject.x = gameObject.input.dragStartX;
				gameObject.y = gameObject.input.dragStartY;
				this.updateHand();
			}
		})

	}

	update() {

		this.children.list.forEach(item => {
			if ((item.cardType) && (item.cardType === 'add') && (item.checkState())) {
				let card = item;

				switch (card.state){

					case 'deckToHand':
						// console.log('deckToHand')
						this.deckToHand(card);

						break;
					case 'inHand':
						// Change card size on hover
						// console.log('inHand')
						// this.updateHand();
						card.on('pointerover', () => {
							card.state = 'onHover';
							this.tweens.add({
								targets		: card,
								scale		: 0.8,
								ease		: 'Quad',
								duration	: 400,
							});
							this.children.bringToTop(card);
						})
						break;
					case 'onHover':
						// console.log('onHover')
						// Reset card size on Hover off
						card.on('pointerout', () => {
							card.state = 'inHand';
							this.tweens.add({
								targets		: card,
								scale		: 0.5,
								ease		: 'Back.easeOut',
								duration	: 700,
							});
						})
						//Change card state on drag start
						card.on('dragstart', () => {
							// console.log('dragging');
							card.state = 'inMotion';
							this.tweens.add({
								targets		: card,
								scale		: 0.55,
								ease		: 'Back.easeOut',
								duration	: 400,
								onComplete	: this.updateHand,
							});
							// this.removeItem(this.hand, gameObject);
						})

						break;
					case 'inMotion':
						// console.log('inMotion')
						// card.currentState = '';
						card.on('drag', (pointer) => {
							// console.log(pointer.position)
							// this.updateHand()
							// this.removeItem(this.hand, card);
							card.x = pointer.x;
							card.y = pointer.y;
							card.rotation = 0;
						})
						card.on('dragend', (pointer, dragx, dragy, dropped) => {
							// console.log(dropped);
							if (!dropped) {
								card.state = 'toHand';
								this.tweens.add({
									targets		: card,
									scale		: 0.5,
									ease		: 'Back.easeOut',
									duration	: 700,
								});
								// this.removeItem(this.hand, gameObject);
							}
						})

						break;
					case 'toHand':
						// console.log('toHand')
						// console.log(card.index)
						card.state = 'inHand';
						// this.hand.splice(card.index, 0, card);
						this.updateHand();
						// console.log(item.state)

						break;
					case 'inPlay':
						console.log('inPlay')
						// console.log(item.state)

						break;
					case 'inDiscard':
						console.log('inDiscard')
						// console.log(item.state)

						break;
					case 'inDeck':
						console.log('inDeck')
						// console.log(item.state)

						break;
				}
				// console.log(item);
			}
		})
	}
}