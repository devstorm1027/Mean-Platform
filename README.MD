[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/93ce59cb56fe34e4cb7f)


### Clone
* Back-End
```bash
   git clone https://bitbucket.org/khaleel/wain_back-end
```
* Front-End (Optional)
```bash
   cd /wain_back-end
   git clone https://bitbucket.org/khaleel/wain_front-end
```

### Install Dependencies
* [Vagrant](https://www.vagrantup.com/downloads.html)
* [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
* After the instalation of Vagrant and Virtualbox
```bash
   vagrant up
   npm install
```

### Setup Front-End for Development
```bash
   cd /public
   webpack --watch
```
### Run (locally)
```bash
   vagrant ssh
   cd /vagrant
   npm i --no-bin-links
   npm start
```
### Run wain013.com Server
```bash
   forever start -c "npm start" ./
```

### Update wain013.com Server
```bash
   cd /usr/share/nginx/wain_back-end/admin/public
   git pull
   forever list
   kill [pid]
```

TO DO:
    - Edit jwt to use key pair.
    - When removing non-existing item from embedded array no err is thrown.
    - Secure admin CRUD.
    - Make sure user can not change its status manually.
    - Implement the security checks.
