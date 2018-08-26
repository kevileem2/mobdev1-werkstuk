'use strict';

//  import user and firebase
import { User } from './models';
import firebase from 'firebase';

class App {
  //  Initialize the app with the firebase connection
  constructor () {
    this.dbConfig = {
      apiKey: 'AIzaSyCIiUvrS0Pk8-przW0cGswoOC0K3nAPbXk',
      authDomain: 'mobdev1-aa6fd.firebaseapp.com',
      databaseURL: 'https://mobdev1-aa6fd.firebaseio.com',
      projectId: 'mobdev1-aa6fd',
      storageBucket: 'mobdev1-aa6fd.appspot.com',
      messagingSenderId: '789886567615'
    };
    //  Use firebase database and authentication
    firebase.initializeApp(this.dbConfig);
    this.database = firebase.database();
    this.auth = firebase.auth();
  }
  //  The full initialization of the app
  init () {
    //  global variable for the pathname of the url
    const pathname = window.location.pathname;

    //  watch if the user is logged in or not
    this.auth.onAuthStateChanged(firebaseUser => {
      //  user is logged in
      if (firebaseUser) {
        console.log(firebaseUser);
      } else {
        console.log('Not logged in.');
      }
    });

    //  routing for the app
    if (pathname === '/' || pathname === '/index.html') {
      this.indexContent();
    }
    if (pathname === '/projects.html') {
      this.projectsContent();
    }
    if (pathname === '/blog.html') {
      this.postsContent();
    }
    if (pathname === '/profile.html') {
      this.profileContent();
    }
    if (pathname === '/login.html') {
      this.loginContent();
    }
    if (pathname === '/register.html') {
      this.registerContent();
    }
    if (pathname === '/contact.html') {
      this.contactContent();
    }
    if (pathname === '/post.html') {
      this.postDetailPage();
    }
    if (pathname === '/list.html') {
      this.listContent();
    }
  }

  indexContent () {
    this.loadPost(3, 4);
    this.loadProject(-1, 6);
  }

  listContent () {
    const searchEl = document.querySelector('.searchedUser');
    const followerBtnEl = document.querySelector('.followerBtn');
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('user')) {
      const uid = urlParams.get('user');
      this.getUserNameById(uid, (user) => {
        searchEl.innerHTML =
        `
        <h3>
        <span class="name">${user.firstname} ${user.name}</span>
        </h3>
        <h4>Email:</h4>
        <p><span class="email">${user.email}</span></p>
        <h4>Studenten nummer:</h4>
        <p><span class="studentnumber">${user.studentNumber}</span></p>
        <h4>Geboortedatum:</h4>
        <p><span class="birthday">${user.dayOfBirth}</span></p>
        `;
        followerBtnEl.innerHTML =
        `
        <a class="lg-btn _${uid}"><span>Start met het volgen van: ${user.firstname} ${user.name}</span></a> 
        `;
        const name = user.firstname + ' ' + user.name;
        const followPersonEl = document.querySelector(`._${uid}`);
        followerBtnEl.addEventListener('click', (ev) => {
          this.followById(uid, name, followPersonEl);
        });
      });
    }
  }

  /*
  The full rendering of the profile page
  */
  profileContent () {
    const firstname = document.querySelector('.firstname');
    const surname = document.querySelector('.lastname');
    const following = document.querySelector('.following-amount');
    const followers = document.querySelector('.followers-amount');
    const logOutBtn = document.querySelector('.logOutBtn');
    logOutBtn.addEventListener('click', (ev) => {
      console.log('lol');
      this.auth.signOut();
      window.location.pathname = '/login.html';
    });
    this.auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        let query = this.database.ref(`/users/${firebaseUser.uid}`);
        query.on('value', (snap) => {
          const user = snap.val();
          const userfn = user.firstname;
          const usern = user.name;
          const userFollowing = user.following;
          const userFollowers = user.followers;
          firstname.innerHTML = userfn;
          surname.innerHTML = usern;
          following.innerHTML = userFollowing;
          followers.innerHTML = userFollowers;
        });
      }
    });
  }

  /*
  The full rendering of the login page
  */
  loginContent () {
    const loginButton = document.querySelector('.loginBtn');
    loginButton.addEventListener('click', (ev) => {
      let email = document.querySelector('#loginEmail').value;
      let password = document.querySelector('#loginPassword').value;
      this.auth.signInWithEmailAndPassword(email, password).catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      })
        .then(user => {
          if (user) {
            window.location.pathname = '/index.html';
          }
        });
    });
  }

  /*
  The full rendering of the register page
  */
  registerContent () {
    const errorArray = {
      'onlyLetters': 'Name must contain only letters.',
      'notValidEmail': 'Not a valid email.',
      'emailError': 'You must use an email from the Artevelde University.',
      'onlyNumbers': 'Student Number must only contain numbers.',
      'studentNumberFixedLength': 'Student Number must contain 5 numbers',
      'DayOfBirth': 'Day of birth must be in DD/MM/YYYY format. Example: 10/10/1997',
      'passwordNotLongEnough': 'Password must contain more than 6 characters.',
      'passwordNotTheSame': 'The 2 passwords you filled in, do not match.'
    };
    const registerBtn = document.querySelector('#registerBtn');
    const surNameEl = document.querySelector('#surname');
    const firstNameEl = document.querySelector('#firstname');
    const emailEl = document.querySelector('#email');
    const studentNumberEl = document.querySelector('#studentnr');
    const dayOfBirthEl = document.querySelector('#dayofbirth');
    const passwordEl = document.querySelector('#password');
    const passwordRepeatEl = document.querySelector('#password-repeat');
    let readyForSubmit = true;
    registerBtn.addEventListener('click', (ev) => {
      if (!(/^[a-zA-Z]+/.test(surNameEl.value))) {
        document.querySelector('#error__surname').innerHTML = errorArray['onlyLetters'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__surname').innerHTML = null;
      }
      if (!(/^[a-zA-Z]+$/.test(firstNameEl.value))) {
        document.querySelector('#error__firstname').innerHTML = errorArray['onlyLetters'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__firstname').innerHTML = null;
      }
      if (!(/^.+@.+$/.test(emailEl.value))) {
        document.querySelector('#error__email').innerHTML = errorArray['notValidEmail'];
        readyForSubmit = false;
      } else if (!(/^.+@student\.arteveldehs\.be$/.test(emailEl.value))) {
        document.querySelector('#error__email').innerHTML = errorArray['emailError'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__email').innerHTML = null;
      }
      if (!(/^[0-9]+$/.test(studentNumberEl.value))) {
        document.querySelector('#error__studentnr').innerHTML = errorArray['onlyNumbers'];
        readyForSubmit = false;
      } else if (studentNumberEl.value.length !== 5) {
        document.querySelector('#error__studentnr').innerHTML = errorArray['studentNumberFixedLength'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__studentnr').innerHTML = null;
      }
      if (!(/^[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]$/.test(dayOfBirthEl.value))) {
        document.querySelector('#error__dayofbirth').innerHTML = errorArray['DayOfBirth'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__dayofbirth').innerHTML = null;
      }
      if (passwordEl.value.length < 6) {
        document.querySelector('#error__password').innerHTML = errorArray['passwordNotLongEnough'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__password').innerHTML = null;
      }
      if (passwordEl.value !== passwordRepeatEl.value) {
        document.querySelector('#error__password-repeat').innerHTML = errorArray['passwordNotTheSame'];
        readyForSubmit = false;
      } else {
        document.querySelector('#error__password-repeat').innerHTML = null;
      }
      if (readyForSubmit === true) {
        const email = emailEl.value;
        const password = passwordEl.value;
        this.auth.createUserWithEmailAndPassword(email, password).catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage);
          console.log(errorCode);
        })
          .then(user => {
            if (user) {
              const email = user.user.email;
              const uid = user.user.uid;
              const firstName = firstNameEl.value;
              const name = surNameEl.value;
              const studentNumber = studentNumberEl.value;
              const dayOfBirth = dayOfBirthEl.value;
              let newUser = new User(email, name, firstName, studentNumber, dayOfBirth);
              this.database.ref('users/' + uid).set(newUser);
              window.location.pathname = '/index.html';
            }
          });
      };
    });
  }

  /*
  The rendering of a blog post or a project
  */
  postDetailPage () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('type') && urlParams.has('id')) {
      const type = urlParams.get('type');
      const id = urlParams.get('id');
      if (type === 'posts') {
        this.loadFullPost(id);
      }
      if (type === 'projects') {
        this.loadFullProject(id);
      }
    }
  }
  /*
  load in the projects from the firebase database with parameters:
  {numprojects} which is the amount of projects want to be shown, -1 is all of the projects
  {col} for the amount of space you want the projects to hold
  */
  loadProject (numprojects = -1, col = 6) {
    let query = this.database.ref('/projects');
    if (numprojects > 0) {
      query = this.database.ref('/projects').limitToFirst(numprojects);
    }
    this.renderProject(query, 'child_added', col);
  }
  /*
  load in the posts from the firebase database with parameters:
  {numposts} which is the amount of posts want to be shown, -1 is all of the posts
  {col} for the amount of space you want the posts to hold
  */
  loadPost (numPosts = -1, col = 6) {
    let query = this.database.ref('/posts');
    if (numPosts > 0) {
      query = this.database.ref('/posts').limitToFirst(numPosts);
    }
    this.renderPost(query, 'child_added', col);
  }
  /*
  loading a full project from the firebase database with a paremeter:
  {id} for the id of the project that needs to be rendered
  */
  loadFullProject (id) {
    const titleEl = document.getElementById('post-title');
    const numberOfLikesEl = document.getElementById('likes-count');
    const numberOfCommentsEl = document.getElementById('comments-count');
    const contentEl = document.querySelector('.post-content');
    const authorsEl = document.querySelector('.authors');
    const messageEl = document.querySelector('.message-update');
    const likeEl = document.querySelector('.like');
    this.database.ref(`/projects/` + id).once('value', (snap) => {
      if (snap.val()) {
        const project = snap.val();
        const title = project.title;
        const description = project.description;
        const authors = project.author;
        const likes = project.likesCount;
        const comments = project.commentsCount;
        titleEl.innerText = title;
        contentEl.innerHTML = description;
        const images = project.images;
        for (let image in images) {
          this.database.ref(`projects/${id}/images/${image}`).once('value', (snapshot) => {
            const source = snapshot.val();
            let imageHTML = `
            <img class="project-image" src="assets/images/projects/${id}/${source}">
            `;
            contentEl.insertAdjacentHTML('beforeend', imageHTML);
          });
        }
        numberOfLikesEl.innerHTML = likes;
        numberOfCommentsEl.innerHTML = comments;
        this.getUserNameById(authors.authorId, (user) => {
          const authorHTML =
          `
          <a class="contact-link" href="/list.html?user=${authors.authorId}">
            <i class="fas fa-user primary"></i>
            <div class="contact-text">
              <span class="contact-info" id="author">${user.firstname} ${user.name}</span>
              <span class="contact-description" id="author">Autheur</span>
            </div>
            <i class="fas fa-angle-right primary"></i>
          </a>
          `;
          authorsEl.insertAdjacentHTML('beforeend', authorHTML);
        });
        this.database.ref(`/projects/${id}/likesCount`).on('value', (snap) => {
          numberOfLikesEl.innerText = snap.val();
        });

        this.database.ref(`/projects/${id}/commentsCount`).on('value', (snap) => {
          numberOfCommentsEl.innerText = snap.val();
        });
        this.auth.onAuthStateChanged(user => {
          if (user) {
            const uid = user.uid;
            this.database.ref(`projects/${id}/likes/${uid}`).once('value').then(snap => {
              if (snap.val()) {
                messageEl.innerText = 'Je hebt dit geliked';
              }
            });
            likeEl.addEventListener('click', (ev) => {
              this.updateLikesById('projects', id, messageEl);
            });
          } else {
            likeEl.addEventListener('click', (ev) => {
              messageEl.innerText = 'Log in om te liken';
            });
          }
        });
      }
    });
  }

  /*
  loading a full blog post from the firebase database with a paremeter:
  {id} for the id of the blogpost that needs to be rendered
  */
  loadFullPost (id) {
    const titleEl = document.getElementById('post-title');
    const numberOfLikesEl = document.getElementById('likes-count');
    const numberOfCommentsEl = document.getElementById('comments-count');
    const contentEl = document.querySelector('.post-content');
    const authorsEl = document.querySelector('.authors');
    const messageEl = document.querySelector('.message-update');
    const likeEl = document.querySelector('.like');
    this.database.ref(`/posts/` + id).once('value', (snap) => {
      if (snap.val()) {
        const post = snap.val();
        const title = post.title;
        const description = post.description;
        const likes = post.likesCount;
        const comments = post.commentsCount;
        const author = post.author;
        titleEl.innerText = title;
        contentEl.innerHTML = description;
        numberOfLikesEl.innerHTML = likes;
        numberOfCommentsEl.innerHTML = comments;
        this.getUserNameById(author.authorId, (user) => {
          const authorHTML =
          `
          <a class="contact-link" href="/list.html?user=${author.authorId}">
            <i class="fas fa-user userIcon"></i>
            <span class="contact-info" id="author">${user.firstname} ${user.name}</span>
            <i class="fas fa-angle-right"></i>
          </a>
          `;
          authorsEl.insertAdjacentHTML('beforeend', authorHTML);
        });
        this.database.ref(`/posts/${id}/likesCount`).on('value', (snap) => {
          numberOfLikesEl.innerText = snap.val();
        });

        this.database.ref(`/posts/${id}/commentsCount`).on('value', (snap) => {
          numberOfCommentsEl.innerText = snap.val();
        });
        this.auth.onAuthStateChanged(user => {
          if (user) {
            const uid = user.uid;
            this.database.ref(`posts/${id}/likes/${uid}`).once('value').then(snap => {
              if (snap.val()) {
                messageEl.innerText = 'Je hebt dit geliked';
              }
            });
            likeEl.addEventListener('click', (ev) => {
              this.updateLikesById('posts', id, messageEl);
            });
          } else {
            likeEl.addEventListener('click', (ev) => {
              messageEl.innerText = 'Log in om te liken';
            });
          }
        });
      }
    });
  }
  /*
  rendering the projects seperatly from the firebase database with parameters
  query - is the database query that holds all the projects
  type - what type of info we want to get from the database
  col - how much space every project will hold on the DOM
  */
  renderProject (query, type, col = 6) {
    const projectsContainer = document.querySelector('.projects-container');
    query.on(type, (snap) => {
      const project = snap.val();
      const id = snap.key;
      const title = project.title;
      const image1 = `assets/images/projects/${id}/${project.images.image1}`;
      const likesCount = project.likesCount;
      const commentsCount = project.commentsCount;
      let text =
      `
      <div class="fb-grid__col-${col} fb-grid__col-sm-12">
        <a href="/post.html?type=projects&id=${id}">
          <div class="project-preview">
            <h3>${title}</h3>
            <div class="image-preview">
              <div class="image" style="background-image:url('${image1}');"></div>
            </div>
            <div class="project-footer">
              <ul class="counters">
                <li><i class="fas fa-heart heart"></i><span class="counter-number">${likesCount}</span></li>
                <li><i class="fas fa-comment comment"></i><span class="counter-number">${commentsCount}</span></li>
              </ul>
            </div>
          </div>
        </a>
      </div>
      `;
      projectsContainer.insertAdjacentHTML('beforeend', text);
    });
  }
  /*
  rendering the posts seperatly from the firebase database with parameters
  query - is the database query that holds all the posts
  type - what type of info we want to get from the database
  col - how much space every post will hold on the DOM
  */
  renderPost (query, type, col = 6) {
    const postContainer = document.querySelector('.posts-container');
    query.on(type, (snap) => {
      const post = snap.val();
      const id = snap.key;
      const title = post.title;
      const description = post.description;
      const likesCount = post.likesCount;
      const commentsCount = post.commentsCount;
      const publishDate = post.id;
      let text =
      `
      <div class="fb-grid__col-${col} fb-grid__col-sm-12">
        <a href="/post.html?type=posts&id=${id}">
          <div class="blog-preview">
            <span class="date">${publishDate}</span>
            <h3>${title}</h3>
            <p class="description">${description}</p>
            <ul class="counters">
              <li><i class="fas fa-heart heart"></i><span class="counter-number">${likesCount}</span></li>
              <li><i class="fas fa-comment comment"></i><span class="counter-number">${commentsCount}</span></li>
            </ul>
          </div>
        </a>
      </div>
      `;
      postContainer.innerHTML += text;
    });
  }

  projectsContent () {
    this.loadProject(-1, 6);
  }

  postsContent () {
    this.loadPost(-1, 4);
  }
  /*
  Holds all the information for the contact page
  */
  contactContent () {
    const title = document.querySelector('.title__contact');
    const adress = document.querySelector('.adress');
    const query = this.database.ref('/contact');
    query.on('value', (snap) => {
      let contact = snap.val();
      title.innerHTML = contact.title;
      let pNodeCampus = document.createElement('p');
      pNodeCampus.innerHTML = contact.campus;
      let pNodeAdress = document.createElement('p');
      pNodeAdress.innerHTML = contact.adress;
      let pNodeTel = document.createElement('p');
      pNodeTel.innerHTML = contact.tel;
      adress.appendChild(pNodeCampus);
      adress.appendChild(pNodeAdress);
      adress.appendChild(pNodeTel);
    });
  }
  /*
  get the user from the database by using the id
  */
  getUserNameById (id, firstname) {
    this.database.ref('/users/' + id).once('value', (snap) => {
      firstname(snap.val());
    });
  }
  /*
  follow a user by the id
  */
  followById (id, name, el) {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        const currentUid = user.uid;
        let updates = {};
        updates[`/followers/${id}/${currentUid}`] = true;
        updates[`/following/${currentUid}/${id}`] = true;
        this.database.ref().update(updates);
        el.innerText = `Je volgt ${name}`;
        return true;
      } else {
        el.innerText = `Je moet je aanmelden om ${name} te volgen`;
        return false;
      }
    });
  }
  /*
  update the likes from a post or project by the id
  */
  updateLikesById (type, id, el) {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      const uid = currentUser.uid;
      this.database.ref(`${type}/`).child(`${id}`).transaction(post => {
        if (post) {
          if (post.likes && post.likes[uid]) {
            post.likesCount--;
            post.likes[uid] = null;
            el.innerText = '';
          } else {
            post.likesCount++;
            if (!post.likes) {
              post.likes = {};
            }
            post.likes[uid] = true;
            el.innerText = 'Je hebt dit geliked';
          }
        }
        return post;
      });
    } else {
      console.log('Log in to like posts');
    }
  }
  /*
  all the functionality for the nav bar
  */
  nav () {
    let navClicks = 1;
    const hamburger = document.querySelector('.hamburger img');
    const cross = document.querySelector('.cross');
    const pageContent = document.querySelector('#container');
    const nav = document.querySelector('#navigation');
    hamburger.addEventListener('click', ev => {
      navClicks++;
      if (navClicks % 2 === 0) {
        nav.style.display = 'block';
        pageContent.style.display = 'none';
      } else {
        nav.style.display = 'none';
        pageContent.style.display = 'block';
      }
    });
    cross.addEventListener('click', ev => {
      navClicks++;
      if (navClicks % 2 === 0) {
        nav.style.display = 'block';
        pageContent.style.display = 'none';
      } else {
        nav.style.display = 'none';
        pageContent.style.display = 'block';
      }
    });
  }
  /*
  Does what the profile button should go to according to you authenticated state
  */
  profileBtn () {
    const profileButton = document.querySelector('.profile-btn');
    const profileButtonNav = document.querySelector('.profileBtnNav');
    this.auth.onAuthStateChanged(user => {
      if (user) {
        const pathname = window.location.href.split('/');
        pathname[pathname.length - 1] = 'profile.html';
        let url = '';
        for (let i = 0; i < pathname.length; i++) {
          if (i === pathname.length - 1) {
            url += pathname[i];
          } else {
            url += pathname[i] + '/';
          }
        }
        profileButton.setAttribute('href', url);
        profileButtonNav.setAttribute('href', url);
      } else {
        const pathname = window.location.href.split('/');
        pathname[pathname.length - 1] = 'login.html';
        let url = '';
        for (let i = 0; i < pathname.length; i++) {
          if (i === pathname.length - 1) {
            url += pathname[i];
          } else {
            url += pathname[i] + '/';
          }
        }
        profileButton.setAttribute('href', url);
        profileButtonNav.setAttribute('href', url);
      }
    });
  }
}

window.addEventListener('load', (ev) => {
  const app = new App();
  app.init();
  app.nav();
  app.profileBtn();
});
