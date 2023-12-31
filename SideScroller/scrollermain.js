const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const FpsDisplay = document.getElementById("FPS");

// Set to 350x175 after level editing
const LevelSize = 1;
canvas.width = 350 * LevelSize;
canvas.height = 175 * LevelSize;

const GlobalGravity = 0.03;
const StartTime = Date.now();

let CurrentTime

let GlobalMoveVelocityX = 1;

let DrawableObjs = [];
let CollisionObjs = [];
let PhysicsObjs = [];
let EnemyObjs = [];

class BasicObject {
    constructor(ImageSrc, SizeX, SizeY, PosX, PosY, Repeatable = 0, HasCollision = false, HasPhysics = false, IsVissable = true) {
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

        if(IsVissable){
            DrawableObjs.push(this);
        }
    }
    
    draw() {
        if(this.Repeatable > 1){
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
    constructor(ImageSrc, SizeX, SizeY, PosX, PosY, CurrentSprite = 0, Speed = (Math.random() * 1.5 + 0.25), MoveDirection = 1) {
        this.position = { x: PosX, y: PosY };
        this.Size = { x: SizeX, y: SizeY };
        this.Velocity = {x: 0, y: 0};

        this.Speed = Speed;
        this.MoveDirection = MoveDirection;
        this.Repeatable = 1;
        
        this.CurrentSprite = CurrentSprite;

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
                ctx.drawImage(this.Image, this.Size.x * this.CurrentSprite, 0, this.Size.x, this.Size.y, -Math.round(this.position.x) - this.Size.x, Math.round(this.position.y), this.Size.x, this.Size.y);
            }
            else{
                ctx.drawImage(this.Image, this.Size.x * this.CurrentSprite, 0, this.Size.x, this.Size.y, Math.round(this.position.x), Math.round(this.position.y), this.Size.x, this.Size.y);
                ctx.scale(1, 1);
            }
        }
        ctx.restore();
    }
}

class PlayerObject {
    constructor(ImageSrc, SizeX, SizeY, PosX, PosY, Speed = (Math.random() * 1.5 + 0.25), CurrentSprite = 0, MoveDirection = 1) {
        this.position = { x: PosX, y: PosY };
        this.Size = { x: SizeX, y: SizeY };
        this.Velocity = {x: 0, y: 0};

        this.IsDead = false;

        this.Speed = Speed;
        this.MoveDirection = MoveDirection;
        this.Repeatable = 1;
        this.Flip = false;
        this.CurrentSprite = CurrentSprite;

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
        DrawableObjs.push(this);
    }
    
    draw() {
        ctx.save();
        if(this.Repeatable > 1){
            for (let x = 0; x < this.Repeatable; x++) {
                ctx.drawImage(this.Image, this.Size.x * this.CurrentSprite, 0, this.Size.x, this.Size.y, Math.round(this.position.x + this.Size.x * (x)) * ctx.scale.x, Math.round(this.position.y), this.Size.x, this.Size.y);
            }
        }
        else{
            if(this.Flip){
                ctx.scale(-1, 1);
                ctx.drawImage(this.Image, this.Size.x * this.CurrentSprite, 0, this.Size.x, this.Size.y, -Math.round(this.position.x) - this.Size.x, Math.round(this.position.y), this.Size.x, this.Size.y);
            }
            else{
                ctx.drawImage(this.Image, this.Size.x * this.CurrentSprite, 0, this.Size.x, this.Size.y, Math.round(this.position.x), Math.round(this.position.y), this.Size.x, this.Size.y);
            }
        }
        ctx.restore();
    }
}

let Grass = new BasicObject("Assets/Art/GrassTile.png", 16, 16, 32, canvas.height - 32, 3);
let GroundObj = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * -15, canvas.height - 16, 40, true);
let GroundObj1 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 0, canvas.height - 32, 5, true);
let GroundObj2 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 15, canvas.height - 32, 5, true);
let GroundObj3 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 28, canvas.height - 16, 20, true);
let GroundObj4 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 30, canvas.height - 32, 5, true);
let GroundObj5 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 44, canvas.height - 32, 3, true);
let GroundObj6 = new BasicObject("Assets/Art/GroundTile.png", 16, 16, 16 * 51, canvas.height - 16, 25, true);

let Player = new PlayerObject("Assets/Art/Soldier.png", 16, 16, 0, canvas.height / 1.25, 0.5);

let Sold1ier = new SoldierObject("Assets/Art/EnemySoldier.png", 16, 16, 16 * 8.5, canvas.height - 100);
let Sol1dier = new SoldierObject("Assets/Art/EnemySoldier.png", 16, 16, 16 * 7.2, canvas.height - 100);
let So1ldier = new SoldierObject("Assets/Art/EnemySoldier.png", 16, 16, 16 * 6.4, canvas.height - 100);
let Soldier = new SoldierObject("Assets/Art/EnemySoldier.png", 16, 16, 16 * 5.3, canvas.height - 100);

console.log(CollisionObjs.length);

let FPS;
let LastFps = new Date();
function CheckFps(){
    FpsDisplay.innerText = "frames per second " + Math.round(FPS);
    
    setTimeout("CheckFps()", 100);
}

CheckFps();

let MoveRight = false;
let MoveLeft = false;
let IsJumping = false;
let JumpCooldown = 0;

let AnimationChangeCooldown = 0;
const AnimationChangeWaitTime = 0.1;

const PlayerJumpForce = 2.5;
const JumpTime = 0.3;

let PlayerGroundCheck = false;
let NewGroundCheckObj = new BasicObject("Assets/Art/Soldier.png", 16, 16, Player.position.x, Player.position.y + Player.Size.y, 1, false, false, false)

function Update(){
    let CurrentFps = new Date();
    FPS = 1000 / (CurrentFps - LastFps);
    LastFps = CurrentFps;

    CurrentTime = Math.abs(StartTime - Date.now()) / 1000;

    if(AnimationChangeCooldown < CurrentTime){
        AnimationChangeCooldown = CurrentTime + AnimationChangeWaitTime;
        if(PlayerGroundCheck && MoveRight || PlayerGroundCheck && MoveLeft){
            Player.CurrentSprite += 1;
        }
        else if(PlayerGroundCheck){
            Player.CurrentSprite = 2;
        }
        else{
            Player.CurrentSprite = 3;
        }
        if(Player.CurrentSprite > 3){
            Player.CurrentSprite = 0;
        }

        for (let x = 0; x < EnemyObjs.length; x++) {
            const CurrentEnemy = EnemyObjs[x];
            CurrentEnemy.CurrentSprite += 1;
            if(CurrentEnemy.CurrentSprite > 3){
                CurrentEnemy.CurrentSprite = 0;
            }
        }
    }

    PlayerUpdateStuff();
    
    PhysicsCheck();
    
    if(IsJumping && JumpCooldown > CurrentTime){
        Player.Velocity.y = -PlayerJumpForce / 2;
    }
    setTimeout("Update()");
}
Update();

function PlayerUpdateStuff(){
    Player.position.x = canvas.width / 3;
    
    NewGroundCheckObj.position.x = Player.position.x - (NewGroundCheckObj.Size.x / 4);
    NewGroundCheckObj.position.y = Player.position.y + (Player.Size.y / 2);
    
    
    if(Player.position.y > canvas.height * 1.5){
        location.reload();
    }

    if(Player.IsDead){
        PlayerGroundCheck = false;
        Player.MoveDirection = 0;
        Player.CurrentSprite = 4;
        return;
    }
    
    if(MoveRight && !MoveLeft){
        Player.MoveDirection = 1 * Player.Speed;
        Player.Flip = false;
    }
    else if(MoveLeft && !MoveRight){
        Player.MoveDirection = -1 * Player.Speed;
        Player.Flip = true;
    }
    else if(MoveLeft && MoveRight){
        Player.MoveDirection = 0;
    }
    else{
        Player.MoveDirection = 0;
    }

    PlayerGroundCheck = false;
    for (let x = 0; x < CollisionObjs.length; x++) {
        const CurrentColl = CollisionObjs[x];
        if(CheckForCollisionWithObjYandX(NewGroundCheckObj, CurrentColl) && CurrentColl != Player && CurrentColl != NewGroundCheckObj){
            PlayerGroundCheck = true;
        }
    }

}

function PlayerDeath(){
    Player = new BasicObject("Assets/Art/GroundTile.png", 16, 16, Player.position.x, Player.position.y, 0, true);
}
setTimeout("PlayerDeath()", 2000)
function PhysicsCheck(){
    for (let p = 0; p < PhysicsObjs.length; p++) {
        let CurrentObj = PhysicsObjs[p];
        CurrentObj.IsFalling = true;
        
        CurrentObj.Velocity.x = 0.1 * CurrentObj.MoveDirection * CurrentObj.Speed;
        
        
        for (let c = 0; c < CollisionObjs.length; c++) {
            let CurrentCollObj = CollisionObjs[c];
            if(CheckForCollisionWithObjYandX(CurrentObj, CurrentCollObj)){
                CurrentObj.IsFalling = false;
            }
        }
        
        if(CurrentObj.IsFalling){
            CurrentObj.Velocity.y += GlobalGravity;
            CurrentObj.position.y += CurrentObj.Velocity.y;
            CurrentObj.position.x += CurrentObj.Velocity.x;
        }
        else{
            CurrentObj.position.x += CurrentObj.Velocity.x;
            CurrentObj.Velocity.y = 0;
            CurrentObj.Velocity.x = 0;
        }

    }
}


function DrawAllDrawableObjects(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < DrawableObjs.length; x++) {
        const CurrentObj = DrawableObjs[x];
        if(CurrentObj != Player){
            CurrentObj.position.x -= Player.MoveDirection;
            CurrentObj.draw();
        }
        else{
            CurrentObj.draw();
        }
    }
    setTimeout("DrawAllDrawableObjects()")
}
DrawAllDrawableObjects();

function CheckForCollisionWithObjYandX(Obj1, Obj2){
    HitX = false;
    HitY = false;

    if(Obj1.position.x < Obj2.position.x + (Obj2.Size.x * Obj2.Repeatable) && Obj1.position.x > Obj2.position.x - Obj2.Size.x){
        HitX = true;
    }
    if(Obj1.position.y < Obj2.position.y + Obj2.Size.y && Obj1.position.y > Obj2.position.y - Obj2.Size.y){
        HitY = true;
    }

    
    
    if(HitY && HitX && Obj1.HasPhysics){
        if(Obj1 instanceof SoldierObject){
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
        }
        else{
            
            //Checks For collision on the left side of the object.
            if(Obj1.position.x - Obj2.position.x < 0 && Obj1.Velocity.x > 0){
                Obj1.position.x -= 0.25;
                if(Obj1 == Player){
                    if(Player.MoveDirection > 0){
                        Player.MoveDirection = 0;
                    }
                }
            }
            
            //Checks for collision on the right side of the object.
            if(Obj1.position.x - Obj2.position.x < Obj2.Size.x * Obj2.Repeatable && Obj1.position.x - Obj2.position.x > (Obj2.Size.x * Obj2.Repeatable) - (Obj2.Size.x / 4) && Obj1.Velocity.x < 0){
                Obj1.position.x += 0.25;
                if(Obj1 == Player){
                    if(Player.MoveDirection < 0){
                        Player.MoveDirection = 0;
                    }
                }
            }
        }



        if(Obj1.position.y - Obj2.position.y < -Obj1.Size.y / 1.9){
            Obj1.Velocity.y = 0;
            Obj1.position.y -= 0.25;
            return true;
        }
    }
    else if(HitX && HitY){
        return true;
    }
    else{
        return false;
    }
}

let SpacePressed = false;
document.addEventListener("keydown", function(event){
    if(event.key == "d" || event.key == "D"){
        MoveRight = true;
    }
    if(event.key == "a" || event.key == "A"){
        MoveLeft = true;
    }
    
    if(event.key == " " && PlayerGroundCheck == true && !SpacePressed){
        SpacePressed = true;
        IsJumping = true;
        JumpCooldown = CurrentTime + JumpTime;
    }
})

document.addEventListener("keyup", function(event){
    if(event.key == "d" || event.key == "D"){
        MoveRight = false;
    }
    if(event.key == "a" || event.key == "A"){
        MoveLeft = false;
    }
    if(event.key == " "){
        IsJumping = false;
        SpacePressed = false;
    }
})