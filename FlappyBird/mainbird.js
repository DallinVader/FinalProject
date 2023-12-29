const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

const GlobalGravity = 0.3;
const GlobalGroundSpeed = -0.75;
let GlobalTime = 0;
let GlobalSpeedScale = 1;

const AntiAirGunCooldown = 1.5;
const EnemyPlanesCooldown = 0.2;
const DropShipmentSpawnTime = 10;
const EnemyPlaneSpawnTime = 12.5;

let ObjectsToDraw = [];
let PhysicsObjs = [];
let SideScrollingObjs = [];
let CloudsObjs = [];
let BulletsObjs = [];
let AntiAirGunObjs = [];
let ExplosionObjs = [];
let AiEnemyPlaneObjs = [];
let DropShipmentObjs = [];

class BasicObject{
    constructor(ImageSrc, ImageSizePixles, position, SideScrollingObj, VelocityX, VelocityY, CoolDownTime, UseGravity = false){
        this.position = position;
        this.IsSideScrollingObj = SideScrollingObj;
        this.VelocityX = VelocityX;
        this.VelocityY = VelocityY;
        this.Velocity = {x: VelocityX, y: VelocityY}
        this.StartVelocity = {x: VelocityX, y: VelocityY};
        this.Size = ImageSizePixles;
        this.CoolDownTime = 0;
        this.UseGravity = UseGravity;
        if(CoolDownTime){
            this.CoolDownTime = CoolDownTime;
        }
        if(ImageSrc){
            this.Image = new Image();
            this.Image.src = ImageSrc;
        }
        ObjectsToDraw.push(this);

        if(this.Velocity.y != 0 || this.Velocity.x != 0){
            PhysicsObjs.push(this);
        }

        if(SideScrollingObj){
            SideScrollingObjs.push(this);
        }
    }

    draw() {
        if(this.Image){
            ctx.save()
            ctx.drawImage(this.Image, Math.round(this.position.x), Math.round(this.position.y), this.Size.x, this.Size.y);
            ctx.restore();
        }
        else{
            ctx.fillRect(this.position.x, this.position.y, this.Size.x, this.Size.y)
        }
    }
}

const PlayerBird = new BasicObject("Plane.png", {x: 32, y: 16}, {x: Canvas.width / 3, y: 0}, false, 0, 0.01, 0, false);

const House = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);
const House1 = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);
const House2 = new BasicObject("House.png", {x: 32, y: 32}, {x: Canvas.width - 32, y: canvas.height - 32}, true, GlobalGroundSpeed, 0);

setTimeout("SpawnDropShipment()", DropShipmentSpawnTime);
setTimeout("SpawnEnemyPlane()", EnemyPlaneSpawnTime * 1000);

AntiAirGunObjs.push(new BasicObject("AntiAirGun.png", {x: 32, y: 16}, {x: Canvas.width - 75, y: canvas.height - 16}, true, GlobalGroundSpeed, 0, Math.random()));
AntiAirGunObjs.push(new BasicObject("AntiAirGun.png", {x: 32, y: 16}, {x: Canvas.width + 80, y: canvas.height - 16}, true, GlobalGroundSpeed, 0, Math.random()));
AntiAirGunObjs.push(new BasicObject("AntiAirGun.png", {x: 32, y: 16}, {x: Canvas.width + 160, y: canvas.height - 16}, true, GlobalGroundSpeed, 0, Math.random()));

const Grass = new BasicObject("Grass.png", {x: 80, y: 16}, {x: Canvas.width + Math.abs(Math.random() * canvas.width), y: canvas.height - 16}, true, GlobalGroundSpeed, 0);

for (let x = 0; x < 30; x++) {
    CloudsObjs.push(new BasicObject("Cloud1.png", {x: 32, y: 16}, {x: Math.floor(Math.random() * (Canvas.width * 2)), y: Math.floor(Math.random() * Canvas.height / 2.5) - 6}, true, -Math.abs(Math.random() * 0.75 + 0.5), 0));
}
for (let x = 0; x < 10; x++) {
    let Grass = new BasicObject("Grass.png", {x: 80, y: 16}, {x: Math.abs(Math.random() * canvas.width), y: canvas.height - 16}, true, GlobalGroundSpeed, 0);
}

function Update(){
    GlobalTime += 0.0175;

    DrawAllDrawableObjects();

    if(PlayerBird.position.x != Math.round(PlayerBird.position.x)){
        PlayerBird.position.x = Math.round(PlayerBird.position.x);
    }

    if(PlayerBird.position.y < 0){
        PlayerBird.position.y = 0;
    }
    if(PlayerBird.position.x < 0){
        PlayerBird.position.x = 0;
    }
    if(PlayerBird.position.x <= 0){
        if(PlayerBird.position.y < canvas.height - 50){
            PlayerBird.Velocity.y = 1.2;
        }
        else{
            PlayerBird.Velocity.y = 0.5;
        }
        ExplosionObjs.push(new BasicObject("Smoke.png", {x: 8, y: 8}, {x: PlayerBird.position.x + PlayerBird.Size.x - 8.5 - (Math.random() * 10), y: PlayerBird.position.y + 2}, true, 0, -1.2, GlobalTime + 1, false));

    }
    
    AntiAirGuns();
    CheckExplosions();

    AiEnemyPlanes();
    
    MoveDropShipments();
    MoveBullets();
    MovePhysicsObjects();
    MoveSideScrollingObjs();
    MoveCloudsIndependently();

    requestAnimationFrame(Update);
}

function MoveDropShipments(){
    for (let x = 0; x < DropShipmentObjs.length; x++) {
        let CurrentShipment = DropShipmentObjs[x];
        CurrentShipment.Velocity.y = CurrentShipment.StartVelocity.y;
        
        if(CheckForCollisionWithObj(CurrentShipment, PlayerBird)){
            PlayerBird.Velocity.x += 2;
            RemoveObjFromObjsToDraw(CurrentShipment);
            DropShipmentObjs.splice(x, 1);
        }
        if(CurrentShipment.position.y > canvas.height + CurrentShipment.Size.y){
            RemoveObjFromObjsToDraw(CurrentShipment);
            DropShipmentObjs.splice(x, 1);
        }
    }
}

function SpawnEnemyPlane(){
    AiEnemyPlaneObjs.push(new BasicObject("EnemyPlane.png", {x: 32, y: 16}, {x: Canvas.width + 32, y: 0}, true, -1, 1, 0, false));
    setTimeout("SpawnEnemyPlane()", EnemyPlaneSpawnTime * 1000);
}

function SpawnDropShipment(){
    DropShipmentObjs.push(new BasicObject("DropShipment.png", {x: 16, y: 16}, {x: Canvas.width, y: 0}, true, GlobalGroundSpeed + (Math.random() * 2), 0.2, 0, false));
    setTimeout("SpawnDropShipment()", DropShipmentSpawnTime * 1000);
}

function AiEnemyPlanes(){
    for (let x = 0; x < AiEnemyPlaneObjs.length; x++) {
        const CurrentEnemyPlane = AiEnemyPlaneObjs[x];
        if(CurrentEnemyPlane.position.y < PlayerBird.position.y + PlayerBird.Size.y && CurrentEnemyPlane.position.y > PlayerBird.position.y - PlayerBird.Size.y){
            if(CurrentEnemyPlane.CoolDownTime <= GlobalTime){
                CurrentEnemyPlane.CoolDownTime = GlobalTime + EnemyPlanesCooldown;
                BulletsObjs.push(new BasicObject("Bullet.png", {x: 5, y: 5}, {x: CurrentEnemyPlane.position.x + (Math.random() * 4), y: CurrentEnemyPlane.position.y}, true, -5, 0, 0.05));
            }
        }
        CurrentEnemyPlane.Velocity.x = -1;
        if(CurrentEnemyPlane.position.y < PlayerBird.position.y && PlayerBird.position.y < canvas.height - 50){
            CurrentEnemyPlane.Velocity.y += 0.03;
        }
        else if(CurrentEnemyPlane.position.y > 10)
        {
            CurrentEnemyPlane.Velocity.y += -0.045;
        }
        else{
            CurrentEnemyPlane.Velocity.y += 0.05;
        }
        if(CurrentEnemyPlane.position.x <= -CurrentEnemyPlane.Size.x){
            RemoveObjFromObjsToDraw(CurrentEnemyPlane);
            AiEnemyPlaneObjs.splice(x, 1);
        }
    }
}

function AntiAirGuns(){
    for (let x = 0; x < AntiAirGunObjs.length; x++) {
        const CurrentAntiAirGun = AntiAirGunObjs[x];
        if(CurrentAntiAirGun.CoolDownTime < GlobalTime){
            CurrentAntiAirGun.CoolDownTime = GlobalTime + AntiAirGunCooldown + Math.random();
            BulletsObjs.push(new BasicObject("AntiAirShell.png", {x: 5, y: 5}, {x: CurrentAntiAirGun.position.x, y: canvas.height - CurrentAntiAirGun.Size.y}, true, -3, -3, 0.15));
        }
        
    }
}

function CheckExplosions(){
    for (let x = 0; x < ExplosionObjs.length; x++) {
        let CurrentExplosion = ExplosionObjs[x];
        if(CurrentExplosion.CoolDownTime < GlobalTime || CurrentExplosion.position.x <= -CurrentExplosion.Size.x + 1){
            RemoveObjFromObjsToDraw(CurrentExplosion);
            ExplosionObjs.splice(x, 1);
        }
        
    }
}

function MoveBullets(){
    for (let x = 0; x < BulletsObjs.length; x++) {
        const CurrentBullet = BulletsObjs[x];
        
        CurrentBullet.Velocity.x = CurrentBullet.VelocityX;
        CurrentBullet.Velocity.y = CurrentBullet.VelocityY;
        if(CheckForCollisionWithObj(CurrentBullet, PlayerBird)){
            RemoveObjFromObjsToDraw(CurrentBullet);
            PlayerBird.Velocity.x -= CurrentBullet.CoolDownTime;
            
            if(!CurrentBullet.UseGravity){
                ExplosionObjs.push(new BasicObject("Explosion.png", {x: 8, y: 8}, {x: CurrentBullet.position.x, y: CurrentBullet.position.y}, true, 0, 0, GlobalTime + 0.1));
                CurrentBullet.UseGravity = true;
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
            if(CurrentObj.UseGravity){
                CurrentObj.Velocity.y = CurrentObj.Velocity.y + GlobalGravity;
            }
            else{
                CurrentObj.Velocity.y /= 1.025;
            }
        }
        else{
            if(CurrentObj == PlayerBird){
                CurrentObj.Velocity.y = 0;
                CurrentObj.position.y = canvas.height - CurrentObj.Size.y;
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

        if(CurrentObj.position.x < 0 - CurrentObj.Size.x){
            CurrentObj.position.x = canvas.width + (Math.random() * canvas.width);
        }

        CurrentObj.position.x += -GlobalSpeedScale;
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

    ctx.fillText(Math.round(GlobalTime), canvas.width / 1.04, canvas.height / 20);
    for (let x = 0; x < ObjectsToDraw.length; x++) {
        ObjectsToDraw[x].draw();
    }
}

setTimeout("DrawAllDrawableObjects()", 100)

let StartedBool = false;
document.addEventListener("keydown", function(event){
    if(event.key){
        if(!StartedBool){
            Update();
            StartedBool = true
        }
        if(GlobalSpeedScale == 0){
            location.reload();
        }
    }
    if(event.key === "w" || event.key === "W"){

        if(PlayerBird.Velocity.y > -2){
            PlayerBird.Velocity.y += -1;
        }
    }
    if(event.key === "s" || event.key === "S"){

        if(PlayerBird.Velocity.y < 2){
            PlayerBird.Velocity.y += 1;
        }
    }
})