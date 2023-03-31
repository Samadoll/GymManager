import React, {useEffect, useRef, useState} from "react";
import Axios from "axios";
import {Avatar, toaster} from "evergreen-ui";
import Scheduler from "@aldabil/react-scheduler";

export function MyCourses(props) {
    const cal = useRef(null)

    const [courses, setCourses] = useState([])
    const [fields, setFields] = useState([])
    const [coaches, setCoaches] = useState([])

    async function fetchData() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/course/getCourses");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                buildData(data)
            }
        } catch (err) {
            toaster.danger(err.response.data.message);
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
                }})
                setCoaches(result)
            }
        } catch (err) {
            toaster.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchData();
        if (props.userInfo.role === "TRAINEE") {
            fetchCoaches();
        }
    },[])


    function buildData(data) {
        buildCourses(data)
        buildFields()
    }

    function buildCourses(data) {
        let result = data.map(x => { return {
            event_id: x.id,
            title: x.title,
            description: x.description,
            start: new Date(x.startTime),
            end: new Date(x.endTime),
            status: x.status
        }})
        cal.current.scheduler.handleState(result, "events")
        setCourses(result)
    }

    function buildFields() {
        let res = [
            {
                name: "status",
                type: "select",
                options: [
                    { id: 1, text: "Active", value: "ACTIVE" },
                    { id: 2, text: "Cancelled", value: "CANCELLED" }
                ],
                default: "ACTIVE",
                config: { label: "Status" }
            },
            {
                name: "slots",
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
        ]
        cal.current.scheduler.handleState(res, "fields")
        setFields(res)
    }

    async function handleConfirm(e, action) {
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        const query = new FormData();
        query.append("startTime", e.start.getTime());
        query.append("endTime", e.end.getTime());
        query.append("availableSlots", e.slots)
        query.append("title", e.title);
        query.append("description", e.description)
        query.append("status", e.status)
        if (action === "create") {
            await Axios.post("/api/v1/course/createCourse", query, {
                headers: {
                    'Content-Type': 'application/json',
                }})
                .then(res => {
                    if (res.status === 200) {
                        toaster.success("Successfully Created")
                        e.event_id = res.data.data
                    }
                })
                .catch(error => {
                    toaster.danger("Failed to Create Course");
                })
            return e;
        } else {

        }
    }

    async function getCoachCourse(id) {
        if (id == "") {
            cal.current.scheduler.handleState(courses, "events");
            return;
        }
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        await Axios.get("/api/v1/course/getCourse/" + id)
            .then(res => {
                if (res.status === 200) {
                    let result = res.data.data.map(x => { return {
                        event_id: x.id,
                        title: x.title,
                        description: x.description,
                        start: new Date(x.startTime),
                        end: new Date(x.endTime),
                        status: x.status
                    }})
                    cal.current.scheduler.handleState(courses.concat(result), "events");
                }
            })
            .catch(error => {
                toaster.danger("Failed to Load Course");
            })
    }

    return (
        <div style={{width: "80%", "margin": "auto", "background": "white", "border": "1px solid #ccc"}}>
            {
                coaches.length <= 0
                    ? null
                    : (
                        <select
                            onChange={e => getCoachCourse(e.target.value)}
                        >
                            <option key={-1} label="My Courses"/>
                            {
                                coaches.map((coach, index) =>
                                    <option
                                        key={index}
                                        value={coach.id}
                                        label={coach.username}
                                    />
                                )
                            }
                        </select>
                    )
            }
            <button onClick={() => {
                getCoachCourse(1);
            }}>Test</button>
            <Scheduler
                ref={cal}
                view="week"
                day={null}
                month={null}
                // fields={fields}
                // events={courses}
                onConfirm={(e, action) => handleConfirm(e, action)}
            />
        </div>
    )
}