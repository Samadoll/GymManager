package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.CourseStatus;
import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.entity.Role;
import com.jw.gymmanager.repository.CourseRepository;
import com.jw.gymmanager.repository.RegistrationRepository;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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

    public JResponse getCoachCourse(int currentUserId, int id) {
        var u = userRepository.findById(currentUserId);
        if (u.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var currentUser = u.get();

        var user = userRepository.findById(id);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Coach Not Exist").build();
        var existedUser = user.get();

        var registrations = registrationRepository.findCourseRegistrationsByTrainee(existedUser).orElseGet(HashSet::new);
        var registeredEventId = registrations.stream().mapToInt(obj -> obj.getCourse().getId()).boxed().collect(Collectors.toSet());
        var courses = courseRepository.findCourseEventsByOwner(existedUser).orElseGet(ArrayList::new);
        courses = courses.stream().filter(t -> t.isPublished() && !registeredEventId.contains(t.getId())).toList();
        return JResponse.builder().status(200).data(courses).build();
    }

    public JResponse createEditCourse(int currentUid, CourseEvent courseEvent) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        courseEvent.setOwner(existedUser);
        courseRepository.save(courseEvent);
        return JResponse.builder().status(200).data(courseEvent).build();
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

    public JResponse actionOnCourse(int currentUid, Integer eventId, String action) {
        if (!new HashSet<>(Arrays.asList("PUBLISH", "ACTIVATE", "CANCEL", "REGISTER", "DEREGISTER")).contains(action))
            return JResponse.builder().status(400).message("Not Allowed to " + action).build();
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Not Allowed to " + action).build();
        var existedUser = user.get();
        var course = courseRepository.findCourseEventByIdAndOwner(eventId, existedUser);
        if (course.isPresent()) {
            var c = existedUser.getRole() == Role.COACH ? ownerActionOnCourse(course.get(), action) : traineeActionOnCourse(course.get(), action);
            return JResponse.builder().status(200).data(c).build();
        }
        return JResponse.builder().status(400).message("Not Allowed to " + action).build();
    }

    private CourseEvent ownerActionOnCourse(CourseEvent course, String action) {
        switch (action) {
            case "PUBLISH" -> course.setPublished(true);
            case "ACTIVATE" -> course.setStatus(CourseStatus.ACTIVE);
            case "CANCEL" -> course.setStatus(CourseStatus.CANCELLED);
        }
        return courseRepository.save(course);
    }

    private CourseEvent traineeActionOnCourse(CourseEvent course, String action) {
        switch (action) {
            case "REGISTER" -> {
                // TODO
            }
            case "DEREGISTER" -> {
                // TODO: 2
            }
        }
        return course;
    }

}
