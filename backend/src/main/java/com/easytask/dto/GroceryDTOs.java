package com.easytask.dto;

import com.easytask.entity.GroceryItem;
import com.easytask.entity.GroceryList;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public final class GroceryDTOs {

    private GroceryDTOs() {
    }

    public record GroceryListRequest(
            @NotBlank(message = "Title is required")
            @Size(max = 150, message = "Title must be at most 150 characters")
            String title,

            @Size(max = 500, message = "Description must be at most 500 characters")
            String description,

            @Size(max = 20, message = "Color must be at most 20 characters")
            String color
    ) {
    }

    public record GroceryItemRequest(
            @NotBlank(message = "Item name is required")
            @Size(max = 200, message = "Item name must be at most 200 characters")
            String name,

            Double quantity,

            @Size(max = 30, message = "Unit must be at most 30 characters")
            String unit,

            @Size(max = 60, message = "Category must be at most 60 characters")
            String category
    ) {
    }

    public record GroceryItemResponse(
            Long id,
            String name,
            Double quantity,
            String unit,
            String category,
            boolean purchased,
            Long listId
    ) {
        public static GroceryItemResponse from(GroceryItem item) {
            return new GroceryItemResponse(item.getId(), item.getName(), item.getQuantity(),
                    item.getUnit(), item.getCategory(), item.isPurchased(),
                    item.getList() != null ? item.getList().getId() : null);
        }
    }

    public record GroceryListResponse(
            Long id,
            String title,
            String description,
            String color,
            int totalItems,
            int purchasedItems,
            int progress,
            List<GroceryItemResponse> items,
            LocalDateTime createdAt
    ) {
        public static GroceryListResponse from(GroceryList list) {
            List<GroceryItemResponse> items = list.getItems().stream()
                    .map(GroceryItemResponse::from)
                    .toList();
            int total = items.size();
            int purchased = (int) items.stream().filter(GroceryItemResponse::purchased).count();
            int progress = total == 0 ? 0 : (int) Math.round(purchased * 100.0 / total);
            return new GroceryListResponse(list.getId(), list.getTitle(), list.getDescription(),
                    list.getColor(), total, purchased, progress, items, list.getCreatedAt());
        }
    }
}
