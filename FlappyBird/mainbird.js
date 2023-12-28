const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const GlobalGravity = 0.3;
const GlobalGroundSpeed = -0.75;
let GlobalTime = 0;
let GlobalSpeedScale = 1;

const AntiAirGunCooldown = 1.5;

let ObjectsToDraw = [];
let PhysicsObjs = [];
let SideScrollingObjs = [];
let CloudsObjs = [];
let BulletsObjs = [];
let AntiAirGunObjs = [];
let ExplosionObjs = [];

class BasicObject{
    constructor(ImageSrc, ImageSizePixles, position, SideScrollingObj, VelocityX, VelocityY, CoolDownTime){
        this.position = position;
        this.IsSideScrollingObj = SideScrollingObj;
        this.Velocity = {x: VelocityX, y: VelocityY}
        this.Size = ImageSizePixles;
        this.CoolDownTime = 0;
        if(CoolDownTime){
            this.CoolDownTime = CoolDownTime;
        }
        if(ImageSrc){
            this.Image = new Image();
            this.Image.src = ImageSrc;
        }
        ObjectsToDraw.push(this);
        if(this.Velocity.y != 0){
            PhysicsObjs.push(this);
        }
        if(SideScrollingObj){
            SideScrollingObjs.push(this);
        }
    }

    draw() {
        if(this.Image){
            ctx.save()
            ctx.drawImage(this.Image, this.position.x, this.position.y, this.Size.x, this.Size.y);
            ctx.restore();
        }
        else{
            ctx.fillRect(this.position.x, this.position.y, this.Size.x, this.Size.y)
        }
    }
}

const PlayerBird = new BasicObject("Plane.png", {x: 32, y: 16}, {x: Canvas.width / 4, y: 0}, false, 0, 3);
const House = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);
const House1 = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);
const House2 = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);


AntiAirGunObjs.push(new BasicObject("AntiAirGun.png", {x: 32, y: 16}, {x: Canvas.width - 75, y: canvas.height - 16}, true, GlobalGroundSpeed, 0, Math.random()));
AntiAirGunObjs.push(new BasicObject("AntiAirGun.png", {x: 32, y: 16}, {x: Canvas.width - 45, y: canvas.height - 16}, true, GlobalGroundSpeed, 0, Math.random()));
AntiAirGunObjs.push(new BasicObject("AntiAirGun.png", {x: 32, y: 16}, {x: Canvas.width - 60, y: canvas.height - 16}, true, GlobalGroundSpeed, 0, Math.random()));

const Grass = new BasicObject("Grass.png", {x: 80, y: 16}, {x: Canvas.width + Math.abs(Math.random() * canvas.width), y: canvas.height - 16}, true, GlobalGroundSpeed, 0);

for (let x = 0; x < 30; x++) {
    CloudsObjs.push(new BasicObject("Cloud1.png", {x: 32, y: 16}, {x: Math.floor(Math.random() * (Canvas.width * 2)), y: Math.floor(Math.random() * Canvas.height / 2.5) - 6}, true, -Math.abs(Math.random() * 0.75 + 0.5), 0));
}
for (let x = 0; x < 10; x++) {
    let Grass = new BasicObject("Grass.png", {x: 80, y: 16}, {x: Math.abs(Math.random() * canvas.width), y: canvas.height - 16}, true, GlobalGroundSpeed, 0);
}

function Update(){
    GlobalTime += 0.01;

    DrawAllDrawableObjects();

    if(PlayerBird.position.x < 0){
        
    }
    
    AntiAirGuns();
    CheckExplosions();

    MoveBullets();
    MovePhysicsObjects();
    MoveSideScrollingObjs();
    MoveCloudsIndependently();

    requestAnimationFrame(Update);
}

function AntiAirGuns(){
    for (let x = 0; x < AntiAirGunObjs.length; x++) {
        const CurrentAntiAirGun = AntiAirGunObjs[x];
        if(CurrentAntiAirGun.CoolDownTime < GlobalTime){
            CurrentAntiAirGun.CoolDownTime = GlobalTime + AntiAirGunCooldown + Math.random();
            BulletsObjs.push(new BasicObject("AntiAirShell.png", {x: 5, y: 5}, {x: CurrentAntiAirGun.position.x, y: canvas.height - CurrentAntiAirGun.Size.y}, true, -5, -2));
        }
        
    }
}

function CheckExplosions(){
    for (let x = 0; x < ExplosionObjs.length; x++) {
        let CurrentExplosion = ExplosionObjs[x];
        if(CurrentExplosion.CoolDownTime < GlobalTime){
            RemoveObjFromObjsToDraw(CurrentExplosion);
            ExplosionObjs.splice(x, 1);
        }
        
    }
}

function MoveBullets(){
    for (let x = 0; x < BulletsObjs.length; x++) {
        const CurrentBullet = BulletsObjs[x];

        CurrentBullet.Velocity = {x: -2, y: -2};
        if(CheckForCollisionWithObj(CurrentBullet, PlayerBird)){
            RemoveObjFromObjsToDraw(CurrentBullet);
            PlayerBird.Velocity.x = -1
            
            if(CurrentBullet.CoolDownTime == 0){
                console.log("create explosion")
                ExplosionObjs.push(new BasicObject("Explosion.png", {x: 8, y: 8}, {x: CurrentBullet.position.x, y: CurrentBullet.position.y}, true, 0, 0, GlobalTime + 0.1));
                CurrentBullet.CoolDownTime = 1;
            }
        }

        if(CurrentBullet.position.x < 0){
            RemoveObjFromObjsToDraw(CurrentBullet);
            BulletsObjs.splice(x, 1);
        }
    }
}

function CheckForCollisionWithObj(Obj1, Obj2){
    HitX = false;
    HitY = false;

    if(Obj1.position.x < Obj2.position.x + Obj2.Size.x && Obj1.position.x > Obj2.position.x - Obj2.Size.x){
        HitX = true;
    }
    if(Obj1.position.y < Obj2.position.y + Obj2.Size.y && Obj1.position.y > Obj2.position.y - Obj2.Size.y){
        HitY = true;
    }
    if(HitY && HitX){
        return(true);
    }
    else{
        return(false);
    }
}

function RemoveObjFromObjsToDraw(ObjToRemove){
    for (let x = 0; x < ObjectsToDraw.length; x++) {
        const CurrentObj = ObjectsToDraw[x];
        if(CurrentObj == ObjToRemove){
            ObjectsToDraw.splice(x, 1);
        }
    }
}

function MovePhysicsObjects(){
    for (let x = 0; x < PhysicsObjs.length; x++) {
        let CurrentObj = PhysicsObjs[x];
        CurrentObj.position.x += CurrentObj.Velocity.x;
        CurrentObj.position.y += CurrentObj.Velocity.y;
        CurrentObj.Velocity.x = CurrentObj.Velocity.x / 1.05;

        if(CurrentObj.position.y < canvas.height - 10){
            CurrentObj.Velocity.y = CurrentObj.Velocity.y + GlobalGravity;
        }
        else{
            CurrentObj.Velocity.y = 0;
            CurrentObj.position.y = canvas.height - CurrentObj.Size.y;
            if(CurrentObj == PlayerBird){
                CurrentObj.position.y = canvas.height - 10;
                PhysicsObjs.splice(0, 1);
                GlobalSpeedScale = 0.5;
                setTimeout(function StopMoveing(){GlobalSpeedScale = 0.25;setTimeout(function StopMoveing2(){GlobalSpeedScale = 0;}, 1000)}, 500)
            }
        }
    }
}

function MoveSideScrollingObjs(){
    for (let x = 0; x < SideScrollingObjs.length; x++) {
        let CurrentObj = SideScrollingObjs[x];
        CurrentObj.position.x += -GlobalSpeedScale;
        if(CurrentObj.position.x < 0 - CurrentObj.Size.x){
            CurrentObj.position.x = canvas.width + (Math.random() * canvas.width);
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

        if(PlayerBird.position.y >= 0 && PlayerBird.position.x >= 0){
            PlayerBird.Velocity.y = -4;
        }
    }
})