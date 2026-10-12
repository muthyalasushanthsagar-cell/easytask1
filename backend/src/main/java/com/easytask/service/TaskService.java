package com.easytask.service;

import com.easytask.dto.DashboardSummaryResponse;
import com.easytask.dto.TaskRequest;
import com.easytask.dto.TaskResponse;
import com.easytask.entity.Task;
import com.easytask.entity.TaskPriority;
import com.easytask.entity.TaskStatus;
import com.easytask.exception.BadRequestException;
import com.easytask.exception.ResourceNotFoundException;
import com.easytask.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final Clock clock;

    public TaskService(TaskRepository taskRepository, Clock clock) {
        this.taskRepository = taskRepository;
        this.clock = clock;
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    // ------------------------------------------------------------------ queries

    @Transactional
    public List<TaskResponse> list(String status, String priority, String category,
                                   String search, String sortBy, String sortDir) {
        refreshOverdue();
        Stream<Task> stream = taskRepository.findAll().stream();

        if (hasText(status) && !"ALL".equalsIgnoreCase(status.trim())) {
            TaskStatus wanted = parseStatus(status);
            stream = stream.filter(t -> t.getStatus() == wanted);
        }
        if (hasText(priority) && !"ALL".equalsIgnoreCase(priority.trim())) {
            TaskPriority wanted = parsePriority(priority);
            stream = stream.filter(t -> t.getPriority() == wanted);
        }
        if (hasText(category) && !"ALL".equalsIgnoreCase(category.trim())) {
            String wanted = category.trim();
            stream = stream.filter(t -> t.getCategory() != null && t.getCategory().equalsIgnoreCase(wanted));
        }
        if (hasText(search)) {
            String needle = search.trim().toLowerCase();
            stream = stream.filter(t ->
                    (t.getTitle() != null && t.getTitle().toLowerCase().contains(needle))
                            || (t.getDescription() != null && t.getDescription().toLowerCase().contains(needle)));
        }

        boolean desc = "desc".equalsIgnoreCase(sortDir);
        String key = hasText(sortBy) ? sortBy.trim() : "dueDate";

        Comparator<LocalDateTime> dateOrder = desc
                ? Comparator.<LocalDateTime>naturalOrder().reversed()
                : Comparator.<LocalDateTime>naturalOrder();
        Comparator<TaskPriority> priorityOrder = desc
                ? Comparator.<TaskPriority>naturalOrder().reversed()
                : Comparator.<TaskPriority>naturalOrder();

        Comparator<Task> comparator;
        if ("createdAt".equals(key)) {
            comparator = Comparator.comparing(Task::getCreatedAt, Comparator.nullsLast(dateOrder));
        } else if ("priority".equals(key)) {
            comparator = Comparator.comparing(Task::getPriority, Comparator.nullsLast(priorityOrder));
        } else {
            comparator = Comparator.comparing(Task::getDueDate, Comparator.nullsLast(dateOrder));
        }

        return stream.sorted(comparator).map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse get(Long id) {
        refreshOverdue();
        return TaskResponse.from(find(id));
    }

    @Transactional
    public List<TaskResponse> today() {
        refreshOverdue();
        LocalDate today = LocalDate.now(clock);
        return taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().equals(today))
                .sorted(byDueDate())
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional
    public List<TaskResponse> upcoming() {
        refreshOverdue();
        LocalDate today = LocalDate.now(clock);
        return taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().isAfter(today))
                .sorted(byDueDate())
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional
    public List<TaskResponse> completed() {
        Comparator<LocalDateTime> newestFirst = Comparator.<LocalDateTime>naturalOrder().reversed();
        return taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .sorted(Comparator.comparing(Task::getCompletedAt, Comparator.nullsLast(newestFirst)))
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional
    public List<TaskResponse> overdue() {
        refreshOverdue();
        return taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.OVERDUE)
                .sorted(byDueDate())
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional
    public DashboardSummaryResponse summary() {
        refreshOverdue();
        List<Task> all = taskRepository.findAll();
        LocalDate today = LocalDate.now(clock);

        long total = all.size();
        long completed = all.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long overdue = all.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();
        long pending = all.stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                .count();
        long high = all.stream()
                .filter(t -> t.getPriority() == TaskPriority.HIGH && t.getStatus() != TaskStatus.COMPLETED)
                .count();

        List<Task> todayTasks = all.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().equals(today))
                .sorted(byDueDate())
                .toList();
        List<Task> upcomingTasks = all.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().isAfter(today))
                .sorted(byDueDate())
                .toList();
        List<Task> overdueTasks = all.stream()
                .filter(t -> t.getStatus() == TaskStatus.OVERDUE)
                .sorted(byDueDate())
                .toList();

        int rate = total == 0 ? 0 : (int) Math.round(completed * 100.0 / total);

        return new DashboardSummaryResponse(
                total, pending, completed, overdue,
                todayTasks.size(), upcomingTasks.size(), high, rate,
                todayTasks.stream().limit(5).map(TaskResponse::from).toList(),
                upcomingTasks.stream().limit(5).map(TaskResponse::from).toList(),
                overdueTasks.stream().limit(5).map(TaskResponse::from).toList());
    }

    // ------------------------------------------------------------------ commands

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        LocalDateTime n = now();
        task.setCreatedAt(n);
        task.setUpdatedAt(n);
        apply(task, request, true);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = find(id);
        apply(task, request, false);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(find(id));
    }

    @Transactional
    public TaskResponse complete(Long id) {
        Task task = find(id);
        LocalDateTime n = now();
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(n);
        task.setUpdatedAt(n);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse reopen(Long id) {
        Task task = find(id);
        LocalDateTime n = now();
        boolean late = task.getDueDate() != null && task.getDueDate().isBefore(n);
        task.setStatus(late ? TaskStatus.OVERDUE : TaskStatus.PENDING);
        task.setCompletedAt(null);
        task.setUpdatedAt(n);
        return TaskResponse.from(taskRepository.save(task));
    }

    // ------------------------------------------------------------------ helpers

    /** Marks unfinished tasks whose due date has passed as OVERDUE (dirty checking persists it). */
    private void refreshOverdue() {
        LocalDateTime n = now();
        List<Task> open = taskRepository.findByStatusIn(List.of(TaskStatus.PENDING, TaskStatus.IN_PROGRESS));
        for (Task t : open) {
            if (t.getDueDate() != null && t.getDueDate().isBefore(n)) {
                t.setStatus(TaskStatus.OVERDUE);
                t.setUpdatedAt(n);
            }
        }
    }

    private void apply(Task task, TaskRequest r, boolean isNew) {
        LocalDateTime n = now();

        task.setTitle(r.title().trim());
        task.setDescription(blankToNull(r.description()));
        task.setPriority(r.priority() != null ? r.priority() : TaskPriority.MEDIUM);
        task.setCategory(hasText(r.category()) ? r.category().trim() : "General");

        LocalDateTime oldDue = task.getDueDate();
        LocalDateTime oldReminder = task.getReminderAt();

        LocalDateTime newDue = r.dueDate();
        LocalDateTime newReminder = null;
        Integer minutes = null;
        if (r.reminderAt() != null) {
            newReminder = r.reminderAt();
        } else if (r.reminderMinutes() != null && r.reminderMinutes() > 0 && newDue != null) {
            minutes = r.reminderMinutes();
            newReminder = newDue.minusMinutes(minutes);
        }

        task.setDueDate(newDue);
        task.setReminderMinutes(minutes);
        task.setReminderAt(newReminder);

        if (isNew || !Objects.equals(oldDue, newDue) || !Objects.equals(oldReminder, newReminder)) {
            task.setReminderSent(false);
            task.setOverdueNotified(false);
        }

        TaskStatus status = r.status() != null ? r.status() : (isNew ? TaskStatus.PENDING : task.getStatus());
        if (status == TaskStatus.COMPLETED) {
            if (task.getCompletedAt() == null) {
                task.setCompletedAt(n);
            }
        } else {
            task.setCompletedAt(null);
            TaskStatus base = status == TaskStatus.OVERDUE ? TaskStatus.PENDING : status;
            status = (newDue != null && newDue.isBefore(n)) ? TaskStatus.OVERDUE : base;
        }
        task.setStatus(status);
        task.setUpdatedAt(n);
    }

    private Task find(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
    }

    private Comparator<Task> byDueDate() {
        return Comparator.comparing(Task::getDueDate, Comparator.nullsLast(Comparator.<LocalDateTime>naturalOrder()));
    }

    private TaskStatus parseStatus(String value) {
        try {
            return TaskStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status: " + value);
        }
    }

    private TaskPriority parsePriority(String value) {
        try {
            return TaskPriority.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid priority: " + value);
        }
    }

    private static boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private static String blankToNull(String s) {
        return hasText(s) ? s.trim() : null;
    }
}
