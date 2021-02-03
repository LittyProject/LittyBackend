
# Eventy

Lista eventów

## User

### userStatusUpdate

#### Request data
```json
 {
    "status": 5,
    "customStatus": "Visual Studio Code"
 }
```


#### Response data
```json
{
  "id": "id_użytkownika",
  "status": 5,
  "customStatus": "Visual Studio Code"
}
```





### userUpdate

### Request
```
[POST] /user/@me/settings

{
  ...
}
```


#### Response data
```json
{
  "id": "id_użytkownika",
  "username": "name",
  "tag": "tag",
  "avatarURL": "link do cdn"
}
```
