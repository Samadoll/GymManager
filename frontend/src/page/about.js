import React from "react";

export function About(props) {
    return (
        <div className="table-content">
            <div style={{
                height: "auto",
                textAlign: "center",
                fontFamily: "Verdana",
                lineHeight: 5
            }}>
                <label>This is an About page.</label>
                <br/>
                <label>Created with Spring Boot and React</label>
                <br/>
                <label>Create by Jiawei</label>
            </div>
        </div>
    )
}