import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Axios from "axios"
import {toaster} from "evergreen-ui";

export function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("")
    const [role, setRole] = React.useState("")
    const options = [{ label: 'Coach', value: 'COACH' }, { label: 'Trainee', value: 'TRAINEE' }]
    const navigate = useNavigate();

    function handleRegister() {
        const regex = new RegExp(/^[a-zA-Z0-9]+$/g);
        if (!regex.test(username)) {
            toaster.danger("Invalid Username (Alphanumeric only)");
            return;
        }
        if (confirm !== password) {
            toaster.danger("Password Not Match");
            return;
        }
        if (role === "" || role === undefined) {
            toaster.danger("Member Role Not Select");
            return;
        }
        const query = new FormData();
        query.append("username", username);
        query.append("password", password);
        query.append("role", role);
        Axios.post("/api/v1/auth/register", query, {
            headers: {
                'Content-Type': 'application/json',
            }})
            .then(res => {
                if (res.status === 200) {
                    toaster.success("Successfully Registered")
                    navigate("/loginPage")
                }
            })
            .catch(error => {
                toaster.danger("User Already Existed");
            })
    }

    return (
        <div className="login-register-page">
            <div className="login-register-content">
                <div style={{textAlign: "center", fontFamily: "Verdana", fontSize: "30px"}}>
                    <label>Create Your Account</label>
                </div>
                <hr/>
                <br/>
                <form>
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
                    </div>
                    <input
                        className="input-field"
                        maxLength="20"
                        required
                        placeholder="Enter password..."
                        type="password"
                        onChange={e => setPassword(e.target.value)}
                    />
                    <br/>
                    <div>
                        <label className="input-field-label">Confirm Password:</label>
                    </div>
                    <input
                        className="input-field"
                        maxLength="20"
                        required
                        placeholder="Re-enter password..."
                        type="password"
                        onChange={e => setConfirm(e.target.value)}
                    />
                </form>
                <br/>
                <div className="login-register-selection">
                    {options.map(({ label, value }) => (
                        <button key={label} className={"login-register-selection-button" + (role === value ? "-active" : "")} onClick={() => setRole(value)}>
                            {label}
                        </button>
                    ))}
                </div>
                <br/>
                <button
                    onClick={() => {handleRegister();}}
                    className="login-register-button-primary"
                >Register</button>
                <br/>
                <br/>
                <button
                    onClick={() => { navigate("/loginPage") }}
                    className="login-register-button-secondary"
                >Sign In Now</button>
            </div>
        </div>
    );
}