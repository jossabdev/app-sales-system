import { Component } from '@angular/core';
import { Router } from '@angular/router';
interface SideNavToggle{
  screenWidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-private-content',
  templateUrl: './private-content.component.html',
  styleUrls: ['./private-content.component.scss']
})
export class PrivateContentComponent {
  isSideNavCollapsed = false;
  screenWidth = 0;

  constructor(router: Router){
    if(!localStorage.getItem('Authorization')){      
        router.navigateByUrl('/login');      
    }
  }

  onToggleSideNav(data: SideNavToggle): void{
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
