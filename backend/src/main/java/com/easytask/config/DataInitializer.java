package com.easytask.config;

import com.easytask.dto.GroceryDTOs.GroceryItemRequest;
import com.easytask.dto.GroceryDTOs.GroceryListRequest;
import com.easytask.dto.GroceryDTOs.GroceryListResponse;
import com.easytask.dto.TaskRequest;
import com.easytask.entity.TaskPriority;
import com.easytask.repository.GroceryListRepository;
import com.easytask.repository.TaskRepository;
import com.easytask.service.GroceryService;
import com.easytask.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;

/** Adds a few sample records the first time the app starts with an empty database. */
@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final TaskRepository taskRepository;
    private final GroceryListRepository groceryListRepository;
    private final TaskService taskService;
    private final GroceryService groceryService;
    private final Clock clock;

    public DataInitializer(TaskRepository taskRepository, GroceryListRepository groceryListRepository,
                           TaskService taskService, GroceryService groceryService, Clock clock) {
        this.taskRepository = taskRepository;
        this.groceryListRepository = groceryListRepository;
        this.taskService = taskService;
        this.groceryService = groceryService;
        this.clock = clock;
    }

    @Override
    public void run(String... args) {
        try {
            if (taskRepository.count() == 0) {
                LocalDateTime now = LocalDateTime.now(clock).withSecond(0).withNano(0);
                taskService.create(new TaskRequest("Welcome to Easy Task",
                        "Add your own tasks with the New Task button.", TaskPriority.MEDIUM, null,
                        "Personal", now.plusHours(3), 15, null));
                taskService.create(new TaskRequest("Finish project report",
                        "Summarise this week's progress.", TaskPriority.HIGH, null,
                        "Work", now.plusDays(1), 60, null));
                taskService.create(new TaskRequest("Plan weekend study session",
                        null, TaskPriority.LOW, null,
                        "Study", now.plusDays(3), null, null));
            }
            if (groceryListRepository.count() == 0) {
                GroceryListResponse list = groceryService.createList(
                        new GroceryListRequest("Weekly Groceries", "Things to pick up this week", "#16a34a"));
                groceryService.addItem(list.id(), new GroceryItemRequest("Milk", 2.0, "L", "Dairy"));
                groceryService.addItem(list.id(), new GroceryItemRequest("Rice", 5.0, "kg", "Staples"));
                groceryService.addItem(list.id(), new GroceryItemRequest("Tomatoes", 1.0, "kg", "Vegetables"));
            }
        } catch (Exception ex) {
            log.warn("Could not insert sample data: {}", ex.getMessage());
        }
    }
}
