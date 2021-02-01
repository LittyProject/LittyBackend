# Litty

Litty is as open source web chat app written in TypeScript.

## Requirements

* RethinkDB database
* Node.js v12+
* TypeScript installed

## Installation

Use [npm](https://npmjs.com/) or [yarn](https://yarnpkg.com/en/docs/install/) to install modules to run Litty.

### npm
```bash
npm i
```

### yarn
```bash
yarn
```

## How to run

Before run, you **must** create .env file in main directory, and complete it by editing this example:

```
PORT=1920

DB_HOST="IP"
DB_USER="USER"
DB_DATABASE="DATABASE"
DB_PASSWORD="PASSWORD"

HCAPTCHA_SECRET="SECRET"

appURL="URL"
cdnURL="URL"
```

### npm
```bash
npm run start
```

### yarn
```bash
yarn run start
```

## API

| Method \| Path | Required Auth | Example body | Ratelimit (req/time) |
|:-:|:-:|:-:|:-:|
| POST \| `/auth/login` | no | `{"username": string, "password": string}` |  |
| POST \| `/auth/register` | no | `{"username": string, "password": string, "confirmPassword": string, "email": string, "hcaptcha": string}` |  |
| GET \| `/users/:id` | yes |  | 100/20s |
| PUT \| `/users/:id/edit` | yes | `{"username": string, "password": string, "tag": string, "email": string}` | 5/10m |
| GET \| `/servers/:id` | yes |  | 100/20s | 
| POST \| `/servers` | yes | `{"name": string}` | 5/3m |
| POST \| `/servers/:id/join` | yes | `{}` | 30/3m |
| DELETE \| `/servers/:id/leave` | yes |  | 30/3m |

## User Status List
ID - Real Name
0 - Offline
1 - Online
2 - Idle
3 - Dnd
4 - Coding
5 - Reading
6 - Learning
7 - Shoping
8 - Hacking
9 - Singing
10 - Playing
11 - Watching
12 - Listening
13 - Competing
14 - Exercising

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/)
