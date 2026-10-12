package com.easytask.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class AppConfig {

    /** One clock for the whole app so "today" and "overdue" use the configured time zone, not the server's. */
    @Bean
    public Clock clock(@Value("${app.timezone:Asia/Kolkata}") String timezone) {
        ZoneId zone;
        try {
            zone = ZoneId.of(timezone);
        } catch (Exception ex) {
            zone = ZoneId.of("UTC");
        }
        return Clock.system(zone);
    }
}
