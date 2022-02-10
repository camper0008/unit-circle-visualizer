import { StateManager } from "./state";

const main = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const manager = new StateManager(canvas);
    manager.draw();
}

main();
