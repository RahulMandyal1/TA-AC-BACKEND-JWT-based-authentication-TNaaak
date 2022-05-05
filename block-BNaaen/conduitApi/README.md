Coduit app all Endpoints
1)Authentication  : 
POST /api/v1/users/login

example request body 
{
    "email" : "iamrahul079@gmail.com",
    "password" : "Vishal@$079",
}

No authentication required , returns a User .
Required Fields are  : email , password 


2)Registration  : 
POST /api/v1/users/register

exmaple of request  body
{
    "name" : "Rahul",
    "username" :"Rahul Mandyal",
    "email" : "iamrahul079@gmail.com",
    "password" : "Vishal@$079",
    "bio" : " Hey this is Rahul thakur  and i am a web developer ",
    "avatar" : "thisdssdfhsdkfhd"
}
No authentication required , returns a User .
Required Fields are   : name , email , password , bio , avatar

3) Get a curret user 

GET /api/v1/user
Authentication required returns a current logged in user 

4) update current logged in user 

PUT /api/v1/user

example request body
{
    "name" : "Rahul",
    "username" :"Rahul Mandyal",
    "email" : "iamrahul079@gmail.com",
    "password" : "Vishal@$079",
    "bio" : " Hey this is Rahul thakur  and i am a web developer ",
    "avatar" : "thisdssdfhsdkfhd"
}

Authentication required returns a updated user 
Accepted fields: name,email,username,password, avatar,bio

5)Get Profile
GET /api/profiles/:username

Authentication optional, returns a Profile


6)Follow user
POST /api/profiles/:username/follow

Authentication required, returns a Profile

No additional parameters required

7)Unfollow user
DELETE /api/profiles/:username/follow

Authentication required, returns a Profile

No additional parameters required