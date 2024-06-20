import { Component, effect, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { CategoryComponent } from './category/category.component';
import { AvatarComponent } from './avatar/avatar.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuItem } from 'primeng/api';
import { ToastService } from '../toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/model/user.model';
import { ActivatedRoute } from '@angular/router';
import { PropertiesCreateComponent } from '../../landlord/properties-create/properties-create.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule,
            FontAwesomeModule,
            ToolbarModule,
            MenuModule,
            CategoryComponent,
            AvatarComponent
  ],
  providers:[DialogService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  
  login = () => this.authService.login();

  logout = () => this.authService.logout();

  location = "Anywhere";
  guests = "Add guests";
  dates = "Any week";

  toastService : ToastService= inject(ToastService);
  authService : AuthService= inject(AuthService);
  dialogService = inject(DialogService);
  activatedRoute = inject(ActivatedRoute);
  ref: DynamicDialogRef | undefined

  currentMenuItems: MenuItem[] | undefined = [];
  connectedUser: User = {email: this.authService.notConnected};

  constructor(){
    effect(() => {
      if (this.authService.fetchUser().status === "OK") {
        this.connectedUser = this.authService.fetchUser().value!;
        this.currentMenuItems = this.fetchMenu();
      }
    });
  }
  ngOnInit(): void {
    this.authService.fetch(false); 
  }
  private fetchMenu(){
    if(this.authService.isAuthenticated()){
      return [
        {
          label: "My properties",
          routerLink: "landlord/properties",
          visible: this.hasToBeLandlord(),
        },
        {
          label: "My booking",
          routerLink: "booking",
        },
        {
          label: "My reservation",
          routerLink: "landlord/reservation",
          visible: this.hasToBeLandlord(),
        },
        {
          label: "Log out",
          command: this.logout
        },
      ]
    }else{
      return [
      {
        label: "Sign up",
        styleClass: "font-bold",
        command:this.login
      },
      {
        label: "Log in",
        command:this.login

      }
    ]
    }
    
  }
  hasToBeLandlord():boolean {
    return this.authService.hasAnyAuthority("ROLE_LANDLORD");

  }

  openNewListing(): void {
    this.ref = this.dialogService.open(PropertiesCreateComponent,
      {
        width: "60%",
        header: "Airbnb your home",
        closable: true,
        focusOnShow: true,
        modal: true,
        showHeader: true
      })
  }

}
