package com.easytask.repository;

import com.easytask.entity.Task;
import com.easytask.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatusNot(TaskStatus status);

    List<Task> findByStatusIn(Collection<TaskStatus> statuses);
}
