package com.easytask.service;

import com.easytask.entity.NotificationType;
import com.easytask.entity.Task;
import com.easytask.entity.TaskStatus;
import com.easytask.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Runs every 30 seconds. Creates one reminder notification and one overdue notification per task
 * (the flags on the task prevent duplicates).
 */
@Service
public class ReminderSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(ReminderSchedulerService.class);
    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("dd MMM, hh:mm a", Locale.ENGLISH);

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final Clock clock;

    public ReminderSchedulerService(TaskRepository taskRepository, NotificationService notificationService, Clock clock) {
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
        this.clock = clock;
    }

    @Scheduled(fixedDelay = 30000, initialDelay = 20000)
    public void checkDeadlines() {
        try {
            LocalDateTime now = LocalDateTime.now(clock);
            List<Task> changed = new ArrayList<>();

            for (Task t : taskRepository.findByStatusNot(TaskStatus.COMPLETED)) {
                if (t.getDueDate() == null) {
                    continue;
                }
                boolean dirty = false;
                boolean duePassed = t.getDueDate().isBefore(now);

                if (!t.isReminderSent() && t.getReminderAt() != null && !t.getReminderAt().isAfter(now)) {
                    if (!duePassed) {
                        notificationService.create(
                                "Reminder: " + t.getTitle(),
                                "Due " + t.getDueDate().format(FORMAT),
                                NotificationType.REMINDER, t.getId());
                    }
                    t.setReminderSent(true);
                    dirty = true;
                }

                if (duePassed) {
                    if (t.getStatus() != TaskStatus.OVERDUE) {
                        t.setStatus(TaskStatus.OVERDUE);
                        t.setUpdatedAt(now);
                        dirty = true;
                    }
                    if (!t.isOverdueNotified()) {
                        notificationService.create(
                                "Overdue: " + t.getTitle(),
                                "This task was due " + t.getDueDate().format(FORMAT),
                                NotificationType.OVERDUE, t.getId());
                        t.setOverdueNotified(true);
                        dirty = true;
                    }
                }

                if (dirty) {
                    changed.add(t);
                }
            }

            if (!changed.isEmpty()) {
                taskRepository.saveAll(changed);
            }
        } catch (Exception ex) {
            log.warn("Reminder check failed: {}", ex.getMessage());
        }
    }
}
