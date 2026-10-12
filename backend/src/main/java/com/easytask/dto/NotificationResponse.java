package com.easytask.dto;

import com.easytask.entity.Notification;
import com.easytask.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        NotificationType type,
        Long taskId,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.getType(),
                n.getTaskId(), n.isRead(), n.getCreatedAt());
    }
}
