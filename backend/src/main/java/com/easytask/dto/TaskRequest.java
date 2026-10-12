package com.easytask.dto;

import com.easytask.entity.TaskPriority;
import com.easytask.entity.TaskStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record TaskRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must be at most 200 characters")
        String title,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        TaskPriority priority,

        TaskStatus status,

        @Size(max = 60, message = "Category must be at most 60 characters")
        String category,

        LocalDateTime dueDate,

        @Min(value = 0, message = "Reminder minutes cannot be negative")
        Integer reminderMinutes,

        LocalDateTime reminderAt
) {
}
