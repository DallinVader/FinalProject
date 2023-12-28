const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const GlobalGravity = 0.3;
const GlobalGroundSpeed = -0.75;
let GlobalSpeedScale = 1;

let ObjectsToDraw = [];
let FallingObjs = [];
let SideScrollingObjs = [];
let CloudsObjs = [];

class BasicObject{
    constructor(ImageSrc, ImageSizePixles, position, Collision, VelocityX, VelocityY){
        this.position = position;
        this.Collision = Collision;
        this.Velocity = {x: VelocityX, y: VelocityY}
        this.Size = ImageSizePixles;
        if(ImageSrc){
            this.Image = new Image();
            this.Image.src = ImageSrc;
        }
        ObjectsToDraw.push(this);
        if(this.Velocity.y > 0){
            FallingObjs.push(this);
        }
        if(this.Velocity.x != 0){
            SideScrollingObjs.push(this);
        }
    }

    draw() {
        if(this.Image){
            ctx.save()
            ctx.setTransform(this.Collision.Size, 0, 0, this.Size, 0)
            ctx.rotate(0);
            ctx.drawImage(this.Image, this.position.x, this.position.y, this.Size.x, this.Size.y);
            ctx.restore();
        }
        else{
            ctx.fillRect(this.position.x, this.position.y, this.Size.x, this.Size.y)
        }
    }
}

const PlayerBird = new BasicObject("Plane.png", {x: 32, y: 16}, {x: Canvas.width / 4, y: 0}, true, 0, 3);
const House = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);
const Grass = new BasicObject("Grass.png", {x: 80, y: 16}, {x: Canvas.width, y: canvas.height - 16}, true, GlobalGroundSpeed, 0);
for (let x = 0; x < 10; x++) {
    CloudsObjs.push(new BasicObject("Cloud1.png", {x: 32, y: 16}, {x: Math.floor(Math.random() * Canvas.width), y: Math.floor(Math.random() * Canvas.height / 2.5) - 6}, true, -Math.abs(Math.random() * 0.75 + 0.5), 0));
}

function Update(){
    DrawAllDrawableObjects();

    MoveFallingObjects();

    MoveSideScrollingObjs();

    MoveCloudsIndependently();

    requestAnimationFrame(Update);
}

function MoveFallingObjects(){
    for (let x = 0; x < FallingObjs.length; x++) {
        let CurrentObj = FallingObjs[x];
        CurrentObj.position.x += CurrentObj.Velocity.x;
        CurrentObj.position.y += CurrentObj.Velocity.y;

        if(CurrentObj.position.y < canvas.height - 10){
            CurrentObj.Velocity.y = CurrentObj.Velocity.y + GlobalGravity;
        }
        else{
            CurrentObj.Velocity.y = 0;
            CurrentObj.position.y = canvas.height - 10;
            FallingObjs.splice(0);
            GlobalSpeedScale = 0.5;
            setTimeout(function StopMoveing(){GlobalSpeedScale = 0.25;setTimeout(function StopMoveing2(){GlobalSpeedScale = 0;}, 1000)}, 500)
        }
    }
}

function MoveSideScrollingObjs(){
    for (let x = 0; x < SideScrollingObjs.length; x++) {
        let CurrentObj = SideScrollingObjs[x];
        CurrentObj.position.x += CurrentObj.Velocity.x * GlobalSpeedScale;
        if(CurrentObj.position.x < 0 - CurrentObj.Size.x){
            CurrentObj.position.x = canvas.width;
        }
    }
}

function MoveCloudsIndependently(){
    for (let x = 0; x < CloudsObjs.length; x++){
        let CurrentCloudObj = CloudsObjs[x];
        CurrentCloudObj.position.x += CurrentCloudObj.Velocity.x * 0.2;
        CloudsObjs.Velocity = {x: -Math.abs(Math.random() * 1.25 + 0.75), y:0}
    }
}

function DrawAllDrawableObjects(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < ObjectsToDraw.length; x++) {
        ObjectsToDraw[x].draw();
    }
}

setTimeout("DrawAllDrawableObjects()", 100)

let StartedBool = false;
document.addEventListener("keydown", function(event){
    if(event.key === " "){
        if(!StartedBool){
            Update();
            StartedBool = true
        }
        if(GlobalSpeedScale == 0){
            location.reload();
        }
        else{
            //GlobalSpeedScale += 1
        }

        console.log("Space bar");
        PlayerBird.Velocity.y = -4;
    }
})