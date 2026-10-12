package com.easytask.controller;

import com.easytask.dto.TaskRequest;
import com.easytask.dto.TaskResponse;
import com.easytask.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> list(@RequestParam(required = false) String status,
                                   @RequestParam(required = false) String priority,
                                   @RequestParam(required = false) String category,
                                   @RequestParam(required = false) String search,
                                   @RequestParam(required = false) String sortBy,
                                   @RequestParam(required = false) String sortDir) {
        return taskService.list(status, priority, category, search, sortBy, sortDir);
    }

    @GetMapping("/today")
    public List<TaskResponse> today() {
        return taskService.today();
    }

    @GetMapping("/upcoming")
    public List<TaskResponse> upcoming() {
        return taskService.upcoming();
    }

    @GetMapping("/completed")
    public List<TaskResponse> completed() {
        return taskService.completed();
    }

    @GetMapping("/overdue")
    public List<TaskResponse> overdue() {
        return taskService.overdue();
    }

    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable Long id) {
        return taskService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return taskService.create(request);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }

    @PatchMapping("/{id}/complete")
    public TaskResponse complete(@PathVariable Long id) {
        return taskService.complete(id);
    }

    @PatchMapping("/{id}/reopen")
    public TaskResponse reopen(@PathVariable Long id) {
        return taskService.reopen(id);
    }
}
