import React, {useEffect, useRef, useState} from "react"
import Axios from "axios"
import {Scheduler} from "@aldabil/react-scheduler"
import JNotification from "../component/jNotification"
import {Button} from "@mui/material"
import {Badge, Select} from "evergreen-ui";
import {EventPopup} from "../component/calendarEventPopup";
import {EventColours} from "../component/eventColours";

function eventRenderer(event, role) {
    if (role === "COACH") return null;
    let start = event.start.toLocaleTimeString(undefined, { timeStyle: "short" });
    let end = event.end.toLocaleTimeString(undefined, { timeStyle: "short" });
    return (
        <div style={{padding: "2px 6px"}}>
            <h6 className={"event-element event-title"}>{event.title}</h6>
            <p className={"event-element event-text"}>{start} - {end}</p>
            <p className={"event-element event-text"}>{event.coach}</p>
            {event.isRegistered
                ? (<div style={{textAlign: "center"}}>
                    <Badge color={"green"} style={{fontSize: "10px", height: "12px", lineHeight: "11px", width: "100%"}}>Registered</Badge>
                </div>)
                : null
            }
        </div>
    );
}

export function MyCourses(props) {
    const cal = useRef(null);
    const courses = useRef([]);
    const [coaches, setCoaches] = useState([]);

    async function fetchData() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/course/getCourses");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                buildData(data);
            }
        } catch (err) {
            JNotification.danger(err.response.data.message);
        }
    }

    async function fetchCoaches() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/user/getCoaches");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                let result = data.map(x => { return {
                    id: x.id,
                    username: x.username
                }});
                setCoaches(result);
            }
        } catch (err) {
            JNotification.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchData();
        buildFields();
        let isTrainee = props.userInfo.role === "TRAINEE";
        if (props.userInfo.role === "TRAINEE") {
            fetchCoaches();
        }
        cal.current.scheduler.week.cellRenderer = ({ height, start, onClick, ...props }) => {
            let disabled = start <= Date.now();;
            return (
                <Button
                    style={{
                        backgroundColor: disabled ? "#f9f9f9" : "white"
                    }}
                    onClick={onClick}
                    disabled={disabled || isTrainee}
                    disableRipple={isTrainee}
                />
            );
        }
    },[]);


    function buildData(data) {
        buildCourses(data);
    }

    function buildCourses(data) {
        let result = getCoursesFromData(data, true);
        cal.current.scheduler.handleState(result, "events");
        courses.current = result;
    }

    function getCoursesFromData(data, isRegistered) {
        let isReadOnly = props.userInfo.role === "TRAINEE";
        isRegistered = props.userInfo.role === "COACH" ? false : isRegistered;
        return data.map(x => {
            return {
                event_id: x.id,
                title: x.title,
                description: x.description,
                start: new Date(x.startTime),
                end: new Date(x.endTime),
                status: x.status,
                coach: x.owner.username,
                coachId: x.owner.id,
                availableSlots: x.availableSlots,
                registeredSlots: x.registeredSlots || 0,
                draggable: !isReadOnly && !x.published,
                deletable: !isReadOnly && !x.published,
                editable: !isReadOnly && !x.published,
                published: x.published,
                isRegistered: isRegistered,
                color: getEventColor(x, isRegistered)
            }
        });
    }

    function getEventColor(event, isRegistered) {
        if (event.status === "CANCELLED")
            return EventColours["CANCELLED"];
        if (isRegistered)
            return EventColours["REGISTERED"];
        if (event.published)
            return EventColours["ACTIVE"];
        return EventColours["INITIAL"];
    }

    async function getCoachCourse(id) {
        if (id === "") {
            await fetchData();
            return;
        }
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        await Axios.get("/api/v1/course/getCoachCourses/" + id)
            .then(res => {
                if (res.status === 200) {
                    let data = getCoursesFromData(res.data.data, false);
                    const tempSet = new Set();
                    const result = [];
                    courses.current.forEach((course, _) => {
                        tempSet.add(course.event_id);
                        result.push(course);
                    });
                    data.forEach((course, _) => {
                        if (!tempSet.has(course.event_id)) result.push(course);
                    });
                    cal.current.scheduler.handleState(result, "events");
                }
            })
            .catch(error => {
                JNotification.danger("Failed to Load Course");
            })
    }

    function buildFields() {
        let res = [
            {
                name: "status",
                type: "select",
                options: [
                    { id: 1, text: "Active", value: "ACTIVE" }
                ],
                default: "ACTIVE",
                config: { label: "Status" }
            },
            {
                name: "availableSlots",
                type: "input",
                default: 10,
                config: { label: "Available Slot" }
            },
            {
                name: "description",
                type: "input",
                default: "Course Description...",
                config: { label: "Details", multiline: true, rows: 4 }
            }
        ];
        cal.current.scheduler.handleState(res, "fields");
    }

    async function handleConfirm(e, action) {
        if (e.start.getTime() <= Date.now() || e.end.getTime() <= Date.now()) {
            JNotification.danger("Cannot Create/Edit a Course for the Past Day")
            throw new Error("Failed to " + action);
        }
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        const query = new FormData();
        query.append("startTime", e.start.getTime());
        query.append("endTime", e.end.getTime());
        query.append("availableSlots", e.availableSlots);
        query.append("registeredSlots", e.registeredSlots || 0);
        query.append("title", e.title);
        query.append("description", e.description);
        query.append("status", e.status);
        let url = action === "create" ? "/api/v1/course/createCourse" : "/api/v1/course/editCourse";
        let method = action === "create" ? "post" : "put";
        if (action === "edit") {
            query.append("id", e.event_id);
        }
        await Axios({
            method: method,
            url: url,
            data: query,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                JNotification.success("Successfully " + action);
                e = getCoursesFromData([res.data.data], false)[0];
            }
        }).catch(error => {
            JNotification.danger("Failed to " + action);
            throw new Error("Failed to " + action);
        });
        return e;
    }

    async function handleDelete(id) {
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        await Axios.delete("/api/v1/course/deleteCourse/" + id
        ).then(res => {
            if (res.status === 200) {
                JNotification.success("Successfully Deleted");
            } else {
                throw new Error("Failed to Delete");
            }
        }).catch(error => {
            JNotification.danger("Failed to Delete");
            throw new Error("Failed to Delete");
        })
        return id;
    }

    async function handlePopupButton(event, action) {
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        let query = new FormData();
        query.append("action", action.toLowerCase());
        query.append("id", event.event_id);
        await Axios({
            method: "post",
            url: "/api/v1/course/actionCourse",
            data: query,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                JNotification.success("Successfully " + action);
                let event = getCoursesFromData([res.data.data], action === "REGISTER")[0];
                cal.current.scheduler.confirmEvent(event, "edit");
                if (props.userInfo.role === "TRAINEE") {
                    if (action === "DEREGISTER") {
                        courses.current = courses.current.filter(t => t.event_id !== event.event_id);
                        let currentCoachId = document.querySelector("#coachSelector").value;
                        if (event.coachId.toString() !== currentCoachId) {
                            let updatedEvents = cal.current.scheduler.events.filter(t => t.event_id !== event.event_id);
                            cal.current.scheduler.handleState(updatedEvents, "events");
                        }
                    } else {
                        courses.current.push(event);
                    }
                }
            }
        }).catch(error => {
            JNotification.danger("Failed to " + action)
            throw new Error("Failed to " + action)
        });
        closeView();
    }

    function closeView() {
        const icon = document.querySelector('[data-testid="ClearRoundedIcon"]');
        if (icon != null) {
            const button = icon.parentNode;
            if (button != null) button.click();
        }
    }

    return (
        <>
            <div className="table-content">
                {
                    coaches.length <= 0
                        ? null
                        : (
                            <Select
                                width={200}
                                id={"coachSelector"}
                                onChange={e => getCoachCourse(e.target.value)}
                            >
                                <option key={-1} label="My Courses"/>
                                {
                                    coaches.map((coach, index) =>
                                        <option
                                            key={index}
                                            value={coach.id}
                                            label={"Coach: " + coach.username}
                                        />
                                    )
                                }
                            </Select>
                        )
                }
                <Scheduler
                    ref={cal}
                    view="week"
                    day={null}
                    month={null}
                    week={{weekStartOn: 1}}
                    onConfirm={(e, action) => handleConfirm(e, action)}
                    onEventDrop={(d, u, o) => handleConfirm(u, "edit")}
                    onDelete={handleDelete}
                    viewerExtraComponent={(f, e) => EventPopup(f, e, props.userInfo, handlePopupButton)}
                    eventRenderer={(e) => eventRenderer(e, props.userInfo.role)}
                />
            </div>
        </>
    );
}