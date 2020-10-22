export default class Card extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture, scale, cardType) {
        super(scene, x, y, texture);
        this.cardType = cardType;
        this.inHand = true;
        this.cardEffect = texture;
        this.index = 0;
        this.setInteractive();
        this.setScale(scale, scale);
        scene.add.existing(this);
        scene.input.setDraggable(this);
    }
}