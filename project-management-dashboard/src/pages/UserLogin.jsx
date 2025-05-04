import { useState } from "react";
import "../pages/Userlogin-style.css"

const UserLogin =()=>{


    const [userName,setUserName]=useState("");
    const [password,setPassword]=useState("");

//    const  passwordcheck =(p)=>{
//     if(password.length<4 || userName.length<4)
//     {
//         alert("password and userName must be 4 characters langth")
//         return true;

//     }
//     return true;

//    }

    const handelSubmit=(e)=>{
        passwordcheck(p);

        e.preventDefault();
        if(userName && password)
        { 
            alert("login successfull")
            setUserName("");
            setPassword("");
        }
        else{
            alert("please fiil the form")
        }
    }

    return(

        <div className="user-Container">
            <h1>User Login</h1>
            <form className="userFrom" onSubmit={handelSubmit}>
            <div className="input-group">
                <label htmlFor="userName">User Name</label>
                <input type="text" id="userName" value={userName} onChange={(e)=>setUserName(e.target.value)} placeholder="EnterUser Name"/>

            </div>
            <div className="input-group">
                <label htmlFor="userPassword">Pass Word</label>
                <input type="password" id="password" value={password} onChange={(e)=>setPassword(e.target.value)}
                placeholder="Enter Password"/>
            </div>
            <button classname="login-Button" type="submit">
                Login

            </button>

                </form>


        </div>
    )
}

export default UserLogin;

