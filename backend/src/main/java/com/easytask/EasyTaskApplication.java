package com.easytask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EasyTaskApplication {
    public static void main(String[] args) {
        SpringApplication.run(EasyTaskApplication.class, args);
    }
}
