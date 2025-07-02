import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit {

   target:string="HI";
  
    ngOnInit() {
    console.log("Init  AccueilComponent");
  }



  click(){
    console.log("Into ConvertToXML");
    this.target="PUSHED !";
  }

}
