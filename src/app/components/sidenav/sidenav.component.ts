import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { navbarData } from './nav-data';
import { navbarDataVendedor } from './nav-data-vendedor';

interface SideNavToggle{
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit{
  
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;  
  screenWidth = 0;
  navDataAdmin = navbarData;
  navDataVendedor = navbarDataVendedor;
  navData: any;
  active  = "active";
  indice = 0;
  activeItemDefault = true;
  onlyRoleAdmin: boolean = false;

  constructor(){
    this.onlyRoleAdmin = localStorage.getItem('Rol') === 'Administrador'? true : false;
    if(this.onlyRoleAdmin){
      this.navData = this.navDataAdmin;
    }else{
      this.navData = this.navDataVendedor;
    }
  }

  ngOnInit(): void{    
    this.screenWidth = window.innerWidth; 
    console.log(this.screenWidth);    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any){
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768){
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }

  toggleCollapse(): void{
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  closeSidenav(): void{
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  onClick(idx: number){
    this.indice = idx;
    this.active = "active";
    this.activeItemDefault = false;
  }
}