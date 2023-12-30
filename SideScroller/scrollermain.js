const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const FpsDisplay = document.getElementById("FPS");

canvas.width = 350;
canvas.height = 175;

const GlobalGravity = 0.05;

let GlobalMoveVelocityX = 1;

let DrawableObjs = [];
let CollisionObjs = [];
let PhysicsObjs = [];
let EnemyObjs = [];

class BasicObject {
    constructor(ImageSrc, SizeX, SizeY, PosX, PosY, Repeatable = 0, HasCollision = false, HasPhysics = false) {
        this.position = { x: PosX, y: PosY };
        this.Size = { x: SizeX, y: SizeY };
        this.Velocity = {x: 0, y: 0};

        this.Repeatable = Repeatable;

        this.Image = new Image();
        this.Image.src = ImageSrc;

        this.HasCollision = HasCollision;

        if(this.HasCollision){
            CollisionObjs.push(this);
        }

        this.HasPhysics = HasPhysics;

        if(this.HasPhysics){
            this.IsFalling = true;
            PhysicsObjs.push(this);
        }
        DrawableObjs.push(this);
    }
    
    draw() {
        if(this.Repeatable > 0){
            for (let x = 0; x < this.Repeatable; x++) {
                ctx.drawImage(this.Image, Math.round(this.position.x + this.Size.x * (x)), Math.round(this.position.y), this.Size.x, this.Size.y);
            }
        }
        else{
            ctx.drawImage(this.Image, Math.round(this.position.x), Math.round(this.position.y), this.Size.x, this.Size.y);
        }
    }
}

class SoldierObject {
    constructor(ImageSrc, SizeX, SizeY, PosX, PosY, Speed = (Math.random() * 1.5 + 0.25), MoveDirection = 1) {
        this.position = { x: PosX, y: PosY };
        this.Size = { x: SizeX, y: SizeY };
        this.Velocity = {x: 0, y: 0};

        this.Speed = Speed;
        this.MoveDirection = MoveDirection;
        this.Repeatable = 1;

        this.Image = new Image();
        this.Image.src = ImageSrc;

        this.HasCollision = true;

        if(this.HasCollision){
            CollisionObjs.push(this);
        }

        this.HasPhysics = true;

        if(this.HasPhysics){
            this.IsFalling = true;
            PhysicsObjs.push(this);
        }
        EnemyObjs.push(this);
        DrawableObjs.push(this);
    }
    
    draw() {
        ctx.save();
        if(this.Repeatable > 1){
            for (let x = 0; x < this.Repeatable; x++) {
                ctx.drawImage(this.Image, Math.round(this.position.x + this.Size.x * (x)) * ctx.scale.x, Math.round(this.position.y), this.Size.x, this.Size.y);
            }
        }
        else{
            if(this.MoveDirection < 0){
                ctx.scale(-1, 1);
                ctx.drawImage(this.Image, -Math.round(this.position.x) - this.Size.x, Math.round(this.position.y), this.Size.x, this.Size.y);
            }
            else{
                ctx.drawImage(this.Image, Math.round(this.position.x), Math.round(this.position.y), this.Size.x, this.Size.y);
                ctx.scale(1, 1);
            }
        }
        ctx.restore();
    }
}

let Grass = new BasicObject("Assets/Art/GrassTile.png", 16, 16, 32, canvas.height - 32, 3);
let GroundObj = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 0, canvas.height - 16, 20, true);
let GroundObj1 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 0, canvas.height - 32, 5, true);
let GroundObj2 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 15, canvas.height - 32, 5, true);



let Sold1ier = new SoldierObject("Assets/Art/Soldier.png", 16, 16, 16 * 8.5, canvas.height - 100);
let Sol1dier = new SoldierObject("Assets/Art/Soldier.png", 16, 16, 16 * 7.2, canvas.height - 100);
let So1ldier = new SoldierObject("Assets/Art/Soldier.png", 16, 16, 16 * 6.4, canvas.height - 100);
let Soldier = new SoldierObject("Assets/Art/Soldier.png", 16, 16, 16 * 5.3, canvas.height - 100);

console.log(CollisionObjs.length);

let FPS;
let LastFps = new Date();
function CheckFps(){
    FpsDisplay.innerText = "frames per second " + Math.round(FPS);
    
    setTimeout("CheckFps()", 100);
}

CheckFps();

function Update(){
    let CurrentFps = new Date();
    FPS = 1000 / (CurrentFps - LastFps);
    LastFps = CurrentFps;
    
    PhysicsCheck();

    setTimeout("Update()");
}

function PhysicsCheck(){
    for (let p = 0; p < PhysicsObjs.length; p++) {
        let CurrentObj = PhysicsObjs[p];
        CurrentObj.IsFalling = true;
        
        CurrentObj.Velocity.x += 0.075 * CurrentObj.MoveDirection * CurrentObj.Speed;
        
        
        for (let c = 0; c < CollisionObjs.length; c++) {
            let CurrentCollObj = CollisionObjs[c];
            if(CheckForCollisionWithObj(CurrentObj, CurrentCollObj)){
                CurrentObj.IsFalling = false;
            }
        }
        
        if(CurrentObj.IsFalling){
            CurrentObj.Velocity.y += GlobalGravity;
            CurrentObj.position.y += CurrentObj.Velocity.y;
            CurrentObj.position.x += CurrentObj.Velocity.x / 20;
        }
        else{
            CurrentObj.position.x += CurrentObj.Velocity.x;
            CurrentObj.Velocity.y = 0;
            CurrentObj.Velocity.x = 0;
        }

    }
}

Update();

function DrawAllDrawableObjects(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < DrawableObjs.length; x++) {
        const CurrentObj = DrawableObjs[x];
        CurrentObj.draw();
    }
    setTimeout("DrawAllDrawableObjects()")
}
DrawAllDrawableObjects();

function CheckForCollisionWithObj(Obj1, Obj2){
    HitX = false;
    HitY = false;

    if(Obj1.position.x < Obj2.position.x + (Obj2.Size.x * Obj2.Repeatable) && Obj1.position.x > Obj2.position.x - Obj2.Size.x){
        HitX = true;
    }
    if(Obj1.position.y < Obj2.position.y + Obj2.Size.y && Obj1.position.y > Obj2.position.y - Obj2.Size.y){
        HitY = true;
    }
    
    
    if(HitY && HitX && Obj1.HasPhysics){
        //Checks For collision on the left side of the object.
        if(Obj1.position.x - Obj2.position.x < 0 && Obj1.Velocity.x > 0){
            Obj1.MoveDirection = -1;
            Obj1.position.x -= 0.25;
        }
        
        //Checks for collision on the right side of the object.
        if(Obj1.position.x - Obj2.position.x < Obj2.Size.x * Obj2.Repeatable && Obj1.position.x - Obj2.position.x > (Obj2.Size.x * Obj2.Repeatable) - (Obj2.Size.x / 4) && Obj1.Velocity.x < 0){
            Obj1.MoveDirection = 1;
            Obj1.position.x += 0.25;
        }



        if(Obj1.position.y - Obj2.position.y < -Obj1.Size.y / 1.75){
            Obj1.Velocity.y = 0;
            Obj1.position.y -= 0.25;
            return true;
        }
    }
}

document.addEventListener("keydown", function(event){
    if(event.key){
        if(GlobalMoveVelocityX == 1){
            GlobalMoveVelocityX = -1;
        }
        else{
            GlobalMoveVelocityX = 1;
        }
    }
})