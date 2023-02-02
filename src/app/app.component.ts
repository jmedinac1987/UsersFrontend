import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../app/services/users.service';
import { Subscription } from 'rxjs';
import { User } from './interfaces/user';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class AppComponent implements OnInit, OnDestroy {
  public subscription?: Subscription;
  public titleDialog: string = '';
  public users: User[] = [];  
  public user: User = {} as User;
  public loading: boolean = true;
  public search?: string;
  public usertDialog: boolean = false;
  public submitted: boolean = false;
  public messages = {
    SuccessfulAdd: 'User inserted successfully! 😎',
    SuccessfulEdit: 'User was updated successfully! 😎',
    SuccessfulDelete: 'User was deleted successfully! 😎',
    ErrorGetUsers: 'An error has occurred obtaining the information 🥺',
    ErrorAdd: 'An error has occurred during the user insertion process 🥺',
    ErrorRequiredFields: 'Required fields without filling out',
    ErrorEdit: 'An error occurred during the update process 🥺',
    ErrorDelete: 'An error occurred during the deletion process 🥺',
  };

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  openNew() {
    this.usertDialog = true;
    this.submitted = false;
    this.titleDialog = 'Add user';
  }

  hideDialog() {
    this.usertDialog = false;
    this.submitted = false;
    this.titleDialog = '';
    this.user = {} as User;    
  }

  getEventValue($event: any): string {
    return $event.target.value;
  }

  messageServiceWarning(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: 3000,
    });
  }

  messageServiceError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  }

  messageServiceSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: message,
      life: 3000,
    });
  }

  getUsers() {
    this.subscription = this.userService.getUsers().subscribe({
      next: (resp) => this.users = resp.Response,
      error: (error) => {
        this.messageServiceError(this.messages.ErrorGetUsers);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  saveUser(user: User) {
    this.submitted = true;

    if (Object.keys(user).length < 6) {
      this.messageServiceWarning(this.messages.ErrorRequiredFields);
      return;
    }

    if (!user.User || !user.Password || !user.Role || !user.App ||
      !user.Environment || !user.Url) 
    {
      this.messageServiceWarning(this.messages.ErrorRequiredFields);
      return;
    }

    if (this.titleDialog.toLowerCase().includes('add')) {
      this.subscription = this.userService.addUser(user).subscribe({
        next: (resp) => {
          this.messageServiceSuccess(this.messages.SuccessfulAdd);
          this.usertDialog = false;
          this.user = {} as User;
        },
        error: (error) => {
          this.messageServiceError(this.messages.ErrorAdd);
          this.usertDialog = false;
          this.user = {} as User;
        },

        complete: () => this.getUsers(),
      });

      return;
    } else {
      this.subscription = this.userService.putUser(user).subscribe({
        next: (resp) => {
          this.messageServiceSuccess(this.messages.SuccessfulEdit);
          this.usertDialog = false;
          this.user = {} as User;
        },
        error: (error) => {
          this.messageServiceError(this.messages.ErrorEdit);
          this.usertDialog = false;
          this.user = {} as User;
        },
        complete: () => this.getUsers(),
      });

      return;
    }
  }

  editUser(user: User) {
    this.usertDialog = true;
    this.submitted = false;
    this.titleDialog = 'Edit user';
    this.user = {...user};//the data is passed but not the object as such so that when editing and canceling it does not alter the original data of the grid
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the user ' + user.User + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.subscription = this.userService.deleteUser(user.id).subscribe({
          next: (resp) =>
            this.messageServiceSuccess(this.messages.SuccessfulDelete),
          error: (error) => this.messageServiceError(this.messages.ErrorDelete),
          complete: () => this.getUsers(),
        });
      },
    });
  }
}
