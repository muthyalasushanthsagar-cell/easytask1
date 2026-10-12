package com.easytask.repository;

import com.easytask.entity.GroceryList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroceryListRepository extends JpaRepository<GroceryList, Long> {

    List<GroceryList> findAllByOrderByIdDesc();
}
