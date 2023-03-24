package com.jw.gymmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
//@EnableSwagger2
public class GymManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymManagerApplication.class, args);
    }

}
