package com.easytask.dto;

import com.easytask.entity.Task;
import com.easytask.entity.TaskPriority;
import com.easytask.entity.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        String category,
        LocalDateTime dueDate,
        Integer reminderMinutes,
        LocalDateTime reminderAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime completedAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getPriority(),
                t.getStatus(),
                t.getCategory(),
                t.getDueDate(),
                t.getReminderMinutes(),
                t.getReminderAt(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                t.getCompletedAt()
        );
    }
}
