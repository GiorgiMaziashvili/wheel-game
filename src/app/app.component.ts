import { Component, OnInit } from '@angular/core';
import { WheelComponent } from 'src/games/wheel/wheel.component';
import { WheelPrizeType } from 'src/games/wheel/wheel.interface';

type activePrizesType = {
  active?: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent extends WheelComponent implements OnInit{
  activePrizes:activePrizesType[] = [];
  override prizes:WheelPrizeType[] = [
    {
      text:"",
      id: "freespin_1",
      color:"#b09f16",
      background:"#ffec51",
      icon:"👽👽👽",
    },
    {
      text:"2 Freespins",
      id: "freespin_2",
      color:"#ba8814",
      background:"#ffc133",
      icon:"",
    },
    {
      text:"",
      id: "freespin_3",
      color:"#a15d15",
      background:"#ff982a",
      icon:"🤗🤗🤗",
    },
    {
      text:"4 Freespins",
      id: "freespin_4",
      color:"#922a12",
      background:"#ff5730",
      icon:"",
    },
    {
      text:"",
      id: "freespin_5",
      color:"#046a60",
      background:"#009688",
      icon:"😇😇😇",
    },
    {
      text:"6 Freespins",
      id: "freespin_6",
      color:"#157f2e",
      background:"#39af55",
      icon:"",
    },
    {
      text:"",
      id: "freespin_7",
      color:"#4a801e",
      background:"#86c454",
      icon:"🤖🤖🤖",
    },
    {
      text:"8 Freespins",
      id: "freespin_8",
      color:"#96a422",
      background:"#cddc4c",
      icon:"",
    },
  ]
  handleSpin() {
    const index = Math.floor(Math.random() * this.prizes.length);
    this.play(this.prizes[index].id);
  }
  ngOnInit(): void {
    this.wheelButton.on('click',this.handleSpin);
    this.wheelButton.on('touchstart',this.handleSpin);
  }

  override onComplete(prize: WheelPrizeType,prizeIndex:number): void {
    if(prizeIndex >= 0) this.activePrizes[prizeIndex] = { active: true };
  }
}
