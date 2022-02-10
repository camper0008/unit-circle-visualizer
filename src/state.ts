const drawUnitCircle = (canvas: Canvas) => {
    const center = canvas.size * 0.5;
    const inset = canvas.size * (1 - (canvas.circleRadius * 2)) * 0.5
    const invertedInset = canvas.size - inset;
    const radius = canvas.circleRadius * canvas.size

    canvas.ctx.beginPath();
    canvas.ctx.arc(center, center, radius, 0, 2 * Math.PI);
    canvas.ctx.moveTo(center, inset)
    canvas.ctx.lineTo(center, invertedInset);
    canvas.ctx.moveTo(inset, center)
    canvas.ctx.lineTo(invertedInset, center);
    canvas.ctx.stroke(); 
}


const drawCosAndSin = (canvas: Canvas, center: number, cos: number, sin: number) => {
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = "#f00"
    canvas.ctx.lineWidth = 4;
    canvas.ctx.moveTo(center, center);
    canvas.ctx.lineTo(cos * canvas.size, center);
    canvas.ctx.stroke();
    
    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = "#00f"
    canvas.ctx.moveTo(cos * canvas.size, center);
    canvas.ctx.lineTo(cos * canvas.size, sin * canvas.size);
    canvas.ctx.stroke();
}

const drawLine = (canvas: Canvas, center: number, cos: number, sin: number) => {
    canvas.ctx.beginPath();
    canvas.ctx.moveTo(center, center);
    canvas.ctx.lineTo(cos * canvas.size, sin * canvas.size);
    canvas.ctx.stroke();
}

const drawTan = (canvas: Canvas, center: number, x: number, y: number, cos: number, sin: number, len: number) => {

    // TODO: fix because math is giving incorrect inv_theta for some reason (e.g. 280 when should be 90, ~140 when should be 45?)

    // not truly the inverse theta, but in our case it is
    //console.log(x, y, len);
    //const inv_theta = (Math.asin(Math.abs(x) / len));
    const inv_theta = Math.asin((x * Math.sin(Math.PI * 0.5)) / len)
    // the right angle
    const C = Math.PI * 0.5;
    const B = C - inv_theta;
    const A = Math.PI - C - B;

    const offset = (1 - canvas.circleRadius * 2) * 0.5;
    const max = (canvas.circleRadius * 2);
    const heightPercentageRaw = (sin - offset) // / max

    console.log("x: ", x, "len:", len, "inv: ", inv_theta * 180, "B: ", B * 180);
    const a = Math.abs(heightPercentageRaw - (max / 2)) * 2
    const b = 
        (a / Math.sin(A)) * Math.sin(B) 
        * -((x - 0.5) / Math.abs(x - 0.5)) // make positive if x is right side, negative if x is left side

    canvas.ctx.beginPath();
    canvas.ctx.strokeStyle = "#0f0"
    canvas.ctx.moveTo(cos * canvas.size, sin * canvas.size);
    canvas.ctx.lineTo((cos + b) * canvas.size, center);
    canvas.ctx.stroke();
}

const targetLenDelta = (targetLen: number, len: number) => {
    return targetLen / len;
}

const drawMouseLine = (canvas: Canvas) => {
    const [ x, y ] = [
        canvas.state.mouseX - 0.5,
        canvas.state.mouseY - 0.5,
    ];

    const len = Math.sqrt(x**2 + y**2);
    const deltaLen = targetLenDelta(canvas.circleRadius, len);

    const center = canvas.size * 0.5;

    // not a proper cos and sin, just a representation / "length" of cos/sin
    const cos = (x * deltaLen) + 0.5;
    const sin = (y * deltaLen) + 0.5;

    drawLine(canvas, center, cos, sin);
    drawCosAndSin(canvas, center, cos, sin);
    drawTan(canvas, center, x, y, cos, sin, len, deltaLen);

    canvas.resetStrokeStyle();
}

class Canvas {
    public readonly state: StateManager;
    public readonly element: HTMLCanvasElement;
    public readonly ctx: CanvasRenderingContext2D;
    public size: number;
    public readonly circleRadius: number = 0.4;

    public strokeStyle: string = "#fff";
    public strokeWidth: number = 1;

    constructor(state: StateManager, element: HTMLCanvasElement) {
        this.element = element;
        this.state = state;
        this.ctx = element.getContext("2d");
        this.updateScreenSize(element.clientWidth);
        this.ctx.strokeStyle = "#fff"
    }

    updateScreenSize(size: number) {
        this.size = size;
        this.element.width = size;
        this.element.height = size;
    }

    resetStrokeStyle() {
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.lineWidth = this.strokeWidth;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        drawUnitCircle(this)
        drawMouseLine(this)
    }
}

export class StateManager {
    public mouseX: number;
    public mouseY: number;
    private canvas: Canvas;

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = new Canvas(this, canvasElement);
        canvasElement.addEventListener("mousemove", (e: MouseEvent) => this.mouseMove(e))
    }

    mouseMove(event: MouseEvent) {
        if (event.target === this.canvas.element) {
            this.mouseX = event.offsetX / this.canvas.size;
            this.mouseY = event.offsetY / this.canvas.size;
            this.draw();
        }
    }

    draw() {
        this.canvas.draw();
    }
}
