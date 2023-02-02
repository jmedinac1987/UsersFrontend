import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ApiResponse } from '../interfaces/apiResponse';
import { User } from '../interfaces/user';


@Injectable({
  providedIn: 'root'
})

export class UserService {

  private server: string;    
  
  constructor(private _http:HttpClient) {
    this.server = 'http://localhost:3000';
  }

  getUsers(){  	  	
    return this._http.get<ApiResponse<User[]>>(`${this.server}/users`);
  }

  getUser(id: any){  	  	
    return this._http.get<ApiResponse<User[]>>(`${this.server}/${id}`);    
  }

  addUser(user: User)
  {
    return this._http.post(`${this.server}/add`, user);
  }

  putUser(user: User){    
    return this._http.put(`${this.server}/update/${user.id}`, user);
  }

  deleteUser(id: any){
    return this._http.delete(`${this.server}/delete/${id}`);
  }

}
