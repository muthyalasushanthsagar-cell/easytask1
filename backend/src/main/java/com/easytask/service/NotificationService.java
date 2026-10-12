package com.easytask.service;

import com.easytask.dto.NotificationResponse;
import com.easytask.entity.Notification;
import com.easytask.entity.NotificationType;
import com.easytask.exception.ResourceNotFoundException;
import com.easytask.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Clock clock;

    public NotificationService(NotificationRepository notificationRepository, Clock clock) {
        this.notificationRepository = notificationRepository;
        this.clock = clock;
    }

    @Transactional
    public Notification create(String title, String message, NotificationType type, Long taskId) {
        Notification n = new Notification();
        n.setTitle(title.length() > 200 ? title.substring(0, 200) : title);
        n.setMessage(message != null && message.length() > 500 ? message.substring(0, 500) : message);
        n.setType(type);
        n.setTaskId(taskId);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now(clock));
        return notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list() {
        return notificationRepository.findTop50ByOrderByCreatedAtDescIdDesc().stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByReadFalse();
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id " + id));
        n.setRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public int markAllRead() {
        List<Notification> unread = notificationRepository.findByReadFalse();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }
}
