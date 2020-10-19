export default class Zone extends Phaser.GameObjects.Zone {
    constructor(scene, x, y, width, height, img) {
        super(scene, x, y, width, height);
        this.isFull = false;
        this.setInteractive();
        this.holder = scene.add.image(x, y, img).setScale(0.65, 0.65);
        scene.add.zone(x, y, width, height).setRectangleDropZone(width, height);
        scene.add.existing(this);
    }
}
