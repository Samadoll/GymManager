import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Axios from "axios"
import JNotification from "../component/jNotification";

export function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function handleLogin() {
        const query = new FormData();
        query.append("username", username);
        query.append("password", password);
        if (username.trim() === "" || password.trim() === "") {
            JNotification.danger("Please Enter Username and Password");
            return;
        }
        Axios.post("/api/v1/auth/authenticate", query, {
            headers: {
                'Content-Type': 'application/json',
            }})
            .then(res => {
                const data = res.data;
                if (res.status === 200) {
                    const uid = data.uid;
                    props.login({ username: username, uid: uid, role: data.role });
                    navigate("/")
                    JNotification.success(`Welcome, ${username}!`);
                }
            })
            .catch(error => {
                JNotification.danger("Invalid Username/Password");
            })
    }

    return (
        <div className="login-register-page">
            <div className="login-register-content">
                <div style={{textAlign: "center", fontFamily: "Verdana", fontSize: "30px"}}>
                    <label>Sign in to FITNESS</label>
                </div>
                <hr/>
                <br/>
                <form id="login-form">
                    <div>
                        <label className="input-field-label">Username:</label>
                    </div>
                    <input
                        className="input-field"
                        maxLength="20"
                        required
                        placeholder="Enter username..."
                        onChange={e => setUsername(e.target.value)}
                    />
                    <br/>
                    <div>
                        <label className="input-field-label">Password:</label>
                        {/*<a className="input-field-label" href="/" tabIndex="-1"*/}
                        {/*   style={{float: "right", fontSize: "15px", marginTop: "5px"}}>Forgot Password?</a>*/}
                    </div>
                    <input
                        className="input-field"
                        maxLength="20"
                        required
                        placeholder="Enter password..."
                        type="password"
                        onChange={e => setPassword(e.target.value)}
                    />
                </form>
                <br/>
                <button
                    onClick={() => {handleLogin();}}
                    className="login-register-button-primary"
                >Login</button>
                <br/>
                <br/>
                <button
                    onClick={() => { navigate("/registerPage") }}
                    className="login-register-button-secondary"
                >Join Now</button>
            </div>
        </div>
    );
}