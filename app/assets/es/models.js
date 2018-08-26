'use strict';

export class User {
  constructor (email, name, firstname, studentNumber, dayOfBirth, following = 0, followers = 0) {
    this.email = email;
    this.name = name;
    this.firstname = firstname;
    this.studentNumber = studentNumber;
    this.dayOfBirth = dayOfBirth;
    this.following = 0;
    this.followers = 0;
  }
}
