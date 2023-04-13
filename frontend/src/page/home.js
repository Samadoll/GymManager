import React from "react";

export function Home() {
    let fontSettings = {fontSize: "40px", fontFamily: "'Trebuchet MS', sans-serif", color: "#667C89"};
    return (
        <div className="table-content" style={{textAlign: "center"}}>
            <div style={{marginTop: "25px"}}>
                <label style={fontSettings}>WELCOME</label>
            </div>
            <div>
                <label style={fontSettings}>TO</label>
            </div>
            <div>
                <img src={"../media/logo.png"} style={{width: "70%"}}/>
            </div>
        </div>
    )
}