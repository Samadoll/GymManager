package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.entity.Role;
import com.jw.gymmanager.repository.CourseRepository;
import com.jw.gymmanager.repository.RegistrationRepository;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;

    public JResponse getCourses(int currentUid) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        Optional<List<CourseEvent>> courses;
        if (existedUser.getRole() == Role.COACH) {
            courses = courseRepository.findCourseEventsByOwner(existedUser);
        } else {
            var registrations = registrationRepository.findCourseRegistrationsByTrainee(existedUser);
            if (registrations.isEmpty()) {
                return JResponse.builder().status(200).data(new ArrayList<>()).build();
            }
            courses = courseRepository.findCourseEventsByCourseRegistrationsIn(registrations.get());
        }
        return JResponse.builder().status(200).data(courses.isPresent() ? courses.get() : new ArrayList<>()).build();
    }

    public JResponse getCoachCourse(int id) {
        var user = userRepository.findById(id);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Coach Not Exist").build();
        var existedUser = user.get();
        var courses = courseRepository.findCourseEventsByOwner(existedUser);
        return JResponse.builder().status(200).data(courses.orElseGet(ArrayList::new)).build();
    }

    public JResponse createEditCourse(int currentUid, CourseEvent courseEvent) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        courseEvent.setOwner(existedUser);
        courseRepository.save(courseEvent);
        return JResponse.builder().status(200).data(courseEvent.getId()).build();
    }

    public JResponse deleteCourse(int currentUid, Integer id) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Not Allowed to Delete").build();
        var existedUser = user.get();
        var course = courseRepository.findCourseEventByIdAndOwner(id, existedUser);
        if (course.isPresent()) {
            courseRepository.deleteById(id);
            return JResponse.builder().status(200).data(id).build();
        }
        return JResponse.builder().status(400).message("Not Allowed to Delete").build();
    }
}
