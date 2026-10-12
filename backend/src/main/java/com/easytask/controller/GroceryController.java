package com.easytask.controller;

import com.easytask.dto.GroceryDTOs.GroceryItemRequest;
import com.easytask.dto.GroceryDTOs.GroceryItemResponse;
import com.easytask.dto.GroceryDTOs.GroceryListRequest;
import com.easytask.dto.GroceryDTOs.GroceryListResponse;
import com.easytask.service.GroceryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grocery-lists")
public class GroceryController {

    private final GroceryService groceryService;

    public GroceryController(GroceryService groceryService) {
        this.groceryService = groceryService;
    }

    @GetMapping
    public List<GroceryListResponse> getAll() {
        return groceryService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroceryListResponse createList(@Valid @RequestBody GroceryListRequest request) {
        return groceryService.createList(request);
    }

    @PutMapping("/{id}")
    public GroceryListResponse updateList(@PathVariable Long id, @Valid @RequestBody GroceryListRequest request) {
        return groceryService.updateList(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long id) {
        groceryService.deleteList(id);
    }

    @PostMapping("/{listId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public GroceryItemResponse addItem(@PathVariable Long listId, @Valid @RequestBody GroceryItemRequest request) {
        return groceryService.addItem(listId, request);
    }

    @PatchMapping("/items/{itemId}/toggle")
    public GroceryItemResponse toggleItem(@PathVariable Long itemId) {
        return groceryService.toggleItem(itemId);
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long itemId) {
        groceryService.deleteItem(itemId);
    }
}
