import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../app/services/users.service';
import { Subscription } from 'rxjs';
import { User } from './interfaces/User';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { FilterService } from 'primeng/api';

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
    Copy: 'Copied to clipboard',
    ErrorCopy: 'Information was not copied to the clipboard',
  };
  public cols?: any[];
  public exportColumns?: any[];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private filterService: FilterService
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  openDialogNewUser() {
    this.usertDialog = true;
    this.submitted = false;
    this.titleDialog = 'Add user';
  }

  hideDialogNewUser() {
    this.usertDialog = false;
    this.submitted = false;
    this.titleDialog = '';
    this.user = {} as User;
  }

  getEventValue($event: any): string {        
    return $event.target.value;
  }  

  messageServiceUser(severity: string, summary: string, message: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: message,
      life: 3000,
    });
  }

  getUsers() {
    this.subscription = this.userService.getUsers().subscribe({
      next: (resp) => (this.users = resp.Response),
      error: (error) => {
        this.messageServiceUser('error', 'Error', this.messages.ErrorGetUsers);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  saveUserButton(user: User) {
    this.submitted = true;

    if (Object.keys(user).length < 6) {
      this.messageServiceUser(
        'warn',
        'Warning',
        this.messages.ErrorRequiredFields
      );
      return;
    }

    if (
      !user.User ||
      !user.Password ||
      !user.Role ||
      !user.App ||
      !user.Environment ||
      !user.Url ||
      user.User.trim() == '' ||
      user.Password.trim() == '' ||
      user.Role.trim() == '' ||
      user.App.trim() == '' ||
      user.Environment.trim() == '' ||
      user.Url.trim() == ''
    ) {
      this.messageServiceUser(
        'warn',
        'Warning',
        this.messages.ErrorRequiredFields
      );
      return;
    }

    if (this.titleDialog.toLowerCase().includes('add')) {
      this.addUser(user);
      return;
    }

    if (this.titleDialog.toLowerCase().includes('edit')) {
      this.updateUser(user);
      return;
    }
  }

  editUserButton(user: User) {
    this.usertDialog = true;
    this.submitted = false;
    this.titleDialog = 'Edit user';
    this.user = { ...user }; //the data is passed but not the object as such so that when editing and canceling it does not alter the original data of the grid
  }

  addUser(user: User) {
    this.subscription = this.userService.addUser(user).subscribe({
      next: (resp) => {
        this.messageServiceUser(
          'success',
          'Successful',
          this.messages.SuccessfulAdd
        );
        this.usertDialog = false;
        this.user = {} as User;
      },
      error: (error) => {
        this.messageServiceUser('error', 'Error', this.messages.ErrorAdd);
        this.usertDialog = false;
        this.user = {} as User;
      },

      complete: () => this.getUsers(),
    });
  }

  updateUser(user: User) {
    this.subscription = this.userService.putUser(user).subscribe({
      next: (resp) => {
        this.messageServiceUser(
          'success',
          'Successful',
          this.messages.SuccessfulEdit
        );
        this.usertDialog = false;
        this.user = {} as User;
      },
      error: (error) => {
        this.messageServiceUser('error', 'Error', this.messages.ErrorEdit);
        this.usertDialog = false;
        this.user = {} as User;
      },
      complete: () => this.getUsers(),
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the user ' + user.User + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.subscription = this.userService.deleteUser(user.id).subscribe({
          next: (resp) =>
            this.messageServiceUser(
              'success',
              'Successful',
              this.messages.SuccessfulDelete
            ),
          error: (error) =>
            this.messageServiceUser(
              'error',
              'Error',
              this.messages.ErrorDelete
            ),
          complete: () => this.getUsers(),
        });
      },
    });
  }

  clipboard(userOrPassword: string) {
    console.log(userOrPassword);
    if (userOrPassword) {
      navigator.clipboard
        .writeText(userOrPassword.trim())
        .then((data) =>
          this.messageServiceUser(
            'info',
            'Information',
            this.messages.Copy
          )
        )
        .catch((error) => {
          this.messageServiceUser(
            'error',
            'Error',
            this.messages.ErrorCopy
          );
        });
    }
  }
}
