package com.cuteicles.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class TimeConfig {

    /** Studio-local clock. Appointment dates and times are wall-clock times in this zone. */
    @Bean
    public Clock studioClock(AppProperties props) {
        return Clock.system(ZoneId.of(props.studio().timezone()));
    }
}
