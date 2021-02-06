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

## Authorization header (Bearer Authorization)
https://swagger.io/docs/specification/authentication/bearer-authentication/

## API

| Method \| Path | Required Auth | Example body | Ratelimit (req/time) | Permission |
|:-:|:-:|:-:|:-:|:-:|
| - | - | Auth | - | - |
| POST \| `/auth/login` | no | `{"username": string, "password": string}` |  | 0 |
| POST \| `/auth/register` | no | `{"username": string, "password": string, "confirmPassword": string, "email": string, "hcaptcha": string}` |  | 0 |
| - | - | Users | - | - |
| GET \| `/users/:id` | yes |  | 100/20s | 0 |
| PUT \| `/users/:id/edit` | yes | `{"username": string, "password": string, "tag": string, "email": string}` | 5/10m | 0 |
| POST \| `/users/:id/badges` | yes | `{"badges": [{"text": string, "icon": string, "url": string}, ...]}` | 50/1m | 3 |
| - | - | Servers | - | - |
| GET \| `/servers/:id` | yes |  | 100/20s | 0 |
| GET \| `/servers/:id/channels` | yes |  | 100/20s | 0 |
| GET \| `/servers/:id/channels/:channel` | yes |  | 100/20s | 0 |
| POST \| `/servers` | yes | `{"name": string}` | 5/3m | 0 |
| POST \| `/servers/:id/join` | yes | `{}` | 30/3m | 0 |
| DELETE \| `/servers/:id/leave` | yes |  | 30/3m | 0 |
| - | - | Invite | - | - |
| GET \| `/invite/:code` | yes |  | 100/20s | 0 |

## User Status List
| ID | Real Status Name |
|:-:|:-:|
| 1 | Offline |
| 2 | Online |
| 3 | Idle |
| 4 | Dnd |
| 5 | Coding |
| 6 | Reading |
| 7 | Learning |
| 8 | Shopping |
| 9 | Hacking |
| 10 | Singing |
| 11 | Playing |
| 12 | Watching |
| 13 | Listening |
| 14 | Competing |
| 15 | Exercising |
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/)
