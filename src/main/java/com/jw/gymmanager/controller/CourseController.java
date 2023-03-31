package com.jw.gymmanager.controller;

import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.service.CourseService;
import com.jw.gymmanager.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/getCourses")
    public ResponseEntity<JResponse> getCourses() {
        return ResponseEntity.ok(courseService.getCourse(Util.getCurrentUid()));
    }

    @PostMapping("/createCourse")
    public ResponseEntity<JResponse> createCourse(@RequestBody CourseEvent courseEvent) {
        return ResponseEntity.ok(courseService.createCourse(Util.getCurrentUid(), courseEvent));
    }

}
