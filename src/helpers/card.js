export default class Card extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture, scale, cardType, active) {
        super(scene, x, y, texture);
        this.cardType = cardType;
        this.cardEffect = texture;
        this.index = 0;
        this.state = 'inDeck';
        this.currentState = ''

        if (active) {
            this.setInteractive();
            scene.input.setDraggable(this);
        }
        this.checkState = () => {
            if (this.state != this.currentState) {
                this.currentState = this.state;
                return true;
            } else {
                return false;
            }
        }
        this.setScale(scale);
        scene.add.existing(this);
    }
}