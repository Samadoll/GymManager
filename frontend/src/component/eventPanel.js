import React, {useEffect, useState} from "react";
import JAxios from "./jAxios";
import JNotification from "./jNotification";
import {Badge, CalendarIcon} from "evergreen-ui";

function EventCard(props) {
    let start = new Date(props.event.startTime).toLocaleTimeString(undefined, {timeStyle: "short"});
    let end = new Date(props.event.endTime).toLocaleTimeString(undefined, {timeStyle: "short"});
    let badgeColour = props.event.status === "ACTIVE" ? "green" : "red";
    let readonly = new Date(props.event.startTime).getTime() < new Date().getTime();
    let action = "DEREGISTER";
    if (props.userInfo.role === "COACH") {
        action = props.event.status === "ACTIVE" ? "CANCEL" : "ACTIVATE";
    }
    return (
        <div className={"event-panel-element"}>
            <h6 className={"event-element event-title"}>{props.event.title}</h6>
            <p className={"event-element event-text"}>{start} - {end}</p>
            {props.userInfo.role === "COACH" ? null : (<p className={"event-element event-text"}>{props.event.owner.username}</p>)}
            <Badge color={badgeColour} style={{verticalAlign: "top"}}>{props.event.status}</Badge>
            {readonly ? null : (<button className="login-register-button-primary" onClick={() => {props.fn.apply(null, [props.event, action]);}}>{action}</button>)}
        </div>
    )
}

export function EventPanel(props) {
    const [events, setEvents] = useState([]);

    async function fetchEvent() {
        try {
            const res = await JAxios.get(props.eventApi);
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                setEvents(data);
            }
        } catch (err) {
            JNotification.danger(err.message);
        }
    }

    async function handlePopupButton(event, action) {
        let query = new FormData();
        query.append("action", action.toLowerCase());
        query.append("id", event.id);
        await JAxios.post("/api/v1/course/actionCourse", query)
            .then(res => {
                if (res.status === 200) {
                    JNotification.success("Successfully " + action);
                    fetchEvent();
                }
            })
            .catch(error => {
                JNotification.danger("Failed to " + action)
                throw new Error("Failed to " + action)
            });
    }

    useEffect(() => {
        fetchEvent();
    }, [])

    return (
        <div className={"event-panel"}>
            <CalendarIcon size={24} color={events.length === 0 ? "disabled" : "muted"}/>
            <label className={"event-panel-title" + (events.length === 0 ? "-empty" : "")}>
                {events.length === 0 ? "You don't have any courses today." : "Your Upcoming Courses Today"}
            </label>
            {
                events.length !== 0
                    ? events.map((e) => <EventCard event={e} userInfo={props.userInfo} fn={handlePopupButton}/>)
                    : null
            }
        </div>
    );
}
