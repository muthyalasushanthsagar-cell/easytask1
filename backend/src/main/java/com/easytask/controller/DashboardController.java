package com.easytask.controller;

import com.easytask.dto.DashboardSummaryResponse;
import com.easytask.service.TaskService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TaskService taskService;

    public DashboardController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return taskService.summary();
    }
}
