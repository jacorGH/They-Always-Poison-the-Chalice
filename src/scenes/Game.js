import tableImg from '../assets/Table.png';

export  default class Game extends Phaser.Scene {

    constructor () {
        super ({
            
            key: 'Game'

        })
    }

    preload() {
        this.load.image('table', tableImg)
    }
    
    create() {
        this.cardArray = []
        this.cupArray = []
    
        // creates an interactive text to deal cards
        this.dealText = this.add.text(75, 150, ['DEAL CARDS']).setFontSize(18).setFontFamily('"trebuchet MS"').setColor('#00ffff').setInteractive();
        // on click deal card
        this.dealText.on('pointerdown', () => {
            this.dealText.setColor('#ff0000')
        })
        this.dealText.on('pointerup', () => {
            this.dealCards();
            this.dealText.setColor('#ff69b4')
        })
        this.dealText.on('pointerover', () => {
            this.dealText.setColor('#ff69b4');
        })
        this.dealText.on('pointerout', () => {
            this.dealText.setColor('#00ffff');
        })
    
        this.dealCards = () => {
            if (this.cardArray.length < 7) {
                this.card = this.add.rectangle((125 + (this.cardArray.length*125)), 600, 100, 150, 0x00ffff).setInteractive();
                this.input.setDraggable(this.card);
                this.cardArray.push(this.card)
                // console.log(this.cardArray.length)
            }
        }
    
        for (let i = 0; i < 5; i++) {
            this.cup = this.add.rectangle((200 + (i*150)), 400, 100, 150, 0xff5f00).setInteractive();
            this.input.setDraggable(this.cup);
            this.cupArray.push(this.cup)
        }
    
        this.input.on('drag', (pinter, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        })
    }

}