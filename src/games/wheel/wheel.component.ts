import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Application, Container, Sprite, Graphics, Text, Assets, Color } from 'pixi.js';
import { WheelPrizeType } from './wheel.interface';
import { DropShadowFilter } from 'pixi-filters';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';

@Component({
  selector: 'app-wheel',
  template: '',
})

export class WheelComponent implements AfterViewInit, OnDestroy{
  public prizes:WheelPrizeType[] = [];
  @ViewChild("wheelElement",{static:true}) wheelElement:ElementRef | undefined;
  canvasDiameter = 500;
  diameter = this.canvasDiameter - 50;
  radius = this.diameter/2;
  private totalAngle = Math.PI * 2;
  private wheelContainer = new Container();
  rotationalContainer = new Container();
  wheelButton = new Graphics();
  lastSpin = 0;
  lastMiddleAngle = 0;
  isPlaying = false;
  private scaleFactor: number = 1;

  private wheel = new Application({
    backgroundAlpha:0,
    autoDensity: true,
    resolution:window.devicePixelRatio,
  })

  constructor(){
    gsap.registerPlugin(CustomEase);
  }

  ngAfterViewInit(): void {
    this.initWheel()
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.handleResize());
  }

  private initWheel() {
    CustomEase.create("wheelEase", "M0,0 C0.17,0 0.286,0.085 0.32,0.115 0.394,0.18 0.48,0.405 0.5,0.5 0.521,0.603 0.608,0.816 0.645,0.852 0.67,0.877 0.794,1 1,1");
    this.loadAssets().then(() => {
      this.generetaPrizes();
      this.generateButton();
      this.generateBorder();
      this.generateArrow();
      this.wheelElement?.nativeElement.appendChild(this.wheel?.view);
    });
  }
  
  private loadAssets = async () => {
    //shoud be setted from the outside component
    Assets.addBundle('wheel',{
      border:'assets/images/games/wheel/border.png',
      arrow:'assets/images/games/wheel/wheel-arrow.png',
      button: 'assets/images/games/wheel/button.png',
      buttonDisabled: 'assets/images/games/wheel/button-disabled.png',
    })

    return await Assets.loadBundle('wheel',(loadingPer:number) => {
      //for future progress bar implementation
      console.info(loadingPer*100);
    })
  }

  private handleResize = () => {
    const newWidth = this.wheelElement?.nativeElement.clientWidth;
    this.scaleFactor = newWidth / this.canvasDiameter;
    this.wheel.renderer.resize(newWidth, newWidth);
    this.wheel.stage.scale.set(this.scaleFactor);
  }

  private generetaPrizes(){
    const textContainer = new Container();
    this.rotationalContainer.position.set(this.canvasDiameter/2,this.canvasDiameter/2);
    textContainer.position.set(-this.radius,-this.radius);

    this.prizes.forEach((prize:WheelPrizeType,index:number) => {
      const sector = new Graphics();
      const sectorTotal = this.prizes.length;
      const startingAngle = index / sectorTotal * this.totalAngle;
      const endingAngle = (index+1) / sectorTotal * this.totalAngle; 
      sector.moveTo(0,0);
      sector.beginFill(prize.background);
      sector.arc(0,0,this.radius,startingAngle,endingAngle,false);
      this.wheelContainer.addChild(sector);
      textContainer.addChild(this.generateText(
        startingAngle,
        endingAngle,
        prize?.text,
        prize.color,
        prize?.icon
      ));
      this.rotationalContainer.addChild(this.wheelContainer,textContainer);
    });
    this.wheel?.stage.addChild(this.rotationalContainer)
  }

  private generateText(startAngle:number,endAngle:number,prizeText?:string,prizeColor?:string, prizeIcon?:string){
    const text = new Text(prizeText || prizeIcon, { fill:prizeColor , fontSize: 16, fontWeight:'bold',fontFamily:"system-ui" });
    const midSectorAngle = (startAngle + endAngle) / 2;
    const textX = this.radius * 0.8 * Math.cos(midSectorAngle);
    const textY = this.radius * 0.8 * Math.sin(midSectorAngle);

    text.anchor.set(0.8);
    text.rotation = midSectorAngle;
    text.position.set(this.radius + textX, this.radius + textY);
    
    return text;
  }

  private generateButton(){
    const wheelButtonText = new Text("SPIN",{
      fill:"0x7c4d1b",
      fontSize:30,
      fontWeight:'bold',
      fontFamily:"system-ui"
    })
    wheelButtonText.position.set(this.canvasDiameter/2)
    wheelButtonText.anchor.set(0.5,0.5)
    const shadowFilter = new DropShadowFilter({
      distance: 0,
      blur: 0,
      color: new Color("#000").toNumber(),
    });
    const buttonImage = Assets.get("button");
    const buttonSprite = new Sprite(buttonImage);
    buttonSprite.anchor.set(0.5,0.5);
    buttonSprite.position.set(this.canvasDiameter/2);
    buttonSprite.filters = [shadowFilter]
    this.wheelButton.cursor ='pointer';
    this.wheelButton.addChild(buttonSprite);
    this.wheel?.stage.addChild(this.wheelButton,wheelButtonText);
    this.wheelButton.eventMode = 'static';
  }
  
  private generateArrow(){
    const arrowTexture = Assets.get('arrow');
    const arrowSprite = new Sprite(arrowTexture);
    arrowSprite.anchor.set(0,0.5);
    arrowSprite.x = this.canvasDiameter - 50;
    arrowSprite.y = this.canvasDiameter/2;
    arrowSprite.width = 51;
    arrowSprite.height = 60;
    this.wheel?.stage.addChild(arrowSprite);
  }

  private generateBorder(){
    const arrowButton = Assets.get('border');
    const arrowSprite = new Sprite(arrowButton);
    arrowSprite.anchor.set(0.5);
    arrowSprite.x = this.canvasDiameter/2;
    arrowSprite.y = this.canvasDiameter/2;
    arrowSprite.width = this.canvasDiameter;
    arrowSprite.height = this.canvasDiameter;
    this.wheel?.stage.addChild(arrowSprite);
  }
  
  play = (id:string) => {
    const prizeIndex = this.prizes.findIndex((prize:WheelPrizeType) => prize.id === id);
    if(this.isPlaying) return;
    if(prizeIndex < 0) {
      //shoud be changed for future
      alert(`Couldn't find prize id: ${id}`);
      return
    };
    this.isPlaying = true;
    const wheelSector = this.wheelContainer.getChildAt(prizeIndex);
    const tl = gsap.timeline({
      onComplete: () => {
        this.onComplete(this.prizes[prizeIndex],prizeIndex);
        gsap.timeline({
          yoyo:true,
          repeat:1,
        }).fromTo(wheelSector,{duration:0.7,alpha:1,delay:0.3 },{alpha:0.4})
        this.isPlaying = false;
      }
    });
    this.rotationalContainer.rotation = this.lastMiddleAngle;
    const wheelRotation = this.rotationPrizeAngle(prizeIndex);
    tl.to(this.rotationalContainer,{ duration:8,rotation: wheelRotation, ease:"wheelEase"});
  }

  private rotationPrizeAngle = (index:number) => {
    const totalSpin = Math.PI * 20;
    const startingAngle = index / this.prizes.length * this.totalAngle;
    const endingAngle = (index+1) / this.prizes.length * this.totalAngle;
    const middleAngle = (startingAngle + endingAngle) / 2;
    this.lastMiddleAngle = Math.PI*2 - middleAngle

    return totalSpin - middleAngle;
  }

  public onComplete(prize?:WheelPrizeType, index?:number) {}
} 