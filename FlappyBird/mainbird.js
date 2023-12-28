const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const GlobalGravity = 0.5;

let ObjectsToDraw = [];
let UpdateableObjects = [];


class BasicObject{
    constructor(position, DrawSprite, Collision, Velocity){
        this.position = position;
        this.DrawSprite = DrawSprite;
        this.Collision = Collision;
        this.Velocity = Velocity;
        if(Velocity){
            UpdateableObjects.push(this);
        }
        
        if(DrawSprite){
            ObjectsToDraw.push(this);
        }
    }

    draw() {
        ctx.fillRect(this.position.x, this.position.y, 15, 15)
    }
}

const PlayerBird = new BasicObject({x: Canvas.width / 2, y: 0}, true, true, {x: 0, y: 3});

function Update(){
    DrawAllDrawableObjects();

    for (let x = 0; x < UpdateableObjects.length; x++) {
        let CurrentObj = UpdateableObjects[x];
        CurrentObj.position.x += CurrentObj.Velocity.x;
        CurrentObj.position.y += CurrentObj.Velocity.y;
        if(CurrentObj.position.y < canvas.height - 15){
            CurrentObj.Velocity.y = CurrentObj.Velocity.y + GlobalGravity;
        }
        else{
            CurrentObj.Velocity.y = 0;
            CurrentObj.position.y = canvas.height - 15;
        }
    }
    requestAnimationFrame(Update);
}

function DrawAllDrawableObjects(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < ObjectsToDraw.length; x++) {
        ObjectsToDraw[x].draw();
    }
}

Update();

document.addEventListener("keydown", function(event){
    if(event.key === " "){
        console.log("Space bar");
        PlayerBird.Velocity.y = -5.5;

    }
})