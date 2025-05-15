export interface IUserDTO {
  id?: string | number; // ID-ul poate să nu fie întotdeauna prezent/necesar la request
  username: string;
  password?: string; // Parola este opțională în răspunsuri, dar necesară la request
  email?: string;
  phoneNumber?: string;
}