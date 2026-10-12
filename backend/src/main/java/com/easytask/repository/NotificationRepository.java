package com.easytask.repository;

import com.easytask.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByOrderByCreatedAtDescIdDesc();

    long countByReadFalse();

    List<Notification> findByReadFalse();
}
