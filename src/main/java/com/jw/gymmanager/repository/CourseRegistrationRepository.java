package com.jw.gymmanager.repository;

import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.CourseRegistration;
import com.jw.gymmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Integer> {

    Optional<Set<CourseRegistration>> findCourseRegistrationsByTrainee(User trainee);
    Optional<CourseRegistration> findCourseRegistrationByCourseAndTrainee(CourseEvent course, User trainee);

}
