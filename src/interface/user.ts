export interface CreateUser {
  name: string;
  email: string;
  img: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  token_type: string;
  token: string;
}

export interface UserData {
  _id: string;
  email: string;
  name: string;
  img: string;
  rol: string;
  create_at: Date;
  update_at: Date;
}