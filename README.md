# Evenet-Management

# API Deatils

1.   /register    
      => Post API
      => To register new user and store details in DB
      => Input format in postman  :   {
                                        "name" : "Radhika Pathak",
                                        "email": "pathakradhika@gmail.com",
                                        "password": "radhika123",
                                        "cpassword": "radhika123"
                                    }
      => name = name of user , email = emailId of user , password = password of user , cpassword = confirm password
      
      
2.   /login
      => POST API
      => To login user
      => Input format   :   {
                                "email": "abcd@gmail.com",
                                "password": "abcd"
                            }
                            
                            
3.   /logout/:userId   
      => GET API
      => To logout user
      => Take userId in path params
      
      
4.   /changepassword/:userId
      => POST API
      => To change the password of user
      => take userId in params
      => authentication is must , take generated jwt token in cookies
      => Input format   :   {
                              "password" : "abcd",
                              "newPassword" : "radhika123"
                          }
                          
                          
5.   /generateotp   
      => POST Api 
      => request to reset password
      => sends otp on your entered mailId
      => input format   :   {
                                "email": "pathakradhika173@gmail.com"
                            }
                            
                            
6.   /verifyotp
      => POST API
      => to verify generated otp
      => input format   :   {
                              "email" : "pathakradhika173@gmail.com",
                              "otp": "1961"
                          }
                          
                          
7.   /updatepassword
      => POST API
      => to update password after reset request and otp verification
      => input format   :   {
                              "email": "radhika@gmail.com",
                              "newPassword": "abcd",
                              "cNewPassword": "abcd"
                          }
                          
                          
# Protected APIs  ( need to authenticattion )

8.   /createevent/:userId  
      => POST API 
      => To create new event
      => input format   :   {
                              "eventName": "Art Event",
                              "eventDate": "2022-07-28",
                              "createdBy": "62e0e9654f72a9aeed7866d1",
                              "invitees": ["62e0e9654f72a9aeed7866d1","62e0f6f021ad74c089b1d424","62e0f72668fcaf42e7acd65a","62e0f6f021ad74c089b1d424"]    // optional
                          }
                          
                          
9.   /invitepeoples/:userId
      => POST API 
      => to invite peoples in event
      => input format   :   {
                              "eventId": "62e22ee3015b8b8a3c4c4914",
                              "invitees": ["62e0e9654f72a9aeed7866d1","62e0f6f021ad74c089b1d424","62e0f72668fcaf42e7acd65a","62e0f6f021ad74c089b1d424"]
                          }
                          
                          
10.  /eventdetails/:userId/:eventId                          
      => GET API 
      => to get an event details 
      => take eventId in path params
      
      
11.  /updateevent/:userId/:eventId
      => POST API
      => to update event details
      => only creator can update 
      => input format   :   {
                              "eventName" : "xyz",
                              "invitees" : ["objectId1", "objetId2']
                          }
      => You can update any field ( eventName , invitess ) , atleast one must be present
      
      
12.  /listevents/:userId?page=1
      => GET API
      => to get event list in which you are invited or you are creator
      => take page in query filters ( ex. 1,2 or 3...)
      
      
# API FLOW

  => Register user
  => login 
  => can perform any API now 
  => INcase of reset password call generateotp => verifyotp => update password
  => after you can not perform protected APIs
