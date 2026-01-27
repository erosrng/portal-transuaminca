import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  anioActual: number=0;
  ngOnInit() {
    this.anioActual = new Date().getFullYear();
  }
}
